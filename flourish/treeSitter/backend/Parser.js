const Parser = require('tree-sitter');
const Flourish = require('tree-sitter-flourish');


const FNode = require('./FNode.js');


 class FlourishParser {

    constructor() {
        let parser = new Parser();
        parser.setLanguage(Flourish);

        this.tSTree = null;
        this.fNodeTree = null;
        this.parser = parser;
    
    }

    parse(sourceCode)
    {
        this.tSTree = this.parser.parse(sourceCode);
        this.fNodeTree = FNode.reConciliation(this.fNodeTree, null, this.tSTree);
        return this.fNodeTree;
    }

    parseIncremental(newSourceCode,treeEditInfo){
        const tree = this.tSTree;
        tree.edit(treeEditInfo);


        let newTree = this.parser.parse(newSourceCode, tree);
        let changedRange = tree.getChangedRanges(newTree);

        let editedRange = tree.getEditedRange()
        this.fNodeTree = FNode.reConciliation(this.fNodeTree, tree, newTree)

        const changes = { changedRange, editedRange };
        this.tSTree = newTree;
        return [this.fNodeTree,changes];

    }


}

module.exports = FlourishParser;