var evaluate = require('../evaluate.js');
var environment = require('../environment.js');
var assert = require('assert');
var Parser = require('../Parser.js');


describe("Eval", () => {

   
    it('should eval environment', () => {   
        let flourishParser = new Parser();  
        let tree = flourishParser.parse("add  1 2\n");      
        assert.equal(evaluate(tree.children[0].children[0],environment),3)
    });

    it('should eval add  (+2 1) 2', () => {   
        let flourishParser = new Parser();  
        let tree = flourishParser.parse("add  (+2 1) 2\n");      
        assert.equal(evaluate(tree.children[0].children[0],environment),5)
    });


    it('should eval   - 3  (add 1 3) 2', () => {   
        let flourishParser = new Parser();  
        let tree = flourishParser.parse("- 3  (add 1 3) 2\n");      
        assert.equal(evaluate(tree.children[0].children[0],environment),-3)
    });

    it('should eval set  - 3  (add 1 3) 2', () => {   
        debugger;
        let flourishParser = new Parser();  
        let tree = flourishParser.parse("set a  (add 1 3)\n");      
        evaluate(tree.children[0].children[0],environment);
        tree = flourishParser.parse("+ a 2");      
        assert.equal(evaluate(tree.children[0].children[0],environment),6);

    });


    
});