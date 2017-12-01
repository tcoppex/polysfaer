'use strict';

/*
var lastTick = 0;

function getDeltaTime() {
  var tick = millis();
  var dt = tick - lastTick;
  lastTick = tick;
  return dt;
}

document.onfocus = function() { };
document.onblur  = function() { };
*/

// ----------------------------------------------------------------------------

function Branch(pos, vel, length, lvl) {
  this.pos = pos.copy();
  this.end = pos.copy();
  this.vel = vel.copy();
  this.length = length;
  this.lvl = lvl;
  this.forked = (lvl == 0 || length <= 0);

  // rendering
  this.red = 128 / this.lvl;
  this.weight = random(1) + 4 / this.lvl;

  this.timeToBranch = function() {
    if (this.forked) {
      return false;
    }
    var len = p5.Vector.sub(this.end, this.pos).mag();
    this.forked = len >= this.length;
    return this.forked;
  }

  this.branch = function(angle) {
    var new_vel = this.vel.copy().rotate(radians(angle));
    return new Branch(this.end, new_vel, 3 * this.length / 4, this.lvl - 1);
  }

  this.branches = function() {
    var n = 1 + Math.floor(random(3));
    var a = [];
    var bound = 120.0 / this.lvl;
    for (var i = 0; i < n; ++i) {
      var angle = random(-bound, bound);
      a.push(this.branch(angle));
    }
    return a;
  }

  this.update = function(dt) {
    if (this.forked) {
      return;
    }
    var t = 0.1 * dt;
    this.end.add(p5.Vector.mult(this.vel, t));
  };

  this.render = function() {
    stroke(this.red, 50, 60);
    strokeWeight(this.weight);
    line(this.pos.x, this.pos.y, this.end.x, this.end.y);
  }
}

function Tree(b) {
  this.branches = [b];

  this.update = function(dt) {
    for (var i = 0; i < this.branches.length; ++i) {
      this.branches[i].update(dt);

      if (this.branches[i].timeToBranch()) {
        //tree.push(tree[i].branch(31)); tree.push(tree[i].branch(-28));
        this.branches = this.branches.concat(this.branches[i].branches());
      }
    }  
  }

  this.render = function() {
    for (var i = 0; i < this.branches.length; ++i) {
      this.branches[i].render();
    }  
  }
}

//-----------------------------------------------------------------------------

var tree;

//-----------------------------------------------------------------------------

function setup() {
  var canvas = createCanvas(540, 360);
  canvas.parent('p5-sketch');

  var b = new Branch(createVector(width / 2, height), createVector(0.0, -1.0), height / 4, 9); 
  tree = new Tree(b);
}

function draw() {
  background(100);

  var dt = 15.0; //getDeltaTime();

  tree.update(dt);
  tree.render();
}
