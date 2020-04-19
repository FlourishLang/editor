const Parser = require("./Parser.js")
const print = require("./print.js");

function evaluate(inputString) {
    let flourishParser = new Parser();
    let tree = flourishParser.parse(inputString)
    return print(tree);
}

module.exports = evaluate;