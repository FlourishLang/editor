var Parser = require('../Parser.js');
var assert = require('assert');

describe("Parser", () => {
    describe("Normal parsing", () => {
        it('should parse statement', () => {
            let flourishParser = new Parser();
            let tree = flourishParser.parse("print (+1 2)")
            assert.equal(tree.children[0].type, "statement");
        });

        it('should parse root node even in case of error', () => {
            let flourishParser = new Parser();
            let tree = flourishParser.parse("(")
            assert.equal(tree.type, "source_file");
        });

        it('should detect empty lines', () => {
            let flourishParser = new Parser();
            let tree = flourishParser.parse("print (+ 1) \n\n print (+ 1)")
            assert.equal(tree.children[0].type, "statement");
            assert.equal(tree.children[1].type, "emptylines");
            assert.equal(tree.children[2].type, "statement");
        });

        it('should detect empty lines with template strings', () => {
            let flourishParser = new Parser();
            let text =
                `print (+ 1) 

print (+ 1)
`;
            let tree = flourishParser.parse(text);
            assert.equal(tree.children[0].type, "statement");
            assert.equal(tree.children[1].type, "emptylines");
            assert.equal(tree.children[2].type, "statement");
        });


    });

    describe("Incremental  parsing", () => {
        it('Restore original tree after undoing', () => {
            let text =
                `print (+ 1) 

print (+ 1)
`;
            let flourishParser = new Parser();
            let tree = flourishParser.parse(text);
            let treeString = JSON.stringify(tree);
            let updatedText =
                `print (+ 1) 
print 2
print (+ 1)
`
            let edit = {
                startIndex: 13,
                oldEndIndex: 13,
                newEndIndex: 20,
                startPosition: { row: 1, column: 0 },
                oldEndPosition: { row: 1, column: 0 },
                newEndPosition: { row: 1, column: 7 }
            }

            let treeChildren = tree.children.slice();
            let [newTree, ] = flourishParser.parseIncremental(updatedText, edit);


            let reverseEdit = {
                startIndex: 13,
                oldEndIndex: 20,
                newEndIndex: 13,
                startPosition: { row: 1, column: 0 },
                oldEndPosition: { row: 1, column: 7 },
                newEndPosition: { row: 1, column: 0 }
            }

            let [newTree2, ] = flourishParser.parseIncremental(text, reverseEdit);

            let treeString2 = JSON.stringify(newTree2);
            assert.equal(treeString2,treeString);
        });

        it('Should retain treeNode after edit', () => {
            let text =
                `print (+ 1) 

print (+ 1)
`;
            let flourishParser = new Parser();
            let tree = flourishParser.parse(text);
            let updatedText =
                `print (+ 1) 
print 2
print (+ 1)
`
            let edit = {
                startIndex: 13,
                oldEndIndex: 13,
                newEndIndex: 20,
                startPosition: { row: 1, column: 0 },
                oldEndPosition: { row: 1, column: 0 },
                newEndPosition: { row: 1, column: 7 }
            }

            let treeChildren = tree.children.slice();
            let [newTree, changes] = flourishParser.parseIncremental(updatedText, edit);
            assert.ok(tree === newTree)
            assert.ok(treeChildren[0] === newTree.children[0])
            assert.ok(treeChildren[1] !== newTree.children[1])
            assert.ok(treeChildren[2] === newTree.children[2])


        });






    });

})