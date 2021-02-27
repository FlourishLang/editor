const assert = require('assert');
const Parser = require('../Parser');
const Executer = require('../Executer');

describe("Executor", () => {

  it('should return error', function () {
    let parser = new Parser();
    let outTree = parser.parse("set a  [ 3 1]\n");
    let executer = new Executer(outTree);
    let result = executer.execute()

    assert(result.message, 'Syntax error missing +');

  });


  it('should return error', function () {
    let parser = new Parser();
    let outTree = parser.parse("set a  3 1]\n");
    let executer = new Executer(outTree);
    let result = executer.execute()

    assert(result.message, 'Statement expected');

  });


  it('incremental parsing should result same output as normal parsing', function () {

    let parser1 = new Parser();
    let outTree1 = parser1.parse("set a   3 1]\n");
    let executer1 = new Executer(outTree1);
    let result1 = executer1.execute();

    let parser2 = new Parser();
    let outTree2 = parser2.parse("set a  [ 3 1]\n");
    let executer2 = new Executer(outTree2);
    let result2 = executer2.execute()

    assert.strictEqual(result2.message, 'Syntax error missing +');


    const newSourceCode = "set a   3 1]\n";
    let [outTree2Modifed, changes] = parser2.parseIncremental(newSourceCode,
      {
        startIndex: 7, oldEndIndex: 8, newEndIndex: 7,
        startPosition: { row: 0, column: 7 },
        oldEndPosition: { row: 0, column: 8 },
        newEndPosition: { row: 0, column: 7 },

      });
      assert.deepStrictEqual(outTree1, outTree2Modifed);

      
    let result3 = executer2.execute(changes);
    assert.strictEqual(result1.message, result3.message);
  });

});

