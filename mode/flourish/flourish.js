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

    function comparePos(pos1, pos2) {
      if (pos1.column != pos2.column)
        return pos1.column - pos2.column;

      return pos1.row - pos2.row;

    }

    function walk(tree) {
      if (comparePos(tree.endPosition, startPos) < 0) {
        return undefined;
      }

      if (tree.type == "ERROR")
        return { type: "error", end: tree.endPosition };

      if (tree.children && tree.children.length) {
        for (let index = 0; index < tree.children.length; index++) {
          const element = tree.children[index];
          let result = walk(element);
          if (result != undefined) {
            return result;
          }
        }

      }
    }


    return walk(tree);


  }



  CodeMirror.defineMode("flourish", function () {

    return {

      token: function (stream, state) {

        if (this.treeSitterTree == null) {
          stream.next();
          return null;
        }
        else {
          // while (stream.eat(/./));
          //console.log(this.treeSitterTree);
          let len = stream.string.length
          let res = getTreeToken(this.treeSitterTree, { column: stream.pos, row: stream.lineOracle.line }, { column: stream.string.length, row: stream.lineOracle.line })
          if (res !== undefined) {
            if (stream.lineOracle.line == res.end.row) {
              while ( stream.pos <= res.end.column )
                {
                  stream.next();
                  if(stream.eol())
                    break;
                }
            } else {
              stream.skipToEnd();
            }

            return res.type;
          }
          stream.next();
          return null;

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
