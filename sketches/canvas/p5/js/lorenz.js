'use strict';

// ----------------------------------------------------------------------------


var Attractor = function() {
  var a = 10.0;
  var b = 28.0;
  var c = 8.0 / 3.0;

  this.point = new p5.Vector(0.01, 0.0, 0.0);
  this.points = []
  this.pointsSizeLimit = 128;

  this.update = function(dt) {
    var dx = a * (this.point.y - this.point.x);
    var dy = this.point.x * (b - this.point.z) - this.point.y;
    var dz = this.point.x * this.point.y - c * this.point.z;

    var v = new p5.Vector(dx, dy, dz).mult(dt);
    v.add(this.point);
    this.point.set(v);

    v.mult(4.0);

    if (this.points.length > this.pointsSizeLimit) {
      this.points.shift(); //
    }
    this.points.push(v);
  };

  this.render = function() {
    var offset = new p5.Vector();
    var scale = 0.01;
      
    for (var i in this.points) {
      var v = this.points[i];
      var di = i / this.pointsSizeLimit;
      var radius = 1.0 + 4.0*di;

      fill(25+225*di, 25+120*di, 0.0);

      offset.x = 0.5-noise(v.x*scale);
      offset.y = -1.0 + 2.0*noise(v.y*scale);
      offset.z = -1.0 + 2.0*noise(v.z*scale);
      v.add(offset);

      push();
        translate(v.x, v.y, v.z);
        sphere(radius);
      pop();
    }
  };
}

var attractor;

// ----------------------------------------------------------------------------

function setup() {
  var canvas = createCanvas(800, 600, WEBGL);
  canvas.parent('p5-sketch');

  attractor = new Attractor();
}

function draw() {
  //orbitControl();
  rotateY(0.0001*millis());
  attractor.update(0.01);
  attractor.render();
}
