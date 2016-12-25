var express = require('express');
var app = require('express')();
var server = require('http').Server(app);

// Websockets with socket.io
var io = require('socket.io')(server);

var cors = require('cors');


//app.use(bodyParser.json()); // support json encoded bodies
//app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
//app.use(bodyParser.json({ type: 'application/json' })); // parse application/vnd.api+json as json
app.use(cors());

var domain =     process.env.OPENSHIFT_APP_DNS || '127.0.0.1';

var serverip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var serverport = process.env.OPENSHIFT_NODEJS_PORT || '8080';

console.log("Trying to start server with config:", serverip + ":" + serverport);
console.log(domain);
// Both port and ip are needed for the OpenShift, otherwise it tries 
// to bind server on IP 0.0.0.0 (or something) and fails
server.listen(serverport, serverip, function() {
  console.log("Server running @ http://" + serverip + ":" + serverport);
});

// Allow some files to be server over HTTP
app.use(express.static(__dirname + '/'));

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

// Serve GET on http://domain/
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Server GET on http://domain/api/config
// A hack to provide client the system config
//app.get('/api/config', function(req, res) {
//  res.send('var config = ' + JSON.stringify(config));
//});

// And finally some websocket stuff
io.on('connection', function (socket) { // Incoming connections from clients
  // Greet the newcomer
  socket.emit('hello', { greeting: 'Hi socket ' + socket.id + ' this is Server speaking! Let\'s play ping-pong. You pass!' });

  socket.on('ping', function (data) { // ping-event from the client to be respond with pong
    console.log("received ping from client: ", data);
    socket.emit('pong', { id: data.id });
  });
});