const socket = io.connect();
let env, osc;
socket.on('connect', () => {
    console.log('client connected')
})

let myCircle;
let otherCircles = [];

let img, mod;
let theta = 0;
let gradient;
let myShader;
let camTargetX = 0;
let camTargetZ = 100;
let AIEnemy;
let playerFighter;
let player2Fighter;

let floorLevel = 125;
let levelWidth = 800;

let hitInvincibilityPeriod = 100;

let playerCharacterName = "Stick";

let debugModeEnabled = true;

let players = [];
let otherPlayers = [];

//ref
  //ellipse(this.posx, this.posy - this.img.height/2, 10, 10);


function preload(){

  mod = loadModel('tempBG.obj');
  myShader = loadShader('basic.vert', 'basic.frag');
}

function setup() {
  createCanvas(800, 500, WEBGL);
  // noStroke();
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
   const data = {
        x: playerFighter.posx,
        y:playerFighter.posy,
        yVelocity: playerFighter.yVelocity,
        xAirVelocity: playerFighter.xAirVelocity,
        frameIndex:playerFighter.frameIndex,
        state:0,//idle,attack,forward,back,jump
    }
   socket.emit('start', data);

    socket.on('heartbeat', (data) => {
        
        otherPlayers = [];

        data.forEach((item, i) => {
            
            if(item.id != socket.id){
                /*otherPlayers.forEach((existingPlayer, i) => {
                    if(existingPlayer.id == item.id){

                    }
                });*/
                otherPlayers.push(item);
                //console.log(otherPlayers);
            }
        })    
    })

    socket.on('playFreq', (freq) => {
        console.log('received play sound message');
        osc.freq(freq);
        env.play(osc);
    })

    
    frameRate(100);
}

function draw() {
    socket.on('start', (data) => {
        console.log('player connected, id: ', data.id);
    })
  //CAMERA: zoom to fit both characters
  //camtargetx is average of both x values
  
  //move shit to different files so i dont have 800 lines again************************
  background(0);
  texture(gradient);
  
  camTargetX = -playerFighter.posx;// 300;//-1 *(playerFighter.posx + AIEnemy.posx)/2;
  
  push();
  rotateX(PI);
  translate(camTargetX, -200, camTargetZ);
  rotateY(PI/2);
   scale(2.5);
  model(mod);
  pop();
  AIEnemy.display();
  playerFighter.display();
//-DELETE ME----
otherPlayers.forEach(player => {
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
}

socket.emit('update', data);
//--------------
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
    this.crouchImage = loadImage('Assets/Characters/Stick/crouch.png');
    this.idleImage = loadImage('Assets/Characters/Stick/idle.gif');
    this.standingAttackImage = loadImage('Assets/Characters/Stick/standing-attack.png');
    this.walkImage = loadImage('Assets/Characters/Stick/walk.gif');
    this.walkBackwardsImage = loadImage('Assets/Characters/Stick/walk-reverse.gif');
    this.jumpImage = loadImage('Assets/Characters/Stick/jump.png');
    //this.walkImage2 = loadImage('Assets/Placeholder/default-player-walk2.png');
    this.sprite.addImage(this.idleImage);
    
  }
  display(){
    //console.log(this.state);
    if(this.posx < -levelWidth/2){
      this.posx = -levelWidth/2;
    } else if(this.posx > levelWidth/2){
      this.posx = levelWidth/2;
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
    if(this.posx > -levelWidth/2){
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

