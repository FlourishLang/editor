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

let ifExecutorFunction = function* ifExecutorFunction(tree, environment) {
    let expressionNode = tree.children[0].children[0].children[1];
    if ((evaluate(expressionNode, environment) != false)) {
        let gotAnError = false;
        do {
            gotAnError = false;
            let localEnvironment = envCreate(environment); //Every new try creates a new enviornment
            try {
                let ifbody = tree.children[0].children[0];
                for (let index = 3; index < ifbody.children.length; index++) {
                    const mayBeStatement = ifbody.children[index];
                    if (mayBeStatement.type == 'statement') {
                        let result = null;
                        try {
                            result = evaluate(mayBeStatement.children[0], localEnvironment);
                        } catch (error) {

                            if (error === "Cannot evaluate:ifStatement") {
                                yield* ifExecutorFunction(mayBeStatement, localEnvironment);
                            } else {
                                throw patchError(error,"catchError");
                            }

                        }

                        if (result && result.constructor === evaluate.ERROR) {
                            throw patchError(result,"returnError");
                        }
                    } else if (mayBeStatement.type != "emptylines") {
                        throw patchError(mayBeStatement,"statementError");
                    }

                }

            } catch (error) {
                gotAnError = true;
                console.log(error);
                yield error;
            }


        } while (gotAnError);


    }


}

let executorFunction = function* executorFunction(tree) {

    //Run build loop
    const environment = envCreate();
    for (let index = 0; index < tree.children.length; index++) {
        const mayBeStatement = tree.children[index];
        if (mayBeStatement.type == 'statement') {
            let result = null;
            try {
                result = evaluate(mayBeStatement.children[0], environment);
            } catch (error) {

                if (error === "Cannot evaluate:ifStatement") {
                    yield* ifExecutorFunction(mayBeStatement, environment);
                }

            }

            if (result && result.constructor === evaluate.ERROR) {
                throw (result);
            }
        } else if (mayBeStatement.type != "emptylines") {
            throw (mayBeStatement);
        }

    }



}


/*

 tree.children = map(mayBeStatement => {
            if (mayBeStatement.type == 'statement') {
                try {
                    let error = evaluate(mayBeStatement.children[0], env);
                    if (error && error.constructor === evaluate.ERROR) {
                        if (!error.startPosition) {
                            error.startPosition = mayBeStatement.startPosition;
                            error.endPosition = mayBeStatement.endPosition;
                        }

                        if (error.startPosition.line == error.endPosition.line
                            && error.startPosition.column == error.endPosition.column) {
                            error.startPosition.column -=1;
                        }

                        errors.push(error);
                    }
                } catch (error) {
                    console.log("Unhandled error in eval", error);
                    errors.push(evaluate.ERROR.fromAst(mayBeStatement, `Unhandled error in eval ${error}`));
                }

            } else if (mayBeStatement.type == 'ERROR') {
                errors.push(evaluate.ERROR.fromAst(mayBeStatement, 'Statement expected'));
            }
            return mayBeStatement;
        });

*/