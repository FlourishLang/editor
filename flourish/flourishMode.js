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







  /* This is the quick and dirty way of adding treesitter support codemirror. 
  The goal for now is only for get the system working; no efforts for optimisation being 
  done here.
  */

  function getTreeToken(tree, startPos, endPos) {

    function comparePos(pos1, pos2) {
      if (pos1.row != pos2.row)
        return pos1.row - pos2.row;

      return pos1.column - pos2.column;

    }


    function walk(tree) {
      if (comparePos(tree.endPosition, startPos) <= 0) {
        return undefined;
      }



      if (tree.type == "cmd")
        return { type: "keyword", end: tree.endPosition };
      if (tree.type == "argument" && tree.children.length == 1 && tree.children[0].type == "identifier") {
        return { type: "variable", end: tree.endPosition };
      }
      if (tree.type == "(" || tree.type == ")") {
        return { type: "bracket", end: tree.endPosition };
      }
      if (tree.type == "string") {
        return { type: "string", end: tree.endPosition };
      }

      if (tree.type == "number")
        return { type: "number", end: tree.endPosition };


      if (tree.type == "symbol")
        return { type: "keyword", end: tree.endPosition };
      if (tree.type == "string")
        return { type: "string", end: tree.endPosition };



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




  
function flourishHint(codemirror,options) {

  const cursor = codemirror.getCursor()
      const token = codemirror.getTokenAt(cursor)
      const start = token.start
      const end = cursor.ch
      const line = cursor.line
      // const currentWord= token.string
      let lineContent = codemirror.getDoc().getLine(line);
      

      
      if(lineContent.endsWith("if")){
        let data = {
          list: ["if (> 1 2):\n\nend\n"],
          from: CodeMirror.Pos(line, 0),
          to: CodeMirror.Pos(line, lineContent.length)
        };

        CodeMirror.on(data,"pick",function(){
          codemirror.setCursor({line: line+1, ch: 0})

        });
        return data;
      }

   return {
    list: [],
    from: CodeMirror.Pos(line, start),
    to: CodeMirror.Pos(line, end)
  };
}



  CodeMirror.defineMode("flourish", function () {

    let flourishMode = {

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
              while (stream.pos < res.end.column) {
                stream.next();
                if (stream.eol())
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
      blockCommentEnd: "|#",

      lintProvider: function (text, options) {
        if(!this.treeSitterTree)
          return [];

        return this.treeSitterTree.errors.map(e=>({
          from: CodeMirror.Pos(e.startPosition.row, e.startPosition.column),
          to: CodeMirror.Pos(e.endPosition.row, e.endPosition.column),
          message: e.message,
          severity: "error"
        }))
        
      }


    };

    CodeMirror.registerHelper("lint", "flourish",flourishMode.lintProvider.bind(flourishMode))
    CodeMirror.registerHelper("hint", "flourish", flourishHint);

    return flourishMode;

  });

  CodeMirror.defineMIME("text/x-flourish", "flourish");



});
