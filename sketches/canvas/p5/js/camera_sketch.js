'use strict';

var Data = {
  capture: null,
  mic: null,
};

function setup() {
  noStroke();
  ellipseMode(CENTER);
  
  var canvas = createCanvas(640, 480);
  canvas.parent('p5-sketch');

  Data.capture = createCapture(VIDEO);
  Data.capture.hide();

  Data.mic = new p5.AudioIn();
  Data.mic.start();
}

function draw() {
  background(50);
  Data.capture.loadPixels();

  var vol = Data.mic.getLevel();
  var stepSize = Math.round(map(vol, 0.0, 0.5, 10, 50));

  for (var y = 0; y < Data.capture.height; y += stepSize) {
    for (var x = 0; x < Data.capture.width; x += stepSize) {
      var i = y * Data.capture.width + x;
      var darkness = ( Data.capture.pixels[4 * i]) / 255;
      
      var size = stepSize * (darkness);
      fill(255 * darkness);

      if (darkness > 0.5) {
        var c = color(Data.capture.pixels[4 * i], Data.capture.pixels[4 * i+1], Data.capture.pixels[4 * i+2]);
        fill(c);
      }

      ellipse(x, y, size, size);
    }
  }
}