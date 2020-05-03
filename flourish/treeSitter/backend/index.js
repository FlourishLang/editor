
const server = require('http').createServer();
const io = require('socket.io')(server);
const Parser = require('./Parser')
const evaluate = require('./evaluate')
const envCreate = require('./environment').create;

function patchTree(tree, env) {
    let errors = [];
    tree.children = tree.children.map(mayBeStatement => {
        if (mayBeStatement.type == 'statement') {
            try {
                let error = evaluate(mayBeStatement.children[0], env);
                if (error && error.constructor === evaluate.ERROR) {
                    if (!error.startPosition) {
                        error.startPosition = mayBeStatement.startPosition;
                        error.endPosition = mayBeStatement.endPosition;
                    }
                    errors.push(error);
                }
            } catch (error) {
                console.log("Unhandled error in eval", error);
                errors.push(evaluate.ERROR.fromAst(mayBeStatement, `Unhandled error in eval ${error}`));
            }

        } else if (mayBeStatement.type == 'ERROR') {
            errors.push(evaluate.ERROR.fromAst(mayBeStatement, ''));
        }
        return mayBeStatement;
    });
    tree.errors = errors;
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