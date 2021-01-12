const evaluate = require('./evaluate');
const envCreate = require('./environment').create;

class Executer {


    constructor(intree) {
        this.tree = intree;
        this.executor = executorFunction(this.tree);

    }


    execute(state) {
        return this.executor.next(state);
    }



}

module.exports = Executer;

let ifExecutorFunction = function* ifExecutorFunction(tree) {

    yield "Nothing";

}

let executorFunction = function* executorFunction(tree) {

    //Run build loop
    while (true) {
        const environment = envCreate();
        for (let index = 0; index < tree.children.length; index++) {
            const mayBeStatement = tree.children[index];
            if (mayBeStatement.type == 'statement') {
                let result = null;
                try {
                    result = evaluate(mayBeStatement.children[0], environment);
                } catch (error) {

                    if(error === "Cannot evaluate:ifStatement"){
                        yield* ifExecutorFunction(mayBeStatement);
                    }
                    
                }

                if (result && result.constructor === evaluate.ERROR) {
                    throw (result);
                }
            } else if(mayBeStatement.type!="emptylines"){
                throw (mayBeStatement);
            }
            
        }


        yield "Nothing"
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