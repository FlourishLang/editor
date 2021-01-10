const evaluate = require('./evaluate');
const envCreate = require('./environment').create;

class Executer{


    constructor(intree){
        this.tree = intree;
        this.executor = executorFunction(this.tree);

    }


    execute(state){
        return this.executor.next(state);
    }



}

module.exports = Executer;


let executorFunction = function * executorFunction(tree) {
    
}