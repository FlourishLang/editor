var Parser = require('../Parser.js');
var assert = require('assert');
var print = require('../print.js');


describe("Printer", () => {
    it('should print basic statement', () => {
        let flourishParser = new Parser();
        let tree = flourishParser.parse("print (+ 1 2)")        
        assert.equal(print(tree),"print (+ 1 2)\n")
    });

    it('should fix alignment', () => {
        let flourishParser = new Parser();        
        assert.equal(print(flourishParser.parse("print ( + 1 2)") ),"print (+ 1 2)\n")
        assert.equal(print(flourishParser.parse("print( + 1 2)") ),"print (+ 1 2)\n")

    });

});