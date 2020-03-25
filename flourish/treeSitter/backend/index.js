const Parser = require('tree-sitter');
const Flourish = require('tree-sitter-flourish');

const parser = new Parser();
parser.setLanguage(Flourish);

const server = require('http').createServer();
const io = require('socket.io')(server);
io.on('connection', socket => {
    let tree = null;
    socket.on('parse', sourceCode => {
        tree = parser.parse(sourceCode);

        function walk(node) {
            let info = { startPosition: node.startPosition, type: node.type, endPosition: node.endPosition }
            if (node.childCount) {
                info.children = [];
                let child = node.firstChild;
                do {
                    info.children.push(walk(child));
                } while (child = child.nextSibling)
            }

            return info;
        }

        let info = walk(tree.rootNode);
        socket.emit('parseComplete', info);

    });

    socket.on('parseIncremental', data => {
        const newSourceCode = data.newtext;
        tree.edit(data.posInfo);


        let newtree = parser.parse(newSourceCode, tree);

        let changedRange = tree.getChangedRanges(newtree);
        let editedRange = tree.getEditedRange()

        tree = newtree;

        function walk(node) {
            let info = { startPosition: node.startPosition, type: node.type, endPosition: node.endPosition }
            if (node.childCount) {
                info.children = [];
                let child = node.firstChild;
                do {
                    info.children.push(walk(child));
                } while (child = child.nextSibling)
            }

            return info;
        }

        let info = walk(tree.rootNode);
        info.changes = {changedRange,editedRange};
        socket.emit('parseComplete', info);

    });


});
server.listen(3000);