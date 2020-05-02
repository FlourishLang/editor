var evaluate = require('../evaluate.js');
var environment = require('../environment');
var assert = require('assert');
var Parser = require('../Parser.js');


describe("Eval", () => {

    it('should eval basic statement', () => {        
        let flourishParser = new Parser();  
        let tree = flourishParser.parse(" + 1 2\n");      
        assert.equal(evaluate(tree.children[0].children[0],environment.create()),3)
    });

    it('should fail to eval list', () => {        
        let flourishParser = new Parser();
        let tree = flourishParser.parse("1 2 3\n");  
            
        assert.equal(evaluate(tree.children[0].children[0],environment.create()).constructor.name,"ERROR")
    });
    

    
});