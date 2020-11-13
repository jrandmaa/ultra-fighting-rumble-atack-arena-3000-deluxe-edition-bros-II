class SoundCircle {
    constructor(id, x, y, size, col){
        this.id = id;
        this.pos = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.fc = 0.1;
        this.friction = 0.001;
        this.maxSpeed = 10.0;
        this.size  = size;
        this.mass = this.size/30;
        this.col = col;
        this.clicked = false;
 
    }

    checkClick(mx, my){
        const distMouse = dist(mx, my, this.pos.x, this.pos.y);
        if(distMouse < this.size){
            this.clicked = true;
            this.increaseSize();
            return true
        }
    }

    checkEdges(){
        if(this.pos.x < 0){
            this.pos.x = width - this.size/2;
        } else if (this.pos.x > width){
            this.pos.x = 0 + this.size/2;
        }
        if(this.pos.y < 0 ){
            this.pos.y = height;
        } else if(this.pos.y > height){
            this.pos.y = 0;
        }
    }

    display(){
        fill(this.col);
        stroke(220, 200, 220);
        const ellipseStroke = this.clicked ? 9 : 3;
        strokeWeight(ellipseStroke);
        ellipse(this.pos.x, this.pos.y, this.size);
        if(this.clicked){
            this.drawLine(this.pos.x, this.pos.y, mouseX, mouseY);   
        } 
    }

    drawLine(cx, cy, mx, my){
        stroke(200, 20, 200);
        strokeWeight(9);
        line(cx, cy, mx, my);
    }

    increaseSize(){
        if(this.size > 100){
            this.size = 20;
        } else {
            this.size += 5;
        }
    }


    move(){
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.pos.add(this.velocity);
        this.acceleration.mult(0);
        this.velocity.mult(0.99);
    }


    setSpeed(mx, my){
        const mousePos = createVector(mx, my);
        const currentPos = createVector(this.pos.x, this.pos.y);
        const dist = currentPos.sub(mousePos);
        this.acceleration = dist.mult(.01, .01);
    }
}