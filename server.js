
const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const  io = require('socket.io')(http);
const LOCALHOSTPORT = 7000;

class PlayerClient {
    constructor(id,room,x,y,yVelocity,xAirVelocity,frameIndex,state){
        this.id = id;
        this.room = room;
        this.x = x;
        this.y = y;
        this.yVelocity = yVelocity;
        this.xAirVelocity = xAirVelocity;
        this.frameIndex = frameIndex;
        this.state = state;
    }
}
/*
x: playerFighter.posx,
          y:playerFighter.posy,
          yVelocity: playerFighter.yVelocity,
          xAirVelocity: playerFighter.xAirVelocity,
          frameIndex:playerFighter.frameIndex,
          id:socket.id,
          state:playerFighter.state,
          //pass: roomPassword,
          */

let clients = [];

app.use('/', express.static(__dirname + '/public'));
// app.use('/mobile', express.static(__dirname + '/public/mobile'));

setInterval(heartbeat, 10);//was 33

function heartbeat(){
    io.sockets.emit('heartbeat', clients);
}

io.on('connection', function(socket){
    console.log('client connected, new player id is:' + socket.id);
    /*socket.on('roomEntered', (passWord) => {

    });*/
    socket.on('start', (data) => {
        
        /*const circle = new Circle(socket.id, data.x, data.y, data.size, data.col, data.clicked, data.freq)
        // console.log(data);
        circles.push(circle);*/
    });

    socket.on('update', (data) => {//problem probably here -- overwriting info about other clients
        let hits = 0;
        clients.forEach((client,i) => {
            if(client => client.id == data.id){
                //console.log(client, socket.id);
                clients[i] = data;
                hits++;
                //console.log(hits, socket.id, data.id);
            }
        });
        
        //check if never found

       /*circles.forEach((circle, i) => {
           if(circle => circle.id == socket.id){
                circles[i] = data;
           };
        })*/
        //io.sockets.in("debugRoom").emit('message', 'whats up fools');
    });

    socket.on('playSound', (freq) => {
        console.log('play sound message received', freq);
        io.sockets.emit('playFreq', freq);//<-- this is wrong - will play in all rooms
    });

    socket.on('requestAvailableRooms', function() {
        console.log('current clients', clients);//<--- outputs incorrectly
        availableRooms = getRooms();
        socket.emit('updateRooms', availableRooms);
    });

    socket.on('disconnect', function() {
        console.log("Client has disconnected");
      });

    socket.on('room', (room) => {
        console.log('Connecting player to room ID ', room);
        let plClient = new PlayerClient(socket.id,room,300,126,0,0,0,0);
        clients.push(plClient);
        console.log('Current Clients: ', clients);//<-- outputs
        socket.join(room);
        socket.emit('connectionSuccess',room);
    });
});

function getRooms(){
    availableRooms = [];

    clients.forEach((client,i) => {
        console.log("room: ",client.room);
        if(!availableRooms.includes(client.room)){
            availableRooms.push(client.room);
        } //**** ELSE: REMOVE FROM LIST - ROOM FULL */
        
    });
    //console.log("available rooms: ",availableRooms, "clients: ", clients);
    return availableRooms;
}

http.listen(process.env.PORT || LOCALHOSTPORT);
console.log('server running on port:' + LOCALHOSTPORT);