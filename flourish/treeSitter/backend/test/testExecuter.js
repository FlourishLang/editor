const assert = require('assert');
const Parser = require('../Parser');
const Executer = require('../Executer');

describe("Executor", () => {

      it('should return error', function () {
        let parser = new Parser();
        let outTree = parser.parse("set a  [ 3 1]\n");
        let executer = new Executer(outTree);
        let result = executer.execute()
        
        assert(result.message,'Syntax error missing +');

      });


      it('should return error', function () {
        let parser = new Parser();
        let outTree = parser.parse("set a  3 1]\n");
        debugger
        let executer = new Executer(outTree);
        let result = executer.execute()
        
        assert(result.message,'Statement expected');

      });


      it('should return concecutive error', function () {

        let parser2 = new Parser();
        let outTree2 = parser2.parse("set a   3 1]\n");

        parser = new Parser();
        let outTree = parser.parse("set a  [ 3 1]\n");
        let executer = new Executer(outTree);
        let result = executer.execute()
        
        assert.strictEqual(result.message,'Syntax error missing +');


        const newSourceCode = "set a   3 1]\n";
        let [tree, changes] = parser.parseIncremental(newSourceCode,
          {
            startIndex: 7, oldEndIndex: 8, newEndIndex: 7,
            startPosition: { row: 0, column: 7 },
            oldEndPosition: { row: 0, column: 8 },
            newEndPosition: { row: 0, column: 7 },

          });

          assert.deepStrictEqual(tree,outTree2);
          let result2 = executer.execute();
          assert.strictEqual(result2.message,'Statement expected');




        });
  
});

