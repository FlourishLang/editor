
const server = require('http').createServer();
const io = require('socket.io')(server);
const Parser = require('./Parser')
const evaluate = require('./evaluate')
const envCreate = require('./environment').create;

function patchTree(tree, env) {
    tree.children = tree.children.map(mayBeStatement => {
        if (mayBeStatement.type == 'statement') {
            let result = evaluate(mayBeStatement.children[0], env);
            if (result && result.constructor.name == 'ERROR') {
                mayBeStatement.type = "ERROR";
            }

        }
        return mayBeStatement;
    });
    return tree;
}



io.on('connection', socket => {


    let parser = new Parser();
    socket.on('parse', sourceCode => {
        const environment = envCreate()
        let outTree = parser.parse(sourceCode);
        outTree = patchTree(outTree, environment);

        socket.emit('parseComplete', outTree);
    });

    socket.on('parseIncremental', data => {
        const environment = envCreate()
        const newSourceCode = data.newtext;
        let [tree, changes] = parser.parseIncremental(newSourceCode, data.posInfo)
        tree = patchTree(tree, environment);
        tree.changes = changes;
        socket.emit('parseComplete', tree);

    });

});
server.listen(3000);