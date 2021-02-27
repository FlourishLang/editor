const { evaluate, ERROR } = require('./evaluate');
const envCreate = require('./environment').create;
const bs = require("binary-search");

class Executer {


    constructor(intree) {
        this.tree = intree;
        this.desiredActiveBlock = null; //Block where execution cycle supposed to run
        this.activeBlock = null;
        this.reset();
    }


    execute(changes) {

        if (changes) {
            let mutatedRoot = changes.mutatedRoot;
            while (mutatedRoot.getParent() && mutatedRoot.type != "block") {
                mutatedRoot = mutatedRoot.getParent();
            }
            changes.mutatedRoot = mutatedRoot;
            if (this.activeBlock) {

                this.mutatedBlock = changes.leastCommonAncesestor(changes.mutatedRoot, this.activeBlock)
            }

        }


        do {
            let result = this.executor.next(Object.assign({}, changes, { mutatedBlock: this.mutatedBlock }));

            if (result.done == true) {
                this.reset();
            }

            if (result.value === "isDesiredActiveBlock")
                return null;

            if (result.value === "External mutation") //Todo redesign
                continue;

            if (result.value && result.value.activeBlock) {
                this.activeBlock = result.value.activeBlock;
            }

            return result.value;
        } while (true);



    }

    reset() {
        this.executor = executorFunction(this.tree);

    }



    _iterativeSearch(tree, linenum) {
        function adjustedEndPosition(end) {
            if (end.column == 0 && end.row > 0) {
                return { row: end.row - 1, column: end.column };
            }
            return end;
        }

        let cursor = tree;
        // Traverse untill root reaches to dead end 
        let lastBlock = null;


        while (cursor != null) {
            if (cursor.type == "block")
                lastBlock = cursor;

            let result = bs(cursor.children, linenum, (element, needle) => {

                if (adjustedEndPosition(element.endPosition).row < needle) {
                    return -1;
                } else if (element.startPosition.row > needle) {
                    return 1;
                } else if (element.startPosition.row <= needle
                    && adjustedEndPosition(element.endPosition).row >= needle) {

                    return 0;
                }
                throw "should not come here"

            });

            let resultnode = cursor.children[result];
            if (resultnode) {
                cursor = resultnode;
            } else {
                cursor = null;
            }

        }

        return lastBlock;


    }

    setActiveLine(linenumber) {
        return;

        let expectedActiveBlock = this._iterativeSearch(this.tree, linenumber);
        if (expectedActiveBlock != this.desiredActiveBlock) {//User want to run this block
            if (this.desiredActiveBlock)
                this.desiredActiveBlock.isDesiredActiveBlock = false;

            this.desiredActiveBlock = null;
            this.desiredActiveBlock = expectedActiveBlock;
            if (this.desiredActiveBlock)
                this.desiredActiveBlock.isDesiredActiveBlock = true;

        }
    }



}

module.exports = Executer;


function patchError(error, type, statement) {
    switch (type) {
        case "returnError":
            {
                if (!error.startPosition && statement) {
                    error.startPosition = statement.startPosition;
                    error.endPosition = statement.endPosition;
                }

                if (error.startPosition.line == error.endPosition.line
                    && error.startPosition.column == error.endPosition.column) {
                    error.startPosition.column -= 1;
                }
            }
            return error;
        case "catchError":

            return ERROR.fromAst(error, `Unhandled error in eval ${error}`);

        case "statementError":
            return ERROR.fromAst(error, 'Statement expected')

        case "internalException":
            if (!error.message)
                return error;
            return ERROR.fromAst(statement, error.message)
    }
}



let statementBlockExecutor = function* statementBlockExecutor(body, environment, startStatement) {

    let gotAnError = false;
    do {
        console.log(`Run :Block}`);

        gotAnError = false;
        let localEnvironment = envCreate(environment); //Every new try creates a new enviornment
        try {
            for (let index = startStatement; index < body.children.length; index++) {
                const mayBeStatement = body.children[index];
                if (mayBeStatement.type == 'statement') {
                    console.log(`Run :${mayBeStatement.getText()}`);
                    let result = null;
                    switch (mayBeStatement.children[0].type) {
                        case "expression":
                            result = yield* evaluate(mayBeStatement.children[0], localEnvironment);
                            break;
                        case "ifStatement":
                            yield* ifExecutorFunction(mayBeStatement, localEnvironment);
                            break;
                        default:
                            throw "Unhandled statment"
                            break;
                    }

                } else if (mayBeStatement.type != "emptylines") {
                    throw patchError(mayBeStatement, "statementError");
                }

            }

        } catch (error) {
            gotAnError = true;
            console.log(error);
            if (error instanceof ERROR)
                error.activeBlock = body;

            let result = yield error;

            if (result && result.mutatedBlock && result.mutatedBlock != body)
                throw "External mutation";


        }

        if (body.isDesiredActiveBlock && !gotAnError)
            yield "isDesiredActiveBlock"

    } while (gotAnError || body.isDesiredActiveBlock);


}



let ifExecutorFunction = function* ifExecutorFunction(tree, environment) {

    let expressionNode = tree.children[0].children[0].children[1];
    let result = yield* evaluate(expressionNode, environment);

    if (result != false) {
        let body = tree.children[0].children[0].children[3];
        yield* statementBlockExecutor(body, environment, 0)

    }


}

let executorFunction = function* executorFunction(tree) {
    console.log(`Run :Begin`);
    try {
        yield* statementBlockExecutor(tree.children[0], null, 0);
        if (tree.children.length == 2 && tree.children[1].type == "ERROR")
            throw patchError(tree.children[1], "statementError");
    } catch (error) {
        return error;
    }

    return null;

}

