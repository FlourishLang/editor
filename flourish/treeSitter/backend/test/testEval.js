var evaluate = require('../evaluate.js');
var assert = require('assert');


describe("Eval", () => {
    it('should print basic statement', () => {
        
        assert.equal(evaluate("print (+ 1 2)"),"print (+ 1 2)\n")
    });

    
});