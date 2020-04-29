const Parser = require("./Parser.js");


function evaluate(ast,env) {
    switch (ast.type) {
        case "expression":
            {
                let cmd = evaluate(ast.children[0],env);
                args = ast.children.slice(1);
                return cmd.call(null, args);
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
            return env[ast.leafText];

        case "cmd": case "operator": case 'argument':
            return evaluate(ast.children[0],env);

        case "+":
            return function add(args) {
                return args.map(i=>evaluate(i,env)).reduce((p, c) => p + c);
            }
        case "-":
            return function add(args) {
                return args.map(i=>evaluate(i,env)).reduce((p, c) => p - c);
            }
        case "number":
            return parseInt(ast.leafText);


        default:
            throw ("Cannot evaluate:" + ast.type);
            break;
    }
}

module.exports = evaluate;