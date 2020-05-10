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

    CodeMirror.defineOption("anyKeyCompletion", false, function (cm, val, old) {

        cm.on("inputRead", function (cm, changeObj) {
            if (cm.state.completionActive) {
                return;
            }
            CodeMirror.commands.autocomplete(cm);
        })



    })




})