const Parser = require('tree-sitter');
const Lisp = require('tree-sitter-lisp');

const parser = new Parser();
parser.setLanguage(Lisp);

const server = require('http').createServer();
const io = require('socket.io')(server);
io.on('connection', socket => {
    socket.on('parse', sourceCode => {
        const tree = parser.parse(sourceCode);


        function walk(node) {
            let info = { startIndex: node.startIndex, type: node.type, endIndex: node.endIndex }
            if (node.childCount) {
                info.child = [];
                let child = node.firstChild;
                do {
                    info.child.push(walk(child));
                } while (child = child.nextSibling)
            }

            return info;
        }

        let info = walk(tree.rootNode);
        socket.emit('parseComplete', info);

    });

});
server.listen(3000);