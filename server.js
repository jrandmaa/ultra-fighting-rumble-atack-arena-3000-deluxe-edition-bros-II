
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

/*class Room {
    constructor(room, player1, player2){
        this.room=room;
        this.player1=player1;
        this.player2=player2;
    }
}*/
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
let rooms = {};//room:numconnected

let clientInfo = {};//id:room
let clientIDs = {};


app.use('/', express.static(__dirname + '/public'));
// app.use('/mobile', express.static(__dirname + '/public/mobile'));

setInterval(heartbeat, 1);//was 33

function heartbeat(){
    io.sockets.emit('heartbeat', clients);
}

io.on('connection', function(socket){
    console.log('client connected, new player id is:' + socket.id);
    clientIDs[socket.id] = socket;
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
            if(client.id == data.id){
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
        availableRooms = getRooms();
        //vvvv used to be availableRooms
        socket.emit('updateRooms', rooms);
    });

    socket.on('disconnect', function() {
        //GET ROOM FROM ID, AND DECREMENT ROOM VAL HERE [][][]
        rooms[clientInfo[socket.id]] = rooms[clientInfo[socket.id]] - 1;
        if(rooms[clientInfo[socket.id]] != 1){
            delete rooms[clientInfo[socket.id]];
        }
        //let rooms = {};//room:numconnected
        //let clientInfo = {};//id:room
        
        //for all rooms if 0 or null connected delete from memory
        /*for(let rm in rooms){
            if (rooms[rm] == 0){
                delete rooms[rm];
                availableRooms = getRooms();
                socket.emit('updateRooms', rooms);
            }
        }*/

        console.log("Client has disconnected");
      });

    socket.on('room', (room) => {
        clientInfo[socket.id] = room;

        //FIND OUT IF PLAYER 1 HAS CHOSEN CHARACTER YET

        console.log('Connecting player to room ID ', room);
        let plClient = new PlayerClient(socket.id,room,300,126,0,0,0,0);
        clients.push(plClient);
        socket.join(room);
        socket.emit('connectionSuccess',room);

        //if dictionary already contains: dict[key] = val+1
        //else, new entry with val 1 
        if(room in rooms){
            rooms[room] = rooms[room]+1;
        } else {
            rooms[room] = 1;
        }

    });

    socket.on('startGame',(room)=> {
        console.log("Starting game for room "+room);
        //get everybody in room, send msg
        for(let id in clientInfo){
            if(clientInfo[id] == clientInfo[socket.id]){
                clientIDs[id].emit('startGame');
            }
            //if id doesnt match: then send
        }
    })

    socket.on('playerSelected',(name) => {
        for(let id in clientInfo){
            if(clientInfo[id] == clientInfo[socket.id]){
                if(id != socket.id){
                    //get socket from id then send player2Selected , name
                    console.log("PLAYER IDs IN ROOM ("+ clientInfo[id]+"): "+id+", "+socket.id);
                    clientIDs[id].emit('message',"Other player has selected " + name);
                    clientIDs[id].emit('player2Selected',name);
                }
            }
            //if id doesnt match: then send
        }
        //stopped here: ^^ now use dictionary in global variables search until value = room^
        //then  if it is
            //loop through connected until its the one whose room value from dictionary is the same as current room


        //can get player id from socket id
        //find player2 and emit that socket     (emit player 1 pick probably)
        //!! get player2 from sketch (send player 2 id or socket)
    });

    socket.on('hurtEnemy', (dmg) => {
        //getOtherPlayer(socket).emit('message', "you got punched dude");
        getOtherPlayer(socket).emit('hurtPlayer',dmg);
    });
});

function getOtherPlayer(sock){
    for(let id in clientInfo){
        if(clientInfo[id] == clientInfo[sock.id]){
            if(id != sock.id){
                return clientIDs[id];
            }
        }
    }
}

function getRooms(){
    availableRooms = [];

    clients.forEach((client,i) => {
        //console.log("room: ",client.room);
        if(rooms[client.room] == 1){
            if(!availableRooms.includes(client.room)){
                
                availableRooms.push(client.room);
            }
            
        } //**** ELSE: REMOVE FROM LIST - ROOM FULL */
        
    });
    //console.log("available rooms: ",availableRooms, "clients: ", clients);
    return availableRooms;
}

http.listen(process.env.PORT || LOCALHOSTPORT);
console.log('server running on port:' + LOCALHOSTPORT);