const Parser = require('tree-sitter');
const Lisp = require('tree-sitter-lisp');

const parser = new Parser();
parser.setLanguage(Lisp);

const server = require('http').createServer();
const io = require('socket.io')(server);
io.on('connection', socket => {
    socket.on('parse', sourceCode => {
        const tree = parser.parse(sourceCode);
        debugger;

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

});
server.listen(3000);