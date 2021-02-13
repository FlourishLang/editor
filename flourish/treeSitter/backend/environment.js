
const evaluate = require("./evaluate.js")



function createMethod(fun) {
    return function* (args, env) {        
        let result = fun.apply(null, args);
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
