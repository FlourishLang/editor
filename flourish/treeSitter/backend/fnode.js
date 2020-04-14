const EventEmitter = require('events');



class FNode  extends EventEmitter {

    constructor(newTsTree) {
        super();
        this.children = [];
        this.leafText = "";
        this.apply(newTsTree);

    }


    apply(newTsTree) {
        let data = { startPosition: newTsTree.startPosition, type: newTsTree.type, endPosition: newTsTree.endPosition };
        if (newTsTree.childCount == 0)
            this.leafText = newTsTree.text;
        Object.assign(this, data);
    }

    applyTree(newTsTree) {
        this.apply(newTsTree);
        this.children.forEach((child, index) => { child.applyTree(newTsTree.children[index]) });
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



function reConciliationNode(oldFNodeTree, oldTsTree, newTsTree) {
    if (oldTsTree == null) {
        let fNode = new FNode(newTsTree)
        fNode.children = newTsTree.children.map((child) => reConciliationNode(oldFNodeTree, oldTsTree, child))
        return fNode;

    } else if (isEqualNodeMemory(oldTsTree, newTsTree, oldFNodeTree)) {
        // console.log("reusing", oldFNodeTree.type, newTsTree.text);
        oldFNodeTree.applyTree(newTsTree);
        return oldFNodeTree;

    } else if (oldFNodeTree.type == newTsTree.type) {

        oldFNodeTree.apply(newTsTree);
        let indexOffSet = 0;
        for (let index = 0; index < newTsTree.childCount; index++) {
            let child = newTsTree.children[index];
            if (oldFNodeTree.children.length == newTsTree.childCount) {

                let newFNodeChild = reConciliationNode(oldFNodeTree.children[index], oldTsTree.children[index + indexOffSet], child);
                if (newFNodeChild) {
                    oldFNodeTree.children[index] = newFNodeChild;
                    newFNodeChild.emit("didUpdate");
                }
                else {
                    let newFNodeChild = reConciliationNode(null, null, child);
                    oldFNodeTree.children[index].emit("willUnMount");
                    oldFNodeTree.children[index] = newFNodeChild;
                    newFNodeChild.emit("didMount");
                }


            }

            else if (oldFNodeTree.children.length > newTsTree.childCount) {

                let newFNodeChild = reConciliationNode(oldFNodeTree.children[index], oldTsTree.children[index + indexOffSet], child);
                if (newFNodeChild) {
                    oldFNodeTree.children[index] = newFNodeChild;
                    newFNodeChild.emit("didUpdate");
                }
                else {

                    oldFNodeTree.children[index].emit("willUnMount");
                    oldFNodeTree.children.splice(index, 1);
                    indexOffSet += 1;
                    index--;
                }

            } else if (oldFNodeTree.children.length < newTsTree.childCount) {
                if (oldFNodeTree.children.length <= index) {
                    let newFNodeChild = reConciliationNode(null, null, child);
                    oldFNodeTree.children.push(newFNodeChild);
                    newFNodeChild.emit("didMount");
                } else {
                    let newFNodeChild = reConciliationNode(oldFNodeTree.children[index], oldTsTree.children[index + indexOffSet], child);
                    if (newFNodeChild) {
                        oldFNodeTree.children[index] = newFNodeChild;
                        newFNodeChild.emit("didUpdate");
                    } else {
                        let newFNodeChild = reConciliationNode(null, null, child);
                        oldFNodeTree.children.splice(index, 0, newFNodeChild);
                        indexOffSet -= 1;
                        newFNodeChild.emit("didMount");
                    }
                }

            }




        }

        if (oldFNodeTree.children.length > newTsTree.childCount) {
            for (let index = newTsTree.childCount; index < oldFNodeTree.children.length; index++) {
                oldFNodeTree.children[index].emit("willUnMount");
            }
            oldFNodeTree.children.splice(newTsTree.childCount, oldFNodeTree.children.length - newTsTree.childCount);

        }


        return oldFNodeTree;
    } else {

        return null;
    }

}



FNode.reConciliation = function (oldFNodeTree, oldTsTree, newTsTree) {
    mapMemorization.clear();
    return reConciliationNode(
        oldFNodeTree,
        oldTsTree ? oldTsTree.rootNode : null,
        newTsTree.rootNode)
}


module.exports = FNode;