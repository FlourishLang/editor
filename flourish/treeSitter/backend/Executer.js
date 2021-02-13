const { evaluate, ERROR } = require('./evaluate');
const envCreate = require('./environment').create;

class Executer {


    constructor(intree) {
        this.tree = intree;
        this.reset();
    }


    execute(state) {

        do {
            let result = this.executor.next(state);

            if (result.done == true) {
                this.reset();
            }
            if (result.value === "External mutation") //Todo redesign
                continue;

            return result.value;
        } while (true);



    }

    reset() {
        this.executor = executorFunction(this.tree);

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
        gotAnError = false;
        let localEnvironment = envCreate(environment); //Every new try creates a new enviornment
        try {
            for (let index = startStatement; index < body.children.length; index++) {
                const mayBeStatement = body.children[index];
                if (mayBeStatement.type == 'statement') {
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

                }else if (mayBeStatement.type != "emptylines") {
                    throw patchError(mayBeStatement, "statementError");
                }

            }

        } catch (error) {
            gotAnError = true;
            console.log(error);

            yield error;

            if (body.isMutated == false)
                throw "External mutation";


        }


    } while (gotAnError);


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

    try {
        yield* statementBlockExecutor(tree.children[0], null, 0);
        if (tree.children.length == 2 && tree.children[1].type == "ERROR")
            throw patchError(tree.children[1], "statementError");
    } catch (error) {
        return error;
    }

    return null;

}

