'use strict';

var centerWidth = 32;
var nstep = 5;
var stepIncrement = 28;
var bgGreyscale = 200;
var shadingMode = 0;

function draw_circles(x, y) {

  for (var i = 0; i < nstep; ++i) {
    var radius = centerWidth + (nstep-i-1)*stepIncrement;

    if (shadingMode) {
      var c = bgGreyscale / (1 + i); 
      fill(125 + 0.75*c);
      noStroke();
    } else {
      fill(bgGreyscale);
      stroke(0, 150, 250);
    }

    ellipse(x, y, radius, radius);
  }
}

function setup() {
  var canvas = createCanvas(640, 480);
  canvas.parent('p5-sketch');

  ellipseMode(CENTER);


}

function keyPressed() {
  if (keyCode == 32) {
    shadingMode = !shadingMode;
  }
}

function draw() {
  background(bgGreyscale);

  var circleWeight = Math.max(1, 7*(mouseX / width));
  strokeWeight(circleWeight);

  //stepIncrement = 30 + 20.0 * (mouseX / width);
  //nstep = 4 + 3 * (mouseY / height);

  nstep = 4 + Math.abs(3 * Math.sin(0.0005*millis()));

  /* Offset between each X or Y outer circles. */
  var y_offset = (nstep * stepIncrement) / 2;
  var x_offset = 2*y_offset + centerWidth;

  var x_start = (width/2) % x_offset - x_offset;
  var y_start = (height/2) % y_offset - y_offset;

  /* Number of outer circle on Y. */
  var y_steps = 2*(height + y_offset-y_start+circleWeight) / y_offset; 

  for (var i = 0; i < y_steps; ++i) {
    var y = y_start + i * y_offset / 2;
    
    /* Shift on x coordinates alternatively.*/
    var shift = (i & 1) ? 0 : x_offset / 2;
    
    for (var x = x_start; x < width + x_offset; x += x_offset) {
      draw_circles(shift + x, y);  
    }
  }  
}