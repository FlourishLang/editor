
class ERROR {
    constructor(message) {
        this.message = message;
    }
}

let specialEnv = {

    'set': function (args, env) {

        let identifier = args[0].children[0].leafText
        if (env[identifier] == undefined) {
            env[identifier] = evaluate(args[1], env);
            return env[identifier];
        } else {
            return new ERROR(`Can't reset identifier: ${identifier}`)
        }

    },
    'get': function get(arg, env) {
        let identifier = arg.leafText;
        if (env[identifier] == undefined) {
            if (env.super)
                return get(arg, env.super);
            return new ERROR(`Can't find identifier: ${identifier}`);
        } else {
            return env[identifier];
        }

    }


}



function evaluate(ast,env) {
    switch (ast.type) {
        case "expression":
            {
                let cmd = evaluate(ast.children[0],env);
                if (cmd.constructor == ERROR) {
                    return cmd;
                }
                args = ast.children.slice(1);
                return cmd.call(null, args,env);
            }
        case "compoundExpression":
            {
                let actualChildren = ast.children.slice(1);
                actualChildren.pop();
                let result = evaluate(actualChildren[0],env);
                return result;
            }
            break;
            
        case "identifier": 
            if(specialEnv[ast.leafText])
                return specialEnv[ast.leafText];
            return specialEnv["get"].call(this,ast,env);

        case "cmd": case "operator": case 'argument':
            return evaluate(ast.children[0],env);

        case "+":
            return specialEnv["get"].call(this,{leafText:"add"},env);
        case "-":
            return specialEnv["get"].call(this,{leafText:"subtract"},env);

        case "number":
            return parseInt(ast.leafText);


        default:
            throw ("Cannot evaluate:" + ast.type);
            break;
    }
}

module.exports = evaluate;