
const evaluate = require("./evaluate.js")

class ERROR {
    constructor(message){
        this.message = message;
    }
}


function createMethod(fun) {
    return function (args,env) {
        let evaluatedArguments = args.map(i=>evaluate(i,env));
        let result = fun.apply(null, evaluatedArguments);
        return result;
    }
}



let env = {
    'add': createMethod(function () {
        return Array.from(arguments).reduce((p, c) => p + c)
    }),
    //TODO: have a separate namespace for special forms
    'set': function (args) {

        let identifier = args[0].children[0].leafText
        if(env[identifier] == undefined)
        {
            env[identifier] = evaluate(args[1],env);
            return env[identifier];                
        }else
        {
            return new ERROR(`Can't reset identifier: ${identifier}` )
        }            
        
    },
    'get': function (arg) {
        let identifier = arg.leafText;
        if(env[identifier] == undefined)
        {
             return new ERROR(`Can't find identifier: ${identifier}` );
        }else
        {
            return env[identifier];
        }            
        
    }


}

module.exports = env;
