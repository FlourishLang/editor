const Parser = require('tree-sitter');
const Flourish = require('tree-sitter-flourish');

const parser = new Parser();
parser.setLanguage(Flourish);

const fnode = require('./fnode.js');
const server = require('http').createServer();
const io = require('socket.io')(server);
io.on('connection', socket => {
    let tree = null;
    let fnodeTree = null;

    socket.on('parse', sourceCode => {
        tree = parser.parse(sourceCode);
        fnodeTree = fnode.reConciliation(fnodeTree,null,tree)

        
        socket.emit('parseComplete', fnodeTree);

    });

    socket.on('parseIncremental', data => {
        const newSourceCode = data.newtext;
        tree.edit(data.posInfo);
        

        let newtree = parser.parse(newSourceCode, tree);
        let changedRange = tree.getChangedRanges(newtree);

        let editedRange = tree.getEditedRange()
        fnodeTree = fnode.reConciliation(fnodeTree,tree,newtree)

        fnodeTree.changes = {changedRange,editedRange};
        socket.emit('parseComplete', fnodeTree);
        tree = newtree;


    });


});
server.listen(3000);