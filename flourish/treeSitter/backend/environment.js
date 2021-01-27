
const evaluate = require("./evaluate.js")



function createMethod(fun) {
    return function (args, env) {
        let evaluatedArguments = args.map(i => evaluate(i, env));
        let anError = evaluatedArguments.find(i=>i.constructor.name =="ERROR")
        if(anError)
            return anError;
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
    'equals': createMethod(function () {
        return Array.from(arguments).reduce((p, c) => p == c?p:false)
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
