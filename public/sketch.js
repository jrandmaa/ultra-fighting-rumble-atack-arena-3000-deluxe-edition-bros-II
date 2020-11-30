const socket = io.connect();
let env, osc;
socket.on('connect', () => {
    console.log('client connected')
})

let canvasWidth = 800;
let canvasHeight = 500;

let canvas;

let img, mod, BGtext, BGImage;
let theta = 0;
let gradient;
let myShader;
let camTargetX = 0;
let camTargetZ = 100;
let AIEnemy;
let playerFighter;
let player2Fighter;

let floorLevel = 105;
let levelWidth = 1100;
let levelCenter = 0;

let hitInvincibilityPeriod = 100;

let playerCharacterName = null;// = "Maurice";
let player2CharacterName = null;

let debugModeEnabled = false;

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
let characterPortraits;
let player1CharacterLarge;
let player2CharacterLarge;
let startGameButton;

/*
now:
- make new spritesheet, make sure character switch works
- once have portraits: char select
--------
-character jumping moves camera y above a point
- non placeholder font
-gameplay :(((
*/


//ref
  //ellipse(this.posx, this.posy - this.img.height/2, 10, 10);


function preload(){
  UIFont = loadFont('Assets/Placeholder/SHPinscher-Regular.otf');
  loadJSON('Assets/JSON/characters.json', pullData);
  BGtext = loadImage('Assets/Textures/tempBG-text-f8.png');
  BGImage = loadImage('Assets/Textures/sky.png');
  mod = loadModel('tempBG2.obj');
  myShader = loadShader('basic.vert', 'basic.frag');
}

function pullData(info){
  //characterInfo = info;
  characters = info;
  console.log(info);
  //console.log(ass[0]);
}

function startTitle(){
  menuState=1;
  socket.emit('requestAvailableRooms');
  startButton.hide();
}

function setup() {
  console.log('player id: ', socket.id);
  //socket.emit('roomEntered', roomPassword);
  canvas = createCanvas(canvasWidth, canvasHeight, WEBGL);
  canvas.drawingContext.imageSmoothingEnabled = false;
  // noStroke();

  //player1CharacterLarge = createSprite();//-300,30,100,200);
  player1CharacterLarge = (loadImage('Assets/empty.png'));//Characters/Stick/idle.gif'));
  //player2CharacterLarge = createSprite();//250,30,100,200);
  player2CharacterLarge = (loadImage('Assets/empty.png'));//Characters/Stick/idle.gif'));
  player1CharacterLarge.height = 200;
  player2CharacterLarge.height = 200;
  //player2CharacterLarge.position = (10,10);


  startButton = createImg('Assets/UI/START.png');
  startButton.mousePressed(startTitle);
  startButton.position(canvas.width/2 - 50,canvas.height*3/4)
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

    socket.on('player2Selected', (chr) => {
      player2CharacterLarge=(loadImage('Assets/Characters/'+chr+'/idle.gif'));

      //player2CharacterLarge.position = (250,30);
      //player2CharacterLarge.height = 200;
      player2CharacterName = chr;
      AIEnemy.setCharacter(chr);
  });

  socket.on('startGame',function() {
    console.log("Server force game start...");
    startGame();
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
  joinRoomButton.hide();
  refreshButton.hide();
  roomNameInput.hide();
  UIrooms.forEach(rm => rm.hide());
  menuState = 2;//make 2 when character select done
  if(player2CharacterName != null){
    player2CharacterLarge=(loadImage('Assets/Characters/'+player2CharacterName+'/idle.gif'));//player2CharacterName
  }
  
  loadCharSelect();
  
  startGameButton = createButton('start game');
  startGameButton.position(canvas.width/2 - 40,canvas.height - 100);
  startGameButton.mousePressed(function() { socket.emit('startGame', room);});//socket.emit('startGame', room);
  //startGameButton
}

function selectCharacter(name){
  playerFighter.setCharacter(name);
  socket.emit('playerSelected',name);
  console.log("name: "+name);
  playerCharacterName = name;
  player1CharacterLarge=(loadImage('Assets/Characters/'+name+'/idle.gif'));

  /*player1CharacterLarge.position = (-300,30);
  player1CharacterLarge.height = 200;*/

  //socket.emit('playerSelected',name);//maybe room too

  //Player 1 has selected: (larger portrait on left), 
  //send message to server with room and character chosen
  //(above) on recieve callback message from other player set some global var for player2 char to argument
  //global var is null by default, in draw loop display (none chosen) if null or large portrait using "name"

  //on bottom: display char/+name+/idle.gif with set height
  //below that in custom font put their name
}

function startGame(){
  console.log(playerCharacterName+"   "+player2CharacterName);
  if(player2CharacterName != null && playerCharacterName != null){
    console.log("starting game");
    characterPortraits.forEach(pt => pt.hide());
    startGameButton.hide();
    menuState = 3;
    
    //SEND START GAME MESSAGE TO SERVER THEN TO OTHER PLAYER
  }
  
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
        //add text explaining
      
      break;
    case 2:
      //button to start
      background(69, 67, 85);//HEY. instead of background, try image() first (w skybox) then rendering the next stuff (just replace this line)
      textFont(UIFont);
      textSize(20);
      let p1Posx =  -375 + (player1CharacterLarge.width/2);
      let p2Posx = 175 + (player2CharacterLarge.width/2);
      text('Player 1',p1Posx + player1CharacterLarge.width/2,-60);
      text('Player 2',p2Posx + player2CharacterLarge.width/2,-60);
      image(player1CharacterLarge, p1Posx,-50,player1CharacterLarge.width*1.75,player1CharacterLarge.height*1.75);
      image(player2CharacterLarge, p2Posx,-50,player2CharacterLarge.width*1.75,player2CharacterLarge.height*1.75);
      /*player2CharacterLarge.mirrorX(-1);
      player2CharacterLarge.position.x = -200;
      player2CharacterLarge.position.y = 100;//80*/
      
      //drawSprites();
      
      //characterPortraits.forEach(char => char.portraitImage.draw());
      break;
    case 3:
      background(0);//161, 211, 247);//(BGImage);
      camTargetX = -playerFighter.posx;// 300;//-1 *(playerFighter.posx + AIEnemy.posx)/2;
      ambientLight(10,10,10);//xInput.value(),xInput.value(),xInput.value());
      spotLight(235,255,255, camTargetX +258,-315,-145,0,1,0, 100);
      spotLight(235,255,255, camTargetX +258,-315,-145,0,1,0, 100);

      spotLight(235,255,255, camTargetX -100,-415,-145,0,1,0, 100);
      spotLight(235,255,255, camTargetX -100,-415,-145,0,1,0, 100);
      spotLight(235,255,255, camTargetX -100,-415,-145,0,1,0, 100);


      //DIRECTIONAL LIGHT DOWN BLUISH AMBIENT FOR MOONLIGHT JUST MAKE BG DARKER IN TEXTURE

      //^^ streetlamp
      let spotIntensity = 7;
      //for(i = 0, i < spotIntensity; i += 1){ 
      //}
      //^ this breaks if i use a for loop i guess
      let spotlightOffset = Math.tan(millis() /1000) / 36 ;
      /*spotLight(255,255,255, camTargetX+ 864,74,48,-50,+ spotlightOffset,0, 100);
      spotLight(255,255,255, camTargetX+ 864,74,48,-50,+ spotlightOffset,0, 100);
      spotLight(255,255,255, camTargetX+ 864,74,48,-50,+ spotlightOffset,0, 100);
      spotLight(255,255,255, camTargetX+ 864,74,48,-50,+ spotlightOffset,0, 100);
      spotLight(255,255,255, camTargetX+ 864,74,48,-50,+ spotlightOffset,0, 100);
      spotLight(255,255,255, camTargetX+ 864,74,48,-50,+ spotlightOffset,0, 100);*/
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
      
    
      break;
  }
  connectedClients.forEach(player => {
    if(player.id != socket.id){
        //console.log(player.character+"   "+player2CharacterName);
        //console.log(player.id, "  ", socket.id);
        if(player2CharacterName != player.character){
          player2CharacterName = player.character;
          player2CharacterLarge=(loadImage('Assets/Characters/'+player2CharacterName+'/idle.gif'));
          AIEnemy.setCharacter(player2CharacterName);
        }
        
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
      character:playerCharacterName,
  }
  socket.emit('update', data);
  
   /*else {
    //mainmenu
    background(0);
  }*/
  //move shit to different files so i dont have 800 lines again************************
}

function displayPlayer(ply){
    ellipse(ply.x+ca,ply.y,30,30);
}

class AIFighter{
  invincibilityPeriod = false;
  invincibilityTimer = hitInvincibilityPeriod;
  state=0;//idle,attack,forward,back,jump,crouch
  constructor(px,py){
    this.posx = px;
    this.posy = py;
    this.sprite = createSprite();
    
  }

  setCharacter(chr){
    this.crouchImage = loadImage('Assets/Characters/'+chr+'/crouch.png');
    this.idleImage = loadImage('Assets/Characters/'+chr+'/idle.gif');
    this.standingAttackImage = loadImage('Assets/Characters/'+chr+'/standing-attack.png');
    this.walkImage = loadImage('Assets/Characters/'+chr+'/walk.gif');
    this.walkBackwardsImage = loadImage('Assets/Characters/'+chr+'/walk-reverse.gif');
    this.jumpImage = loadImage('Assets/Characters/'+chr+'/jump.png');
    //this.walkImage2 = loadImage('Assets/Placeholder/default-player-walk2.png');
    this.sprite.addImage(this.idleImage);
    this.currImage = this.idleImage;
  }

  display(){
    this.sprite.addImage(this.currImage);
    if(this.posx > playerFighter.posx){
      this.sprite.mirrorX(-1);
    } else {
      this.sprite.mirrorX(1);
    }
    
    //console.log(this.state);
    switch(this.state){
        case 0:
          this.currImage = this.idleImage;
            break;
        case 1:
            this.currImage = this.standingAttackImage;
            break;
        case 2:
            this.currImage = this.walkImage;
            break;
        case 3:
            this.currImage = this.walkBackwardsImage;
            break;
        case 4:
            this.currImage = this.jumpImage;
            break;
        case 5:
            this.currImage = this.crouchImage;
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
    
    
  }

  setCharacter(chr){
    this.crouchImage = loadImage('Assets/Characters/'+chr+'/crouch.png');
    this.idleImage = loadImage('Assets/Characters/'+chr+'/idle.gif');
    this.standingAttackImage = loadImage('Assets/Characters/'+chr+'/standing-attack.png');
    this.walkImage = loadImage('Assets/Characters/'+chr+'/walk.gif');
    this.walkBackwardsImage = loadImage('Assets/Characters/'+chr+'/walk-reverse.gif');
    this.jumpImage = loadImage('Assets/Characters/'+chr+'/jump.png');
    //this.walkImage2 = loadImage('Assets/Placeholder/default-player-walk2.png');
    this.sprite.addImage(this.idleImage);
  }

  display(){
    if(this.posx > AIEnemy.posx){
      this.sprite.mirrorX(-1);
    } else {
      this.sprite.mirrorX(1);
    }
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
      if(this.posx + this.hitboxPosition[0] > AIEnemy.posx - AIEnemy.currImage.width){
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
    this.button = createButton(room + "---------------|---------------"+numPlayers+" in room");//createImg('Assets/Placeholder/UIBox.png');//createButton(room + '__________________________Players: ' + numPlayers);//+ '     ' + numPlayers);
    this.button.size(this.bWidth,this.bHeight);
    this.posx = canvas.width/2 - this.bWidth/2;
    this.posy = this.topMargin+(index*this.bHeight);
    this.button.position(this.posx, this.posy);
    this.button.mousePressed(function() { roomNameInput.value(room);});//roomNameInput
  }
  hide(){
    this.button.hide();
  }
  
}

function loadCharSelect(){
  //this.jumpImage = loadImage('Assets/Characters/'+playerCharacterName+'/jump.png');
  /*
  for (let i = 0; i < frames.length; i++) {
    let pos = frames[i].position;
    let img = spritesheet.get(pos.x, pos.y, pos.w, pos.h);
    animation.push(img);
  }
  */
  console.log("Loading character selection (length: "+characters.characters[0]+")");
  characterPortraits = []

 for (let i = 0; i < characters.characters.length; i++){
   //come up with a spacing algorithm later

   //use characters.characters.length (if root x is whole number: add another column)
    characterPortraits.push(new CharacterSelectPortrait(characters.characters[i],i));
    console.log("Loading ("+i+")...");
 }

}

class CharacterSelectPortrait{

  constructor(character, index){
    console.log("char:"+character);
    this.character = character;
    this.portraitImage = createImg('Assets/Characters/'+character.name+'/portrait.png');
    this.portraitImage.mousePressed(function() {selectCharacter(character.name);});
    this.portraitImage.position((canvas.width/2 - (65))+(index * 65),100);//canvas.width/2 - (totalCharacters/2 * 65) for x
    console.log(index);
    this.portraitImage.size(60,60);
  }
  hide(){
    this.portraitImage.hide();
  }
}


