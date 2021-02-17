var evaluate = require('../evaluate.js').evaluate;
var env = require('../environment.js');
var assert = require('assert');
var Parser = require('../Parser.js');


describe("Eval", () => {

  

    it('should eval set  - 3  [add 1 3] 2', () => {   
        let environment = env.create();
        let flourishParser = new Parser();  
        let tree = flourishParser.parse("set a  [add 1 3]\n");   
        evaluate(tree.children[0].children[0].children[0],environment).next();
        tree = flourishParser.parse("+ a 2");      
        assert.equal(evaluate(tree.children[0].children[0].children[0],environment).next().value,6);

    });

    it('should fail setting same variable 2nd time', () => {   
        let flourishParser = new Parser();  
        let environment = env.create();
        let tree = flourishParser.parse("set a  [add 1 3]\n");      
        evaluate(tree.children[0].children[0].children[0],environment).next();
        tree = flourishParser.parse("set a  3000\n");      

        try {
            evaluate(tree.children[0].children[0].children[0],environment).next()    
        } catch (error) {
            assert.strictEqual(error.message,"Can't reset identifier: a");
        }
        

    });


    it('should not fail setting same variable 2nd time on sub environment ', () => {   
        let flourishParser = new Parser();  
        let environment = env.create();
        let tree = flourishParser.parse("set a  [add 1 3]\n");      
        evaluate(tree.children[0].children[0].children[0],environment).next();

        let subEnvironment = env.create(environment);
        tree = flourishParser.parse("set a  [add a 34]\n");      

        assert.strictEqual(evaluate(tree.children[0].children[0].children[0],subEnvironment).next().value,38);

    });



    it('should set result last val', () => {   
        let environment = env.create();
        let flourishParser = new Parser();  
        let tree = flourishParser.parse("set b  4\n");      
        assert.equal(evaluate(tree.children[0].children[0].children[0],environment).next().value,4);

    });


    it('should set result last val', () => {   
        let flourishParser = new Parser();  
        let environment = env.create();


        let tree = flourishParser.parse("set b [set a 4]\n");      

        assert.equal(evaluate(tree.children[0].children[0].children[0],environment).next().value,4);

    });





    
});