var evaluate = require('../evaluate.js');
var environment = require('../environment.js');
var assert = require('assert');
var Parser = require('../Parser.js');


describe("builtIn", () => {

    it('should have add', () => {   
        let flourishParser = new Parser();  
        let tree = flourishParser.parse("add  1 2\n");      
        assert.equal(evaluate(tree.children[0].children[0],environment.create()),3)
    });

    it('should have subtract add', () => {   
        let flourishParser = new Parser();  
        let tree = flourishParser.parse("subtract  1 2\n");      
        assert.equal(evaluate(tree.children[0].children[0],environment.create()),-1)
    });


    
});