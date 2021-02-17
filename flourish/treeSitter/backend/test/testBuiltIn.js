var evaluate = require('../evaluate.js').evaluate;
var environment = require('../environment.js');
var assert = require('assert');
var Parser = require('../Parser.js');


describe("builtIn", () => {

    it('should have add', () => {   
        let flourishParser = new Parser();  
        let tree = flourishParser.parse("add  1 2\n");      
        assert.equal(evaluate(tree.children[0].children[0].children[0],environment.create()).next().value,3)
    });

    // it('should return error while trying to add undefined', () => {   
    //     let flourishParser = new Parser();  
    //     let tree = flourishParser.parse("add  a 2\n");   
    //     assert.equal(evaluate(tree.children[0].children[0],environment.create()).constructor.name,"ERROR")
    // });


    it('should have subtract add', () => {   
        let flourishParser = new Parser();  
        let tree = flourishParser.parse("subtract  1 2\n");      
        assert.equal(evaluate(tree.children[0].children[0].children[0],environment.create()).next().value,-1)
    });

    it('should eval add  [+2 1] 2', () => {   
        let flourishParser = new Parser();  
        let tree = flourishParser.parse("add  [+ 2 1] 2\n");     
        assert.equal(evaluate(tree.children[0].children[0].children[0],environment.create()).next().value,5)
    });


    it('should eval   - 3  [add 1 3] 2', () => {   
        let flourishParser = new Parser();  
        let tree = flourishParser.parse("- 3  [add 1 3] 2\n");      
        assert.equal(evaluate(tree.children[0].children[0].children[0],environment.create()).next().value,-3)
    });


    
});