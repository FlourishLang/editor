


class FNode {

    constructor(node){
        this.children = [];
        this.apply(node);
    }


    apply(node){
        let data = {startPosition: node.startPosition, type: node.type, endPosition: node.endPosition };
        Object.assign(this,data);
    }

    applyTree(node){
        this.apply(node);
        this.children.forEach((child,index)=>{child.applyTree(node.children[index])});
    }

};




function isEqaulNode(first,next){
    if (first["0"] === next["0"])
        return true;

    if (first.type != next.type) {
        return false;
    }
    
    
    if (first.childCount != next.childCount) {
        console.log("Same child count mismatch");
        return false;
    }

    if(first.childCount ==0)
    return false;

    let mismatch =first.children.find((child,index)=>{
        return !isEqaulNode(child,next.children[index]);
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
            console.log("resusing",originalFnodeTree.type,node.text );
            originalFnodeTree.applyTree(node);
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