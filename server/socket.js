/*
* Manage socket operations
*/  
exports.connect = function(io){
    io.sockets.on('connection', function(socket){
        console.log('a user connected');
        socket.on('sendMessage', function(msg){
            console.log("msg "+ msg)
            socket.broadcast.emit('getMessage', msg)
        })
    });
}