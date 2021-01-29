const evaluate = require('./evaluate');
const envCreate = require('./environment').create;

class Executer {


    constructor(intree) {
        this.tree = intree;
        this.reset();
    }


    execute(state) {
        return this.executor.next(state);
    }

    reset(){
        this.executor = executorFunction(this.tree);

    }



}

module.exports = Executer;


function patchError(error, type) {
    switch (type) {
        case "returnError":
            {
                if (!error.startPosition) {
                    error.startPosition = mayBeStatement.startPosition;
                    error.endPosition = mayBeStatement.endPosition;
                }

                if (error.startPosition.line == error.endPosition.line
                    && error.startPosition.column == error.endPosition.column) {
                    error.startPosition.column -= 1;
                }
            }
            return error;
        case "catchError":

            return evaluate.ERROR.fromAst(mayBeStatement, `Unhandled error in eval ${error}`);

        case "statementError":
            return evaluate.ERROR.fromAst(mayBeStatement, 'Statement expected')
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
                    try {
                        result = evaluate(mayBeStatement.children[0], localEnvironment);
                    } catch (error) {

                        if (error === "Cannot evaluate:ifStatement") {
                            yield* ifExecutorFunction(mayBeStatement, localEnvironment);
                        } else {
                            throw patchError(error, "catchError");
                        }

                    }

                    if (result && result.constructor === evaluate.ERROR) {
                        throw patchError(result, "returnError");
                    }
                } else if (mayBeStatement.type != "emptylines") {
                    throw patchError(mayBeStatement, "statementError");
                }

            }

        } catch (error) {
            gotAnError = true;
            console.log(error);
            yield error;
        }


    } while (gotAnError);


}



let ifExecutorFunction = function* ifExecutorFunction(tree, environment) {
    let expressionNode = tree.children[0].children[0].children[1];
    if ((evaluate(expressionNode, environment) != false)) {
        let body = tree.children[0].children[0];
        yield* statementBlockExecutor(body,environment,3)

    }


}

let executorFunction = function* executorFunction(tree) {

    yield * statementBlockExecutor(tree,null,0);

}

