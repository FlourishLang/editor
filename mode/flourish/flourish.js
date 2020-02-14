// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function (mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  "use strict";



  function getTreeToken(tree, startPos, endPos) {

    let lowNode = tree, highNode = tree;
    let lowIndex = 0, highIndex = 0;

    while (lowIndex < highIndex||lowNode.children.length!=0) {
      if (lowIndex == highIndex) {
        
      }
    }


  }



  CodeMirror.defineMode("flourish", function () {

    return {

      token: function (stream, state) {

        if (this.treeSitterTree == null) {
          stream.next(/./);
          return null;
        }
        else {
          // while (stream.eat(/./));
          stream.next(/./);
          let len = stream.string.length
          return getTreeToken(this.treeSitterTree, { column: stream.pos, row: stream.lineOracle.line }, { column: stream.string.length, row: stream.lineOracle.line })
        }


      },

      treeSitterTree: null,
      closeBrackets: { pairs: "()[]{}\"\"" },
      lineComment: ";;",
      blockCommentStart: "#|",
      blockCommentEnd: "|#"
    };
  });

  CodeMirror.defineMIME("text/x-flourish", "flourish");

});
