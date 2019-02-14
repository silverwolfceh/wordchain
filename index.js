var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var SpellChecker = require('spellchecker');
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
  
  socket.on('broadcast', function(user, msg){
    var key = msg.substr(3, 3);
    if(key == "999")
    {
      var msg1 = msg.substr(6, msg.length - 1);
      console.log(user + " has sent a system message: " + msg1);
      io.emit('broadcast', msg1);
    }
  });

  socket.on('wordchain', function(user, msg, roomid){
    console.log(roomid + " | " + user + ": " + msg)
    if(SpellChecker.isMisspelled(msg))
    {
      console.log("Wrong spelling " + msg);
      io.emit('wrongspelling', user, msg, roomid);
    }
    else
    {
      io.emit('wordchain', user , msg, roomid);
    }
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
