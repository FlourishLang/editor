


class FNode {

    constructor(node) {
        this.children = [];
        this.leafText = "";
        this.apply(node);

    }


    apply(node) {
        let data = { startPosition: node.startPosition, type: node.type, endPosition: node.endPosition };
        if (node.childCount == 0)
            this.leafText = node.text;
        Object.assign(this, data);
    }

    applyTree(node) {
        this.apply(node);
        this.children.forEach((child, index) => { child.applyTree(node.children[index]) });
    }

    didUpdate() {

    }
    didMount() {

    }


    willUnMount() {

    }

};

let mapMemorization = new Map()
function isEqualNodeMemory(first, next, fNode) {
    let key = "" + first["0"] + "" + next["0"];
    if (mapMemorization.has(key))
        return mapMemorization.get(key);
    let result = isEqualNode(first, next, fNode);
    mapMemorization.set(key, result);
    return result
}


function isEqualNode(first, next, fNode) {

    if (first["0"] === next["0"])
        return true;

    if (first.type != next.type) {
        // console.log("Type mismatch" + first.type);

        return false;
    }


    if (first.childCount != next.childCount) {
        // console.log("Same child count mismatch");
        return false;
    }

    if (first.childCount == 0 && next.text == fNode.leafText) {
        return true;
    }


    if (first.childCount == 0) {
        // debugger
        // console.log("Leaf", first.text, first)
        return false;
    }

    let mismatch = first.children.find((child, index) => {
        return !isEqualNodeMemory(child, next.children[index], fNode.children[index]);
    })



    return !mismatch;

}



function reConciliationNode(originalFNodeTree, originalTsTree, node) {
    if (originalTsTree == null) {
        let fNode = new FNode(node)
        fNode.children = node.children.map((child) => reConciliationNode(originalFNodeTree, originalTsTree, child))
        return fNode;

    } else if (isEqualNodeMemory(originalTsTree, node, originalFNodeTree)) {
        console.log("reusing", originalFNodeTree.type, node.text);
        originalFNodeTree.applyTree(node);
        return originalFNodeTree;

    } else if (originalFNodeTree.type == node.type) {

        originalFNodeTree.apply(node);
        // fNode.children = node.children.map((child, index) => reConciliationNode(originalFNodeTree.children[index], originalTsTree.children[index], child))
        let indexOffSet = 0;
        for (let index = 0; index < node.childCount; index++) {
            let child = node.children[index];
            if (originalFNodeTree.children.length == node.childCount) {

                let newFNodeChild = reConciliationNode(originalFNodeTree.children[index], originalTsTree.children[index + indexOffSet], child);
                if (newFNodeChild) {
                    originalFNodeTree.children[index] = newFNodeChild;
                    newFNodeChild.didUpdate();
                }
                else {
                    let newFNodeChild = reConciliationNode(null, null, child);
                    originalFNodeTree.children[index].willUnMount();
                    originalFNodeTree.children[index] = newFNodeChild;
                    newFNodeChild.didMount();
                }


            }

            else if (originalFNodeTree.children.length > node.childCount) {

                let newFNodeChild = reConciliationNode(originalFNodeTree.children[index], originalTsTree.children[index + indexOffSet], child);
                if (newFNodeChild) {
                    originalFNodeTree.children[index] = newFNodeChild;
                    newFNodeChild.didUpdate();
                }
                else {

                    //abcde
                    //abde
                    originalFNodeTree.children[index].willUnMount();
                    originalFNodeTree.children.splice(index, 1);
                    indexOffSet += 1;
                    index--;
                }

            } else if (originalFNodeTree.children.length < node.childCount) {
                if (originalFNodeTree.children.length <= index) {
                    let newFNodeChild = reConciliationNode(null, null, child);
                    originalFNodeTree.children.push(newFNodeChild);
                    newFNodeChild.didMount();
                } else {
                    let newFNodeChild = reConciliationNode(originalFNodeTree.children[index], originalTsTree.children[index + indexOffSet], child);
                    if (newFNodeChild) {
                        originalFNodeTree.children[index] = newFNodeChild;
                        newFNodeChild.didUpdate();
                    } else {
                        let newFNodeChild = reConciliationNode(null, null, child);
                        originalFNodeTree.children.splice(index, 0, newFNodeChild);
                        indexOffSet -= 1;
                        newFNodeChild.didMount();
                    }
                }

            }




        }

        if (originalFNodeTree.children.length > node.childCount) {
            for (let index = node.childCount; index < originalFNodeTree.children.length; index++) {
                originalFNodeTree.children[index].willUnMount();
            }
            originalFNodeTree.splice(node.childCount, originalFNodeTree.children.length - node.childCount);

        }


        return originalFNodeTree;
    } else {

        return null;
    }

}



FNode.reConciliation = function (originalFNodeTree, originalTsTree, newTsTree) {
    mapMemorization.clear();
    return reConciliationNode(
        originalFNodeTree,
        originalTsTree ? originalTsTree.rootNode : null,
        newTsTree.rootNode)
}


module.exports = FNode;