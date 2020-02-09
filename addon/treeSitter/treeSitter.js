// TreeSitter-CodeMirror addon, copyright (c) by Shakthi Prasad GS and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
      mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
      define(["../../lib/codemirror"], mod);
    else // Plain browser env
      mod(CodeMirror);
  })(function(CodeMirror) {
    "use strict";
    
    function treeSitterParseState(cm, options, hasGutter) {
      this.options = options;
      this.timeout = null;
      this.waitingFor = 0
    }
  
    function parseOptions(_cm, options) {
      return options;
    }
  
    
    function treeSitterParseAsync(cm, getAnnotations, passOptions) {
      var state = cm.state.treeSitterParse
      var id = ++state.waitingFor
      function abort() {
        id = -1
        cm.off("change", abort)
      }
      cm.on("change", abort)
      getAnnotations(cm.getValue(), function(annotations, arg2) {
        cm.off("change", abort)
        if (state.waitingFor != id) return
        if (arg2 && annotations instanceof CodeMirror) annotations = arg2
        cm.operation(function() {updateTreeSitterParsing(cm, annotations)})
      }, passOptions, cm);
    }
  
    function startTreeSitterParsing(cm) {
      var state = cm.state.treeSitterParse, options = state.options;
      /*
       * Passing rules in `options` property prevents JSHint (and other treeSitterParseers) from complaining
       * about unrecognized rules like `onupdateTreeSitterParsing`, `delay`, `treeSitterParseOnChange`, etc.
       */
      var passOptions = options.options || options;
      var getAnnotations = options.getAnnotations || cm.getHelper(CodeMirror.Pos(0, 0), "treeSitterParserLang");
      if (!getAnnotations) return;
      if (options.async || getAnnotations.async) {
        treeSitterParseAsync(cm, getAnnotations, passOptions)
      } else {
        var annotations = getAnnotations(cm.getValue(), passOptions, cm);
        if (!annotations) return;
        if (annotations.then) annotations.then(function(issues) {
          cm.operation(function() {updateTreeSitterParsing(cm, issues)})
        });
        else cm.operation(function() {updateTreeSitterParsing(cm, annotations)})
      }
    }
  
    function updateTreeSitterParsing(cm, annotationsNotSorted) {
      clearMarks(cm);
      var state = cm.state.treeSitterParse, options = state.options;
  
      var annotations = groupByLine(annotationsNotSorted);
  
      for (var line = 0; line < annotations.length; ++line) {
        var anns = annotations[line];
        if (!anns) continue;
  
        var maxSeverity = null;
        var tipLabel = state.hasGutter && document.createDocumentFragment();
  
        for (var i = 0; i < anns.length; ++i) {
          var ann = anns[i];
          var severity = ann.severity;
          if (!severity) severity = "error";
          maxSeverity = getMaxSeverity(maxSeverity, severity);
  
          if (options.formatAnnotation) ann = options.formatAnnotation(ann);
          if (state.hasGutter) tipLabel.appendChild(annotationTooltip(ann));
  
          if (ann.to) state.marked.push(cm.markText(ann.from, ann.to, {
            className: "CodeMirror-treeSitterParse-mark-" + severity,
            __annotation: ann
          }));
        }
  
      }
      if (options.onupdateTreeSitterParsing) options.onupdateTreeSitterParsing(annotationsNotSorted, annotations, cm);
    }
  
    function onChange(cm) {
      var state = cm.state.treeSitterParse;
      if (!state) return;
      clearTimeout(state.timeout);
      state.timeout = setTimeout(function(){startTreeSitterParsing(cm);}, state.options.delay || 500);
    }
  
  
  
    CodeMirror.defineOption("treeSitter", false, function(cm, val, old) {
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
  
        startTreeSitterParsing(cm);
      }
    });
  
    CodeMirror.defineExtension("performTreeSitterParse", function() {
      if (this.state.treeSitterParse) startTreeSitterParsing(this);
    });
  });
  