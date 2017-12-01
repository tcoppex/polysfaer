
function Particle() {
  this.pos = createVector(random(width), random(height));
  this.vel = p5.Vector.random2D();
  this.acc = createVector(0.0, 0.0);

  this.color = color(random(64, 200), random(25, 105), random(140));
  this.drag = random(0.4, 0.8);

  this.update = function() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0.0);
    this.vel.mult(this.drag);
  }

  this.applyField = function(field, resolution, w, h) {
    var index = floor(this.pos.y / resolution)*w + floor(this.pos.x / resolution);
    this.applyForce(field[index]);
  }

  this.applyForce = function(force) {
    this.acc.add(force);
  }

  this.show = function() {
    stroke(this.color);
    strokeWeight(1);

    point(this.pos.x, this.pos.y);
    
    strokeWeight(1);
    stroke(0);
  }

  this.constraints = function() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.x < 0) this.pos.x = width-1;
    if (this.pos.y < 0) this.pos.y = height-1;
  }
}

// ----------------------------------------------------------------------------

var noiseScale = 0.1;

var gridResolution = 25;
var ncols;
var nrows;

var numParticles = 3500;
var particles = [];
var flowField = []

function setup() {
  var canvas = createCanvas(30*gridResolution, 20*gridResolution);
  canvas.parent('p5-sketch');

  rectMode(CORNER);
  ncols = floor(width / gridResolution);
  nrows = floor(height / gridResolution);

  // Fill the particles buffer
  for (var i=0; i<numParticles; ++i) {
    particles[i] = new Particle();
  }

  // Fill the flow field buffer
  for (var i=0; i<ncols*nrows; ++i) {
    flowField[i] = createVector();
  }


  background(50);
}

function draw() {
  
  noStroke();
  fill(40, 60);
  rect(0, 0, width, height);

  var zoff = 0.005 * frameCount;
  for (var j = 0, index=0; j < nrows; ++j) {
    for (var i = 0; i < ncols; ++i, ++index) { 
      var n = noise(noiseScale*i, noiseScale*j, zoff);
      
     // var mouseFactor = 1.0;//mouseX / width;
      var v = p5.Vector.fromAngle(n * TWO_PI * 2);
      flowField[index] = v;

      // gradient colors
      /*
      fill(255*n);
      noStroke();
      rect(i*gridResolution, j*gridResolution, gridResolution, gridResolution);
      */

      // gradient vectors
      /*
      stroke(0, 50);
      push();
        translate(i * gridResolution, j * gridResolution);
        rotate(v.heading());
        line(0, 0, gridResolution, 0);
      pop();
      */
    }
  }

  for (var i in particles) {
    var p = particles[i];

    p.applyField(flowField, gridResolution, ncols, nrows);
    p.update();
    p.constraints();
    p.show();
  }
}
