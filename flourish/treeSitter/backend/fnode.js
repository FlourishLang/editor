


class FNode {

    constructor(node){
        let data = {startPosition: node.startPosition, type: node.type, endPosition: node.endPosition };
        Object.assign(this,data);
        this.children = [];
    }

};





function reConciliationNode(originalFnodeTree,originalTsTree,node)
{
    let fnode = new FNode(node)
    fnode.children = node.children.map((child)=>reConciliationNode(originalFnodeTree,originalTsTree,child))

    return fnode;
}

FNode.reConciliation = function (originalFnodeTree,originalTsTree,newTsTree) {
    return reConciliationNode(
        originalFnodeTree,
        originalTsTree?originalTsTree.rootNode:null,
        newTsTree.rootNode)
}


module.exports = FNode;