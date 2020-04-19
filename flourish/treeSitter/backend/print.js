const FNode = require("./FNode")

function print(fNode) {

    switch (fNode.type) {
        case "source_file":
            return fNode.children.map(print).join();
            break;
        case "statement":
            return print(fNode.children[0]) + "\n";
            break;
        case "expression":
            return print(fNode.children[0]) + " "
                + fNode.children.slice(1).map(print).join(" ");
            break;
        case "cmd":
            return print(fNode.children[0]);
            break;
        case "identifier":
            return fNode.leafText;
            break;
        case "argument":
            return print(fNode.children[0]);
            break;
        case "compoundExpression":
            return "(" + print(fNode.children[1]) + ")";
            break;
        case "operator":
            return fNode.children[0].leafText;
            break;
        case "number":
            return fNode.leafText;
            break;
        default:
            return fNode.type;
            break;
    }


}

module.exports = print;