const Parser = require('tree-sitter');
const Flourish = require('tree-sitter-flourish');


const FNode = require('./FNode.js');


 class FlourishParser {

    constructor() {
        let parser = new Parser();
        parser.setLanguage(Flourish);

        this.tsTree = null;
        this.fNodeTree = null;
        this.parser = parser;
    
    }

    parse(sourceCode)
    {
        this.tsTree = this.parser.parse(sourceCode);
        this.fNodeTree = FNode.reConciliation(this.fNodeTree, null, this.tsTree);
        return this.fNodeTree;
    }

    parseIncremental(newSourceCode,treeEditInfo){
        const tree = this.tsTree;
        tree.edit(treeEditInfo);


        let newTree = this.parser.parse(newSourceCode, tree);
        let changedRange = tree.getChangedRanges(newTree);

        let editedRange = tree.getEditedRange()
        this.fNodeTree = FNode.reConciliation(this.fNodeTree, tree, newTree)

        const changes = { changedRange, editedRange };
        this.tsTree = newTree;
        return [this.fNodeTree,changes];

    }


}

module.exports = FlourishParser;