


class FNode {

    constructor(node){
        this.apply(node);
        this.children = [];
    }


    apply(node){
        let data = {startPosition: node.startPosition, type: node.type, endPosition: node.endPosition };
        Object.assign(this,data);
    }

};


function isEqaulNode(first,next){
    if (first["0"] === next["0"])
        return true;

    if(first.childCount!=next.childCount)
        return false;

    let mismatch =first.children.find((child,index)=>{
        return child["0"]!=next.children[index]["0"];
    })

    return !mismatch;

}

function reConciliationNode(originalFnodeTree, originalTsTree, node) {
    if (originalTsTree == null) {
        let fnode = new FNode(node)
        fnode.children = node.children.map((child) => reConciliationNode(originalFnodeTree, originalTsTree, child))

        return fnode;
    } else {

        if (isEqaulNode(originalTsTree,node)) {
            originalFnodeTree.apply(node);

            console.log("resusing",originalFnodeTree.type,node.text );
            return originalFnodeTree;
        } else {
            let fnode = new FNode(node)
            fnode.children = node.children.map((child, index) => reConciliationNode(originalFnodeTree.children[index], originalTsTree.children[index], child))

            return fnode;
        }

    }

}

FNode.reConciliation = function (originalFnodeTree,originalTsTree,newTsTree) {
    return reConciliationNode(
        originalFnodeTree,
        originalTsTree?originalTsTree.rootNode:null,
        newTsTree.rootNode)
}


module.exports = FNode;