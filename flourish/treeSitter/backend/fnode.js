


class FNode {

    constructor(tsnode){
        this.tsnode = tsnode;
        this.children = [];
    }

};





function reConciliationNode(originalFnodeTree,originalTsTree,node)
{
    let info = { startPosition: node.startPosition, type: node.type, endPosition: node.endPosition }
    info.children = node.children.map((child)=>reConciliationNode(originalFnodeTree,originalTsTree,child))

    return info;
}

FNode.reConciliation = function (originalFnodeTree,originalTsTree,newTsTree) {
    return reConciliationNode(
        originalFnodeTree,
        originalTsTree?originalTsTree.rootNode:null,
        newTsTree.rootNode)
}


module.exports = FNode;