
const server = require('http').createServer();
const io = require('socket.io')(server, {
    pingTimeout: 60000,
  });
const Executer = require('./Executer');
const Parser = require('./Parser')




/**Patch tree for consumption of codemirror  */
function patchTree(tree, result) {
    let errors = [];
    if (result)
        errors.push(result);
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


        // descendantForPosition

    let parser = null;
    let executer = null;
    let outTree = null;
    socket.on('parse', sourceCode => {
        parser = new Parser();
        outTree = parser.parse(sourceCode);
        executer = new Executer(outTree);
        let result = executer.execute()
        outTree = patchTree(outTree, result);


        socket.emit('parseComplete', outTree);
    });

    socket.on('setActiveLine', lineNumber => {
        
        executer.setActiveLine(lineNumber);
        
    });

    

    let lastResult = null; //TODO:Redesign
    socket.on('parseIncremental', data => {
        const newSourceCode = data.newtext;
        let [tree, changes] = parser.parseIncremental(newSourceCode, data.posInfo)
        
        let result = executer.execute()
        tree = patchTree(tree, result);
        tree.changes = changes;
        socket.emit('parseComplete', tree);
        lastResult = result;

    });

});

server.listen(3000);