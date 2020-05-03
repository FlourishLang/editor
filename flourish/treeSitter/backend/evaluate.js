
class ERROR {
    constructor(message, startPosition, endPosition) {
        this.message = message;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
    }

    static fromAst(ast, message) {
        return new ERROR(message, ast.startPosition, ast.endPosition);
    }
}

let specialEnv = {

    'set': function (args, env) {

        if (args.length != 2) {
            if (args.length) {
                return new ERROR(`Mismatching no of argument for set(${args.length}) expected 2`,
                    args[0].startPosition, args[args.length - 1].endPosition);
            } else {
                return new ERROR(`Mismatching no of argument for set(${args.length}) expected 2`)
            }
        }



        let identifier = args[0].children[0].leafText;
        if (args[0].children[0].type !== "identifier") {
            return ERROR.fromAst(args[0].children[0], `identifier expected found ${args[0].children[0].type}`);
        }

        if (env[identifier] == undefined) {
            env[identifier] = evaluate(args[1], env);
            return env[identifier];
        } else {
            return ERROR.fromAst(args[0].children[0], `Can't reset identifier: ${identifier}`);
        }

    },
    'get': function get(arg, env) {
        let identifier = arg.leafText;
        if (env[identifier] == undefined) {
            if (env.super)
                return get(arg, env.super);
            return ERROR.fromAst(arg, `Can't find identifier: ${identifier}`);

        } else {
            return env[identifier];
        }

    }


}



function evaluate(ast, env) {

    if (ast.hasError) {
        function subject(ast) {
            if (ast.type == "ERROR") {
                return ast.children[0].leafText;
            } else if ("" === ast.leafText) {
                return ast.type;
            } else if (ast.type === ast.leafText) {
                return ast.leafText;
            } else {
                return `${ast.type}(${ast.leafText})`
            }
        }
        let error = ast.children.find(i => i.isMissingNode || i.type === "ERROR");
        if (error) {
            if (error.isMissingNode) {
                return new ERROR(`Syntax error missing ${subject(error)}`, error.startPosition, error.endPosition);
            } else {
                return new ERROR(`Syntax error unexpected ${subject(error)}`, error.startPosition, error.endPosition);
            }
        }
    }




    switch (ast.type) {
        case "expression":
            {
                let cmd = evaluate(ast.children[0], env);
                if (cmd.constructor == ERROR) {
                    return cmd;
                }
                args = ast.children.slice(1);
                return cmd.call(null, args, env);
            }
        case "compoundExpression":
            {
                let actualChildren = ast.children.slice(1);
                actualChildren.pop();
                let result = evaluate(actualChildren[0], env);
                return result;
            }
            break;

        case "identifier":
            if (specialEnv[ast.leafText])
                return specialEnv[ast.leafText];
            return specialEnv["get"].call(this, ast, env);

        case "cmd": case "operator": case 'argument':
            return evaluate(ast.children[0], env);

        case "+":
            return specialEnv["get"].call(this, { leafText: "add" }, env);
        case "-":
            return specialEnv["get"].call(this, { leafText: "subtract" }, env);

        case "number":
            return parseInt(ast.leafText);

        case "ERROR":
            return ERROR.fromAst(ast, "Syntax error");



        default:
            throw ("Cannot evaluate:" + ast.type);
            break;
    }
}

evaluate.ERROR = ERROR;
module.exports = evaluate;