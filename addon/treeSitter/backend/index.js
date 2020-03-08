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

        tree.edit({
            startIndex: data.startIndex,
            oldEndIndex: data.oldEndIndex,
            newEndIndex: data.newEndIndex,
            startPosition: { row: data.from.line, column: data.from.ch },
            oldEndPosition: { row: data.to.line, column: data.to.ch },
            newEndPosition: { row: data.newEndPosition.line, column: data.newEndPosition.ch },
        });

        let newtree = parser.parse(newSourceCode, tree);

        let changes = newtree.getChangedRanges(tree);
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
        info.changes = changes;
        socket.emit('parseComplete', info);

    });


});
server.listen(3000);