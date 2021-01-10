const Parser = require('tree-sitter');
const Flourish = require('tree-sitter-flourish');
const leastCommonAncestorFunctionGenerator = require("least-common-ancestor");

const FNode = require('./FNode.js');


class FlourishParser {

    constructor() {
        let parser = new Parser();
        parser.setLanguage(Flourish);

        this.tsTree = null;
        this.fNodeTree = null;
        this.parser = parser;
        this.lca = null;

    }

    parse(sourceCode) {
        this.tsTree = this.parser.parse(sourceCode);
        this.fNodeTree = FNode.reConciliation(this.fNodeTree, null, this.tsTree);
        this.leastCommonAncesestor = leastCommonAncestorFunctionGenerator(this.fNodeTree, node => node.children);

        return this.fNodeTree;
    }

    parseIncremental(newSourceCode, treeEditInfo) {
        const tree = this.tsTree;
        tree.edit(treeEditInfo);


        let newTree = this.parser.parse(newSourceCode, tree);
        let changedRange = tree.getChangedRanges(newTree);

        let editedRange = tree.getEditedRange()
        this.fNodeTree = FNode.reConciliation(this.fNodeTree, tree, newTree)

        this.leastCommonAncesestor.rebuild();
        const changes = { changedRange, editedRange };
        this.tsTree = newTree;
        return [this.fNodeTree, changes];

    }


}

module.exports = FlourishParser;