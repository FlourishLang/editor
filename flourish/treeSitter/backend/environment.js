
const evaluate = require("./evaluate.js")

function createMethod(fun) {
    return function (args) {
        let evaluatedArguments = args.map(evaluate);
        let result = fun.apply(null, evaluatedArguments);
        return result;
    }
}


let env = {
    'add': createMethod(function (params) {
        return Array.from(arguments).reduce((p, c) => p + c)
    }),

    'set': function (args) {

        let identifier = args[0].children[0].leafText
        env[identifier] = evaluate(args[1],env);

        return env[identifier];                
    }


}

module.exports = env;
