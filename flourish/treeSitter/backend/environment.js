
const evaluate = require("./evaluate.js")



function createMethod(fun) {
    return function (args, env) {
        let evaluatedArguments = args.map(i => evaluate(i, env));
        let result = fun.apply(null, evaluatedArguments);
        return result;
    }
}








module.exports.builtInEnv = {
    'add': createMethod(function () {
        return Array.from(arguments).reduce((p, c) => p + c)
    }),

    'subtract': createMethod(function () {
        return Array.from(arguments).reduce((p, c) => p - c)
    }),

};



module.exports.create = function name(superEnv) {
    if (!superEnv) {
        superEnv = module.exports.builtInEnv;
    }


    return {
        super: superEnv
    }


}
