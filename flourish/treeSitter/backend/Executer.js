const evaluate = require('./evaluate');
const envCreate = require('./environment').create;

class Executer {


    constructor(intree) {
        this.tree = intree;
        this.reset();
    }


    execute(state) {

        do {
            let result = this.executor.next(state);
            if(result.value ==="External mutation") //Todo redesign
                    continue;

            if (result.done == true) {
                this.reset();
            }
            return result.value;
        } while (true);
        


    }

    reset(){
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

            return evaluate.ERROR.fromAst(error, `Unhandled error in eval ${error}`);

        case "statementError":
            return evaluate.ERROR.fromAst(error, 'Statement expected')
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
                            throw patchError(error, "catchError", mayBeStatement);
                        }

                    }

                    if (result && result.constructor === evaluate.ERROR) {
                        throw patchError(result, "returnError", mayBeStatement);
                    }
                } else if (mayBeStatement.type != "emptylines") {
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
    let result = evaluate(expressionNode, environment);
    if (result && result.constructor === evaluate.ERROR) {
        throw patchError(result, "returnError");
    }

    if (result != false) {
        let body = tree.children[0].children[0].children[3];
        yield* statementBlockExecutor(body, environment, 0)

    }


}

let executorFunction = function* executorFunction(tree) {

    try {
        yield * statementBlockExecutor(tree.children[0],null,0);  
        if(tree.children.length == 2 && tree.children[1].type == "ERROR")
            throw patchError(tree.children[1], "statementError");
    } catch (error) {
        return error;
    }
    
    return null;

}

