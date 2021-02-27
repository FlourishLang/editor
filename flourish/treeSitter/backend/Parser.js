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
        this.fNodeTree = FNode.reConciliation(this.fNodeTree, tree, newTree);
        this.leastCommonAncesestor.rebuild();

        let mutatedChildren = FNode.accumulateMutatedLeaf(this.fNodeTree);
        let mutatedRoot =null
        if (mutatedChildren.length) {
            mutatedRoot = this._leastCommonAncesestorArray(mutatedChildren);

        }


        
        const changes = { changedRange, editedRange,mutatedRoot ,leastCommonAncesestor:this.leastCommonAncesestor};
        this.tsTree = newTree;
        return [this.fNodeTree, changes];

    }

    _leastCommonAncesestorArray(list){

        return  list.reduce((p,c)=>this.leastCommonAncesestor(p,c));
;
        //TODO investicate optimized way;

        // if(list.length==1)
        //     return  list[0];

        // if(list.length==2)
        //     return this.leastCommonAncesestor(list[0],list[1]);

        // let center = Math.ceil(list.length/2);
        // let first = list.slice(0,center)
        // let second = list.slice(center);

        // return this._leastCommonAncesestorArray(first,second);

    }

    


}

module.exports = FlourishParser;