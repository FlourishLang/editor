var Parser = require('../Parser.js');
var assert = require('assert');

describe("Parser", () => {
    describe("Normal parsing",()=>{
        it('should parse statement', () => {
            let flourishParser = new Parser();
            let tree = flourishParser.parse("print (+1 2)") 
             assert.equal(tree.children[0].type,"statement");
        });

        it('should parse root node even in case of error', () => {
            let flourishParser = new Parser();
            let tree = flourishParser.parse("(") 
             assert.equal(tree.type,"source_file");
        });

        it('should detect empty lines', () => {
            let flourishParser = new Parser();
            let tree = flourishParser.parse("print (+ 1) \n\n print (+ 1)") 
            assert.equal(tree.children[0].type,"statement");
            assert.equal(tree.children[1].type,"emptylines");
            assert.equal(tree.children[2].type,"statement");
        });


    });
    



});
