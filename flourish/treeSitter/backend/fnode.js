


class FNode {

    constructor(tsnode){
        this.tsnode = tsnode;
        this.children = [];
    }

};



function walk(node) {
    let info = { id:node["0"],startPosition: node.startPosition, type: node.type, endPosition: node.endPosition }
    if (node.childCount) {
        info.children = [];
        let child = node.firstChild;
        do {
            info.children.push(walk(child));
        } while (child = child.nextSibling)
    }

    return info;
}

FNode.reConciliation = function (originalFnodeTree,originalTsTree,newTsTree) {
    
    return  walk(newTsTree.rootNode);
}


module.exports = FNode;