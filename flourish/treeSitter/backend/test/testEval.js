var evaluate = require('../evaluate.js').evaluate;
var environment = require('../environment');
var assert = require('assert');
var Parser = require('../Parser.js');


describe("Eval", () => {

    it('should eval basic statement', () => {        
        let flourishParser = new Parser();  
        let tree = flourishParser.parse(" + 1 2\n");      
        assert.equal(evaluate(tree.children[0].children[0].children[0],environment.create()).next().value,3)
    });

    it('should fail to eval list', () => {        
        let flourishParser = new Parser();
        let tree = flourishParser.parse("1 2 3\n");  
        try {
            evaluate(tree.children[0].children[0].children[0],environment.create()).next()    
        } catch (error) {
            assert.ok(error);
        }
        
        
    });

    it('should fail to eval incomplete expression', () => {        

        let flourishParser = new Parser();
        let tree = flourishParser.parse("+ 1 [+ 2 3\n");  
        try {
            evaluate(tree.children[0].children[0].children[0],environment.create()).next()        
        } catch (error) {
            assert.strictEqual(error.message , "Syntax error missing ]")

        }
        
    });
    

    
});