'use strict';

var svg_w = 141.73;
var svg_h = 141.73;

var contour_path = `
M71.144,83.446
c5.493-0.011,11.01-1.646,15.52-4.978
c7.393-5.467,10.729-14.66,8.107-22.358
l-0.045-0.146
c-0.43-1.413-2.381-5.713-5.526-6.676
c-3.599-1.103-8.767-0.507-12.955,8.593
c-2.979,6.475-4.78,15.04-5.068,24.118
C71.162,82.482,71.151,82.965,71.144,83.446 
`;
var shape_path = `
M70.987,107.762
c-0.078,0.025-0.157,0.049-0.237,0.071
c-2.41,0.671-4.986-0.489-5.755-2.592
c-1.462-3.998-2.431-9.175-2.823-14.861
c-6.223-1.499-12.011-4.588-16.49-9.2
c-5.746-5.918-8.506-13.435-7.773-21.165
s4.872-14.748,11.654-19.761
c4.561-3.371,10.067-5.608,15.931-6.474
c0.415-0.077,1.257-0.207,2.232-0.211
c3.579-0.016,5.227,1.646,5.891,2.638
c2.542,3.797-1.232,8.182-5.692,12.355
c-1.725,1.615-4.623,1.703-6.473,0.198
c-1.797-1.462-1.944-3.891-0.369-5.508
c-2.009,0.799-3.894,1.84-5.599,3.1
c-4.916,3.634-7.916,8.72-8.447,14.322
c-0.531,5.602,1.469,11.05,5.634,15.339
c2.611,2.689,5.836,4.664,9.346,5.898
c0.001-0.044,0.003-0.089,0.004-0.134
c0.225-7.073,1.4-17.478,5.724-26.875
c2.629-5.712,6.169-9.756,10.521-12.019
c4.287-2.229,9.117-2.623,13.97-1.136
c8.108,2.485,10.944,10.851,11.34,12.153
c1.765,5.233,1.662,10.92-0.295,16.452
c-1.978,5.586-5.677,10.502-10.696,14.213
c-2.959,2.187-6.234,3.845-9.671,4.982
c-3.7,1.227-7.587,1.85-11.472,1.885
c0.4,4.404,1.182,8.373,2.279,11.377
C74.465,104.844,73.246,107.014,70.987,107.762
`;
var path = contour_path + shape_path;


var commandRegex = /[a-z][^a-z]*/ig;
var coordRegex = /[-]?[0-9]+([.][0-9]+)?/g;

function applyCommand(cmd, coords, lastCoords) {

  switch (cmd.toUpperCase()) {
    case "M":
      //endShape(); beginShape();
      vertex(coords[0], coords[1]);
    break;

    case "C":
      bezierVertex(coords[0], coords[1], coords[2], coords[3], coords[4], coords[5]);
    break;

    case "S":
      // first two arguments must be mirrored (in relative coordinates).
      bezierVertex(lastCoords[0]-lastCoords[2], lastCoords[1]-lastCoords[3], 
                   coords[0], coords[1], 
                   coords[2], coords[3]);
    break;

    case "L":
      line(lastCoords[0], lastCoords[1], coords[0], coords[1]);
    break;

    default:
      console.log("applyCommand: unknown command \"" + cmd + "\".");
    break;
  };


  // Update current position.
  lastCoords[0] = coords[coords.length-2];
  lastCoords[1] = coords[coords.length-1];
  // Update last control point.
  if (coords.length >= 4) {
    lastCoords[2] = coords[coords.length-4] - lastCoords[0];
    lastCoords[3] = coords[coords.length-3] - lastCoords[1];
  }

  return lastCoords;
}

function drawPath(path) {
  // Retrieve each commands individually.
  var pathCommands = path.match(commandRegex);

  // Save the current position of the pen / shape, and the last control point if any.
  var lastCoords = [0.0, 0.0, 0.0, 0.0];

  // Apply each commands with their extracted arguments.
  for (var i=0; i<pathCommands.length; ++i) {
    // Current command.
    var cmdString = pathCommands[i];
    // Command identifier.
    var cmd = cmdString[0];

    // Array of floating point coordinates.
    var coords = cmdString.match(coordRegex).map(function(x) {
      return parseFloat(x);
    });

    // Force absolute coordinates.
    if (cmd.toLowerCase() == cmd) {
      coords = coords.map(function(x, i) {
        return lastCoords[i&1] + x;
      });
    }
    else {
      // Translate the SVG to be centered.
      coords = coords.map(function(x, i) {
        return -0.5*((i&1) ? svg_h: svg_w) + x;
      });
    }

    // Apply the command.
    lastCoords = applyCommand(cmd, coords, lastCoords);
  }

  //endShape(CLOSE);
}

function smoothstep(a, b, x) {
  x = constrain((x-a)/(b-a), 0, 1);
  return x*x*(3-2*x);
}

function renderPhi() {
  // To avoid manually do this, we need to detect contour vs shape path
  // by looking at the vertex wind order.
  beginShape();
    drawPath(shape_path);  
    beginContour();
      drawPath(contour_path);
    endContour();
  endShape(CLOSE);
}

//-----------------------------------------------------------------------------

var startTime;
var bgSound;
var fft;

function preload() {
  //bgSound = loadSound('assets/tropicalenchon.mp3');
}

function setup() {
  var canvas = createCanvas(640, 480);
  canvas.parent('p5-sketch');
  fill(color('#C94E34'));
  stroke(color('#00B6CD'));
  strokeWeight(2);

  bgSound.setVolume(0.8);
  bgSound.loop();
  fft = new p5.FFT();
  
  startTime = millis();
}

function draw() {
  background(25);
  
  push();
    translate(frameCount / 3, height/3);
    rotate(millis() / 1000.);
    
    var data = fft.analyze();
    var scaleFactor = 0.1*data[data.length/2];//sin(millis() / 400.0);
    scale(0.25 *( 1.0 + scaleFactor));
  
    renderPhi();
  pop();

  var t = smoothstep(0.0, 1500.0, millis()-startTime);
  var alpha = lerp(0.0, TWO_PI, t);
  translate(0.5*width, 0.5*height);
  rotate(alpha);

  scale(4.0);

  renderPhi();
}

function mouseClicked() {
  startTime = millis();
}
