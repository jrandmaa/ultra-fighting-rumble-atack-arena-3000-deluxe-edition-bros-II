const socket = io.connect();
let env, osc;
socket.on('connect', () => {
    console.log('client connected')
})

let canvasWidth = 800;
let canvasHeight = 500;

let img, mod, BGtext, BGImage;
let theta = 0;
let gradient;
let myShader;
let camTargetX = 0;
let camTargetZ = 100;
let AIEnemy;
let playerFighter;
let player2Fighter;

let floorLevel = 125;
let levelWidth = 1100;
let levelCenter = 0;

let hitInvincibilityPeriod = 100;

let playerCharacterName = "Stick";

let debugModeEnabled = true;

let players = [];
let otherPlayers = [];
let connectedClients = [];

let UIFont;

let inRoom = false;//replace with
let menuState = 0;//title screen, room select, char select, game
let startButton;

let joinRoomButton;
let refreshButton;
let roomNameInput;
let room;

let availableRooms;
let UIrooms = [];

//temp
let xInput;
let yInput;
let zInput;

//time stuff
let date

let characterInfo;
let characters;

/*
now:
- make room headers actually have text
--------
- flip canvas
-character jumping moves camera y above a point
- non placeholder font
-gameplay :(((
*/


//ref
  //ellipse(this.posx, this.posy - this.img.height/2, 10, 10);


function preload(){
  UIFont = loadFont('Assets/Placeholder/SHPinscher-Regular.otf');
  characterInfo = loadJSON('Assets/JSON/characters.json');
  characters = characterInfo.characters;
  BGtext = loadImage('Assets/Textures/tempBG-text-f7.png');
  BGImage = loadImage('Assets/Textures/sky.png');
  mod = loadModel('tempBG2.obj');
  myShader = loadShader('basic.vert', 'basic.frag');
}

function startTitle(){
  menuState=1;
  socket.emit('requestAvailableRooms');
  startButton.hide();
}

function setup() {
  
  console.log('player id: ', socket.id);
  //roomPassword = window.prompt("To connect with the other player, enter the same room password as them","");
  //socket.emit('roomEntered', roomPassword);
  createCanvas(canvasWidth, canvasHeight, WEBGL);
  // noStroke();
  startButton = createImg('Assets/UI/START.png');
  startButton.mousePressed(startTitle);
  startButton.center();
  AIEnemy = new AIFighter(300,floorLevel);//BELOW - used to be -300
  playerFighter = new PlayerFighter(-Math.floor(Math.random() * 300) - 1,floorLevel,"Stick");

   gradient = createGraphics(400, 400, WEBGL);
   gradient.noStroke();
   gradient.push();
   gradient.translate(-200, -200, 0);
  //  gradient.image(img, 0 , 0, 400, 400);
   gradient.shader(myShader);
   gradient.rect(0,0,width, height);
   gradient.pop();
   //-----socket shit-------


  socket.on('heartbeat', (data) => {
    //console.log(data);
    connectedClients = [];

      data.forEach((item, i) => {
          //console.log(item.pass);
          if(item.id != socket.id){
            if(item.room == room){
              connectedClients.push(item);
            }/* else {
              console.log("CLIENT JOINED BUT NOT IN THIS ROOM");
            }*/
            
          }
      })    
  })

    socket.on('playFreq', (freq) => {
        console.log('received play sound message');
        osc.freq(freq);
        env.play(osc);
    });

    socket.on('updateRooms', (refreshedRooms) => {
      console.log('received updated available rooms', refreshedRooms);
      availableRooms = refreshedRooms;
      if(menuState == 1){
        loadRoomUI();
      }
      
    });

    socket.emit('requestAvailableRooms');

    
    /*startButton = createButton('start');
    startButton.position(300, 300);
    startButton.mousePressed(joinRoom);*/

    //SOCKET: EMIT createRoom !!!!!!!
    frameRate(100);
}

function joinRoom(){
  room = roomNameInput.value();
  socket.emit('room',room);
  date = new Date;
  inRoom=true;
/*
let joinRoomButton;
let refreshButton;
let roomNameInput;
let room;

let availableRooms;
let UIrooms = [];
*/
  joinRoomButton.hide();
  refreshButton.hide();
  roomNameInput.hide();
  UIrooms.forEach(rm => rm.hide());



  menuState = 3;//make 2 when character select done
  //startButton.hide();
  
}

function refreshRooms(){
  socket.emit('requestAvailableRooms');
  console.log("available rooms: ", availableRooms);
}

function draw() {
  //console.log(connectedClients);
    socket.on('start', (data) => {
        console.log('player connected, id: ', data.id);
    })
  //CAMERA: zoom to fit both characters
  //camtargetx is average of both x values
  switch(menuState){
    case 0:
      background(0);
      break;
    case 1:
      background(109, 107, 125);
      UIrooms.forEach(rm => drawRoomText(rm));
        //UIrooms.push(tempRoom);
      
      break;
    case 2:
      break;
    case 3:
      background(0);//161, 211, 247);//(BGImage);
      camTargetX = -playerFighter.posx;// 300;//-1 *(playerFighter.posx + AIEnemy.posx)/2;
      ambientLight(10,10,10);//xInput.value(),xInput.value(),xInput.value());
      spotLight(235,255,255, camTargetX +258,-315,-145,0,1,0, 100);
      //^^ streetlamp
      let spotIntensity = 7;
      //for(i = 0, i < spotIntensity; i += 1){ 
      //}
      //^ this breaks if i use a for loop i guess
      let spotlightOffset = Math.tan(millis() /1000) / 36 ;
      spotLight(255,255,255, camTargetX+ 864,74,48,-50,+ spotlightOffset,0, 100);
      spotLight(255,255,255, camTargetX+ 864,74,48,-50,+ spotlightOffset,0, 100);
      spotLight(255,255,255, camTargetX+ 864,74,48,-50,+ spotlightOffset,0, 100);
      spotLight(255,255,255, camTargetX+ 864,74,48,-50,+ spotlightOffset,0, 100);
      spotLight(255,255,255, camTargetX+ 864,74,48,-50,+ spotlightOffset,0, 100);
      spotLight(255,255,255, camTargetX+ 864,74,48,-50,+ spotlightOffset,0, 100);
      directionalLight(120, 120, 120, 0.9,8.7,-13.25);//xInput.value(), yInput.value(), zInput.value());
      //0.55, -3.35, -0.9);
      push();
      rotateX(PI);
      translate(camTargetX, -200, camTargetZ);
      rotateY(PI/2);
      scale(2.5);
      noStroke();
      texture(BGtext);
      model(mod);
      pop();
      AIEnemy.display();
      playerFighter.display();
      //-DELETE ME----
      connectedClients.forEach(player => {
          if(player.id != socket.id){
              //console.log(player.id, "  ", socket.id);
              AIEnemy.posx = player.x;
              AIEnemy.posy = player.y;
              AIEnemy.state = player.state;
          }
          //UPDATE position not draw
          //ellipse(player.x+camTargetX,player.y,30,30);
        })
        const data = {
            x: playerFighter.posx,
            y:playerFighter.posy,
            yVelocity: playerFighter.yVelocity,
            xAirVelocity: playerFighter.xAirVelocity,
            frameIndex:playerFighter.frameIndex,
            id:socket.id,
            state:playerFighter.state,
            room:room,
        }
        socket.emit('update', data);
        //--------------
    
      break;
  }
   /*else {
    //mainmenu
    background(0);
  }*/
  //move shit to different files so i dont have 800 lines again************************
}

function displayPlayer(ply){
    ellipse(ply.x+ca,ply.y,30,30);
}
class Player2{
    constructor(px,py){
        this.posx = px;
        this.posy = py;
    }
    display(){
        ellipse(this.posx,this.posy,40,40);
    }
}
class AIFighter{
  invincibilityPeriod = false;
  invincibilityTimer = hitInvincibilityPeriod;
  state=0;//idle,attack,forward,back,jump,crouch
  constructor(px,py){
    this.posx = px;
    this.posy = py;
    this.sprite = createSprite();
    this.image = loadImage('Assets/Characters/Stick/idle.gif');
    this.sprite.addImage(this.image);
    this.crouchImage = loadImage('Assets/Characters/Stick/crouch.png');
    this.idleImage = loadImage('Assets/Characters/Stick/idle.gif');
    this.standingAttackImage = loadImage('Assets/Characters/Stick/standing-attack.png');
    this.walkImage = loadImage('Assets/Characters/Stick/walk.gif');
    this.walkBackwardsImage = loadImage('Assets/Characters/Stick/walk-reverse.gif');
    this.jumpImage = loadImage('Assets/Characters/Stick/jump.png');
  }
  display(){
    //console.log(this.state);
    switch(this.state){
        case 0:
            this.sprite.addImage(this.idleImage);
            break;
        case 1:
            this.sprite.addImage(this.standingAttackImage);
            break;
        case 2:
            this.sprite.addImage(this.walkImage);
            break;
        case 3:
            this.sprite.addImage(this.walkBackwardsImage);
            break;
        case 4:
            this.sprite.addImage(this.jumpImage);
            break;
        case 5:
            this.sprite.addImage(this.crouchImage);
            break;
    }
    //[][][][] VVVVVVVV uncomment
    //this.sprite.mirrorX(-1);


    if(this.invincibilityPeriod){
      if(this.invincibilityTimer % 5 == 0){
        this.sprite.visible = !this.sprite.visible;
      }
      
      this.invincibilityTimer -=1;
      if(this.invincibilityTimer <= 0){
        this.invincibilityTimer = hitInvincibilityPeriod;
        this.invincibilityPeriod = false;
        this.sprite.visible = true;
      }
    }
    this.sprite.position.x = this.posx + camTargetX;
    this.sprite.position.y = this.posy;
    //this.sprite.mirrorX();
    this.sprite.display();
  }
  hurt(dmg){
    if(!this.invincibilityPeriod){
      //this.posy += 1;
      this.invincibilityPeriod = true;
    }
    
  }
}

class PlayerFighter{
  frameIndex = 0;
  frameLimit = 15;

  yVelocity = 0;
  dampening = 0.3;
  xAirVelocity = 0;
  airSpeed = 5;
  jumpPower = 10;
  
  hitboxPositions = [70,-10,55,55];//OUTDATED
  hitboxPosition = [70,-10];

  state = 0;//idle,attack,forward,back,jump,crouch

  constructor(px,py,characterName){
    /*var obj = JSON.parse('{ "name":"John", "age":30, "city":"New York"}');
    console.log(obj.name);
    let requestURL = 'Assets/Characters/Stick/Stick.json';*/
    
    
    //[][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]
    this.posx = px;
    this.posy = py;
    this.sprite = createSprite();
    this.crouchImage = loadImage('Assets/Characters/'+playerCharacterName+'/crouch.png');
    this.idleImage = loadImage('Assets/Characters/'+playerCharacterName+'/idle.gif');
    this.standingAttackImage = loadImage('Assets/Characters/'+playerCharacterName+'/standing-attack.png');
    this.walkImage = loadImage('Assets/Characters/'+playerCharacterName+'/walk.gif');
    this.walkBackwardsImage = loadImage('Assets/Characters/'+playerCharacterName+'/walk-reverse.gif');
    this.jumpImage = loadImage('Assets/Characters/'+playerCharacterName+'/jump.png');
    //this.walkImage2 = loadImage('Assets/Placeholder/default-player-walk2.png');
    this.sprite.addImage(this.idleImage);
    
  }
  display(){
    //console.log(this.state);
    if(this.posx < -levelWidth/2 + levelCenter){
      this.posx = -levelWidth/2 + levelCenter;
    } else if(this.posx > levelWidth/2 + levelCenter){
      this.posx = levelWidth/2 + levelCenter;
    }/* else if (this.posx > AIEnemy.posx - AIEnemy.image.width){
      this.posx = AIEnemy.posx - AIEnemy.image.width;
    }*/

    //^^^^^ UNCOMMENT

    //if not on ground: 

    if(this.posy < floorLevel){
      this.sprite.addImage(this.jumpImage);
      this.state = 4;
      this.posy -= this.yVelocity;
      this.yVelocity -= this.dampening;
    } else {
      this.posy = floorLevel;
      this.yVelocity = 0;
    }
    //console.log(this.posy);
    if(this.frameIndex > 0){
      if(debugModeEnabled){
        ellipse(this.posx + camTargetX+this.hitboxPosition[0], this.posy+this.hitboxPosition[1], 10,10);
      }
      if(this.posx + this.hitboxPosition[0] > AIEnemy.posx - AIEnemy.image.width){
        AIEnemy.hurt(1);
      }
      this.frameIndex+= 1;
      if(this.frameIndex > 30 && !(keyIsDown(DOWN_ARROW))){
        this.frameIndex = 0;
        this.sprite.addImage(this.idleImage);
      }
    }
    if(this.posy >= floorLevel){
      this.xAirVelocity = 0;
      if (keyIsDown(LEFT_ARROW)){
        this.frameIndex = 0;
        this.left();
        this.state = 3;
      } else if (keyIsDown(RIGHT_ARROW)){
        this.frameIndex = 0;
        this.right();
        this.state = 2;
      } else if(this.frameIndex == 0 && !(keyIsDown(DOWN_ARROW))){
        this.frameIndex = 0;
        this.idle();
      }
    } else {
      this.posx += this.xAirVelocity;
    }
    
    //this.sprite.width = 200;
    this.sprite.position.x = this.posx + camTargetX;
    this.sprite.position.y = this.posy;
    
    this.sprite.display();

    //JUMP: TILT JUMP SPRITE BY DIRECTION BACK/FORWARD
    //ALSO: change paths and files into characters/ directory
    if(keyIsDown(DOWN_ARROW)){
      this.sprite.addImage(this.crouchImage);
      this.state = 5;
    }
  }

  attack(){
    this.frameIndex = 1;
    this.sprite.addImage(this.standingAttackImage);
    this.state = 1;
  }
  idle(){
    this.sprite.addImage(this.idleImage);
    this.state = 0;
  }
  left(){
    if(this.posx > -levelWidth/2 + levelCenter){
      this.posx -=5;
    }
    this.sprite.addImage(this.walkBackwardsImage);
  }
  right(){
    //if(this.posx < AIEnemy.posx - AIEnemy.image.width){
      this.posx +=5;
    //}
    //[][][][][]]^^ uncomment
    this.sprite.addImage(this.walkImage);
  }
  jump(){
    if(this.posy >= floorLevel){
      if(keyIsDown(LEFT_ARROW)){
        this.xAirVelocity = -this.airSpeed;
      } else if(keyIsDown(RIGHT_ARROW)){
        this.xAirVelocity = this.airSpeed;
      }
      this.yVelocity = this.jumpPower;
      this.sprite.addImage(this.jumpImage);
      this.posy -= this.yVelocity;
    }
  }
}

function keyPressed(){
  if(keyCode == 88 && !keyIsDown(RIGHT_ARROW) && !keyIsDown(LEFT_ARROW)){
    playerFighter.attack();
  }
  else if(keyCode == 90){
    playerFighter.jump();
  }
}

socket.on('connectionSuccess', function(data) {
  console.log('Successfully connected to room with ID = ', data);
});

socket.on('message', function(data) {
  console.log('Message from server : ', data);
});

function loadRoomUI(){//maybe deal with if it goes over the screen
  joinRoomButton = createButton('Join room');
  joinRoomButton.position(480, 400);
  joinRoomButton.mousePressed(joinRoom);

  refreshButton = createButton('Refresh');
  refreshButton.mousePressed(refreshRooms);
  refreshButton.position(200, 400);

  roomNameInput = createInput('');
  roomNameInput.position(300, 400);

  /*xInput = createSlider(-200, 200, -50, 1);
  xInput.position(10, 10);
  yInput = createSlider(-200, 200, 0, 1);
  yInput.position(10, 20);
  zInput = createSlider(-200, 200, 0, 1);
  zInput.position(10, 30);*/
  var i = 0;
  for(const [key, value] of Object.entries(availableRooms)){
    tempRoom = new availableRoomUI(key,i,value);
    UIrooms.push(tempRoom);
    i++;
  }
  /*availableRooms.forEach((item, i) => {
    tempRoom = new availableRoomUI(item,i);
    UIrooms.push(tempRoom);
  }) */
}

function drawRoomText(UIrm){
 /* textFont(UIFont);
  textSize(12);
  text('ass',15,-UIrm.posy);
  */
 //THIS is for when custom buttons
}

class availableRoomUI {
  topMargin = 100;
  bWidth = 250;
  bHeight = 20;
  room = "";
  
  constructor(room,index,numPlayers){//and # players?
    this.numPlayers = numPlayers;
    this.roomName = room;
    this.button = createButton(room);//createImg('Assets/Placeholder/UIBox.png');//createButton(room + '__________________________Players: ' + numPlayers);//+ '     ' + numPlayers);
    this.button.size(this.bWidth,this.bHeight);
    this.posx = canvasWidth/2 - this.bWidth/2;
    this.posy = this.topMargin+(index*this.bHeight);
    this.button.position(this.posx, this.posy);
    this.button.mousePressed(function() { roomNameInput.value(room);});//roomNameInput
  }
  hide(){
    this.button.hide();
  }
  
}


