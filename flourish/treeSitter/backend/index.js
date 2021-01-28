
const server = require('http').createServer();
const io = require('socket.io')(server);
const Executer = require('./Executer');
const Parser = require('./Parser')


// const evaluate = function name(ast,env) {
//     if(!ast.isMutated)
//         console.log("Mutated",ast.leafText)
//     if(ast.children && ast.children.length){
//         ast.children.forEach(element => {
//             evaluate(element,env);
//         });
//     }
// }

/**Patch tree for consumption of codemirror  */
function patchTree(tree, result) {

    let errors = [];
    if (result.done == false)
        errors.push(result.value);
    tree.errors = errors;
    return tree;
}

let hasconnection =false;

io.on('connection', socket => {

    //For debugging purpose we have only one connection active at a time
    if(hasconnection)
        socket.disconnect(true);
    else     
        hasconnection =true;



    let parser = null;
    let executer = null;
    socket.on('parse', sourceCode => {
        parser = new Parser();
        let outTree = parser.parse(sourceCode);
        executer = new Executer(outTree);
        let result = executer.execute()
        outTree = patchTree(outTree, result);


        socket.emit('parseComplete', outTree);
    });

    socket.on('parseIncremental', data => {
        const newSourceCode = data.newtext;
        let [tree, changes] = parser.parseIncremental(newSourceCode, data.posInfo)
        let result = executer.execute()
        tree = patchTree(tree, result);
        tree.changes = changes;
        socket.emit('parseComplete', tree);

    });

});

server.listen(3000);