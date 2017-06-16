var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var currentConnections = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  currentConnections[socket.id] = {}
  socket.on('join', function(user, roomid) {
    currentConnections[socket.id].roomid = roomid
    currentConnections[socket.id].name = user
    console.log("User " + user + " joined in room " + roomid)
    io.emit('join', user, roomid);
  });
  socket.on('chat', function(user, msg, roomid){
    console.log(roomid + " | " + user + ": " + msg)
    io.emit('chat', user, msg, roomid);
  });

  socket.on('wordchain', function(user, msg, roomid){
    console.log(roomid + " | " + user + ": " + msg)
    io.emit('wordchain', user , msg, roomid);
  });

  socket.on('result', function(user, result, roomid) {
    io.emit('result', user, result, roomid);
  });

  socket.on('disconnect', function() {
    console.log("User " + currentConnections[socket.id].name + " left the room " + currentConnections[socket.id].roomid)
    io.emit('disconnect', currentConnections[socket.id].name, currentConnections[socket.id].roomid);
  });

  socket.on('changename', function(name) {
    console.log("User " + currentConnections[socket.id].name + " change their name to " + name)
    currentConnections[socket.id].name = name
  })

});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
