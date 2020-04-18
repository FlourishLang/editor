const Parser = require('tree-sitter');
const Flourish = require('tree-sitter-flourish');

const parser = new Parser();
parser.setLanguage(Flourish);

const fNode = require('./fnode.js');
const server = require('http').createServer();
const io = require('socket.io')(server);
io.on('connection', socket => {
    let tree = null;
    let fNodeTree = null;

    socket.on('parse', sourceCode => {
        tree = parser.parse(sourceCode);
        fNodeTree = fNode.reConciliation(fNodeTree, null, tree)
        socket.emit('parseComplete', fNodeTree);

    });

    socket.on('parseIncremental', data => {
        const newSourceCode = data.newText;
        tree.edit(data.posInfo);


        let newTree = parser.parse(newSourceCode, tree);
        let changedRange = tree.getChangedRanges(newTree);

        let editedRange = tree.getEditedRange()
        fNodeTree = fNode.reConciliation(fNodeTree, tree, newTree)

        fNodeTree.changes = { changedRange, editedRange };
        socket.emit('parseComplete', fNodeTree);
        tree = newtTee;


    });


});
server.listen(3000);