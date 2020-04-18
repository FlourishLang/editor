
const server = require('http').createServer();
const io = require('socket.io')(server);
const Parser = require('./Parser')
io.on('connection', socket => {
    let parser = new Parser();
    socket.on('parse', sourceCode => {        
        socket.emit('parseComplete', parser.parse((sourceCode)));
    });

    socket.on('parseIncremental', data => {
        const newSourceCode = data.newtext;

        const [tree,changes] = parser.parseIncremental(newSourceCode,data.posInfo)
        
        tree.changes = changes;
        socket.emit('parseComplete', tree);

    });

});
server.listen(3000);