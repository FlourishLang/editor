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




  function startTreeSitterParsing(cm) {
    var state = cm.state.treeSitterParse, options = state.options;
    state.socket = io('http://localhost:3000');
    state.socket.on('connect', function () {
      state.socket.emit('parse', cm.getValue())
      state.socket.on('parseComplete', function (treeInfo) {
        console.log("parsecomplete", treeInfo);
        if (cm.getMode().hasOwnProperty("treeSitterTree"))
          cm.getMode().treeSitterTree = treeInfo;
        cm.operation(function () {
          cm.getMode().treeSitterTree = treeInfo;
          cm.refreshPart()
        })


      });

    });


  }

  function updateTreeSitterParsing(cm, newtext, startIndex, oldEndIndex, newEndIndex, from, to, newEndPosition) {
    var state = cm.state.treeSitterParse, options = state.options;
    state.socket.emit('parseIncremental', { newtext, startIndex, oldEndIndex, newEndIndex, from, to, newEndPosition });

  }

  function onChange(cm, change) {
    var state = cm.state.treeSitterParse;
    if (!state) return;

    if (cm.getMode().hasOwnProperty("treeSitterTree") && cm.getMode().treeSitterTree) {


      let startIndex = cm.doc.indexFromPos(change.from);
      let oldEndIndex = startIndex + change.removed.join('\n').length;
      let newEndIndex = startIndex + change.text.join('\n').length;
      let newEndPosition = cm.doc.posFromIndex(newEndIndex)

      let newtext = cm.doc.getValue();
      updateTreeSitterParsing(cm, newtext, startIndex, oldEndIndex, newEndIndex, change.from, change.to, newEndPosition);


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
