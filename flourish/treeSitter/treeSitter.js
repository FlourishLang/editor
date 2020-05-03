// TreeSitter-CodeMirror addon, copyright (c) by Shakthi Prasad GS and others
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
  if (!window.io) {
    console.error("Unable to get socket.io, failing");
    return;
  }



  function treeSitterParseState(cm, options, hasGutter) {
    this.options = options;
    this.timeout = null;
    this.waitingFor = 0
  }

  function parseOptions(_cm, options) {
    return options;
  }


  function calculateFullRange(changed, edited) {
    let rangeArray = changed.slice();
    rangeArray.push(edited);
    return rangeArray.reduce((accumelater, current) => {
      return {
        startIndex: Math.min(accumelater.startIndex, current.startIndex),
        endIndex: Math.max(accumelater.endIndex, current.endIndex),
      }
    })


  }

  let editmark=null;
  let changemarks=null;


  function startTreeSitterParsing(cm) {
    var state = cm.state.treeSitterParse, options = state.options;

    window.onbeforeunload = ()=>{
      if (state && state.socket) {
        state.socket.disconnect();
      }
    };
  

    
    state.socket = io('http://localhost:3000');
    state.socket.on('connect', function () {
      state.socket.emit('parse', cm.getValue())
      state.socket.on('parseComplete', function (treeInfo) {
        

        if(editmark){
          editmark.clear();
          editmark = null;
        }
        if (treeInfo.changes) {
          editmark = cm.doc.markText(
            {
              line: treeInfo.changes.editedRange.startPosition.row,
              ch: treeInfo.changes.editedRange.startPosition.column
            },
            {
              line: treeInfo.changes.editedRange.endPosition.row,
              ch: treeInfo.changes.editedRange.endPosition.column
            },
            { className: "edited-background" });
        }
        //

        if (changemarks) {
          changemarks.forEach(item=>item.clear());
          changemarks=null;
        }

        if (treeInfo.changes) {
          changemarks=[];
          treeInfo.changes.changedRange.forEach(item=>{
            changemarks.push(  cm.doc.markText(
              {
                line: item.startPosition.row,
                ch: item.startPosition.column
              },
              {
                line: item.endPosition.row,
                ch: item.endPosition.column
              },
              { className: "changed-background" }));
          });

        }

        if (cm.getMode().hasOwnProperty("treeSitterTree"))

        cm.operation(function () {
          cm.getMode().treeSitterTree = treeInfo;
          cm.performLint();

          if (treeInfo.changes) {

            let finalrange = calculateFullRange(treeInfo.changes.changedRange, treeInfo.changes.editedRange);
            let finalStartPos = cm.doc.posFromIndex(finalrange.startIndex);
            let finalEndPos = cm.doc.posFromIndex(finalrange.endIndex);
            cm.refreshPart(finalStartPos.line, finalEndPos.line+1);
          } else {
            cm.refreshPart();

          }
        })


      });

    });


  }

  function updateTreeSitterParsing(cm, newtext, posInfo) {
    var state = cm.state.treeSitterParse, options = state.options;
    state.socket.emit('parseIncremental', { newtext, posInfo });

  }

  function treeEditForEditorChange(change, doc) {
    const oldLineCount = change.removed.length;
    const newLineCount = change.text.length;
    const lastLineLength = change.text[newLineCount - 1].length;

    const startPosition = { row: change.from.line, column: change.from.ch };
    const oldEndPosition = { row: change.to.line, column: change.to.ch };
    const newEndPosition = {
      row: startPosition.row + newLineCount - 1,
      column: newLineCount === 1
        ? startPosition.column + lastLineLength
        : lastLineLength
    };

    const startIndex = doc.indexFromPos(change.from);
    let newEndIndex = startIndex + newLineCount - 1;
    let oldEndIndex = startIndex + oldLineCount - 1;
    for (let i = 0; i < newLineCount; i++) newEndIndex += change.text[i].length;
    for (let i = 0; i < oldLineCount; i++) oldEndIndex += change.removed[i].length;

    return {
      startIndex, oldEndIndex, newEndIndex,
      startPosition, oldEndPosition, newEndPosition
    };
  }

  function onChange(cm, change) {
    var state = cm.state.treeSitterParse;
    if (!state) return;

    if (cm.getMode().hasOwnProperty("treeSitterTree") && cm.getMode().treeSitterTree) {


      // let startIndex = cm.doc.indexFromPos(change.from);
      // let oldEndIndex = startIndex + change.removed.join('\n').length;
      // let newEndIndex = startIndex + change.text.join('\n').length;
      // let newEndPosition = cm.doc.posFromIndex(newEndIndex)

      let newtext = cm.doc.getValue();
      updateTreeSitterParsing(cm, newtext, treeEditForEditorChange(change, cm.doc));


    }



  }



  CodeMirror.defineOption("treeSitter", false, function (cm, val, old) {
    if (old && old != CodeMirror.Init) {
      clearMarks(cm);
      if (cm.state.treeSitterParse.options.treeSitterParseOnChange !== false)
        cm.off("change", onChange);
      clearTimeout(cm.state.treeSitterParse.timeout);

      delete cm.state.treeSitterParse;
    }

    if (val) {
      var state = cm.state.treeSitterParse = new treeSitterParseState(cm, parseOptions(cm, val), false);
      if (state.options.treeSitterParseOnChange !== false)
        cm.on("change", onChange);
      CodeMirror.defineDocExtension("treeSitterTree", {})
      CodeMirror.defineInitHook(function () {
        startTreeSitterParsing(cm);
      })
    }
  });

  CodeMirror.defineExtension("performTreeSitterParse", function () {
    if (this.state.treeSitterParse) startTreeSitterParsing(this);
  });
});
