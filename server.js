var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var path = require('path');

// Websockets with socket.io
var io = require('socket.io')(server);

//io.set("transports", ["websocket"]);

var cors = require('cors');


//app.use(bodyParser.json()); // support json encoded bodies
//app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
//app.use(bodyParser.json({ type: 'application/json' })); // parse application/vnd.api+json as json
app.use(cors());


var serverip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var serverport = process.env.OPENSHIFT_NODEJS_PORT || 8080;

console.log("Trying to start server with config:", serverip + ":" + serverport);

// Both port and ip are needed for the OpenShift, otherwise it tries 
// to bind server on IP 0.0.0.0 (or something) and fails
server.listen(serverport, serverip, function() {
  console.log("Server running @ http://" + serverip + ":" + serverport);
});

//app.listen(serverport, serverip);

// Allow some files to be server over HTTP
//app.use(express.static(__dirname + '/'));

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

// Serve GET on http://domain/
app.get('/', function (req, res) {
  console.log('request');
  //res.status(200).send('Something bad happened!');
  res.sendFile(path.join(__dirname + '/index.html'));
  //res.sendFile(__dirname + '/index.html');
});

// Server GET on http://domain/api/config
// A hack to provide client the system config
//app.get('/api/config', function(req, res) {
//  res.send('var config = ' + JSON.stringify(config));
//});

// And finally some websocket stuff
io.on('connection', function (socket) {
  console.log('connection');
    socket.emit('pings', {'protocol':socket.conn.transport.name});

    socket.on('pongs', function (data) {
      console.log('pongs');
      socket.emit('pings',  {'protocol':socket.conn.transport.name});
      
    });
});