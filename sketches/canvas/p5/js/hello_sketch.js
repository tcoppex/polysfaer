'use strict';

var bg_gradient = 50;

function Buddy(x, y) {
  this.x = x;
  this.y = y;
  this.w = 50.0;
  this.h = 80.0;

  this.arm_angle = 0.0;

  this.display = function() {
    stroke(120);

    var half_w = this.w / 2;
    var half_h = this.h / 2;
    var offset = 0.0;

    noFill();

    // legs
    var bottom_x = this.x;
    var bottom_y = this.y + 0.5 * this.h;
    var len = 1.6 * this.h;
    offset = 0.5 * half_w;
    line(bottom_x - offset, bottom_y, bottom_x - offset, bottom_y + len);
    line(bottom_x + offset, bottom_y, bottom_x + offset, bottom_y + len);

    // arm(s)
    var arm_x = this.x - 0.5 * half_w;
    var arm_y = this.y - 0.2 * half_h;
    var arm_len = 1.625 * this.h;
    this.arm_angle += 6.0;
    var arm_dir = p5.Vector.fromAngle(radians(this.arm_angle));
    line(arm_x+offset, arm_y, arm_x + arm_len * arm_dir.x, arm_y + arm_len * arm_dir.y);

    // body
    fill(bg_gradient)
    rect(this.x - half_w, this.y - half_h, this.w, this.h);

    line(arm_x, arm_y, arm_x - arm_len * arm_dir.x, arm_y + arm_len * arm_dir.y);

    // eyes
    var n = noise(millis());
    var awake = abs(sin(0.07*frameCount) -  0.93*n);
    if (awake < 0.4) return; 
    var eye_x = this.x + 0.6 * half_w;
    var eye_y = this.y - 0.4 * half_h;
    offset = 0.1 * half_w;
    point(eye_x - offset, eye_y);
    point(eye_x + offset, eye_y);

  }
}

var Data = {
  buddy: null,
};

// ----------------------------------------------------------------------------

function setup() {
  var canvas = createCanvas(540, 360);
  canvas.parent('p5-sketch');
  //noLoop();
  frameRate(60);

  Data.buddy = new Buddy(width / 2, height / 2);
}

function draw() {
  background(bg_gradient);

  Data.buddy.display();
}