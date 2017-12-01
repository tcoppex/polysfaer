var canvas_width = 1080;
var canvas_height = 720;
var min_color;
var max_color;

var colors = [
  new p5.Vector(1.0, 0.0, 0.0),
  new p5.Vector(1.0, 0.7, 0.5),
  new p5.Vector(0.3, 0.0, 0.8),
  new p5.Vector(0.3, 1.0, 1.0),
];

function Particle(pos, vel) {
  this.pos = pos.copy();
  this.vel = p5.Vector.random2D().mult(random(0.25, 1.6));
  this.color = colors[Math.floor(random(colors.length))];
  /*createVector(
    lerp(min_color.x, max_color.x, random()),
    lerp(min_color.y, max_color.y, random()),
    lerp(min_color.z, max_color.z, random())
  );
  */
  this.size = random(1, 5);

  this.update = function() {
    this.pos.add(this.vel);

    if (this.pos.x < 0) {
      this.pos.x = 0;
      this.vel.x *= -1;
    }
    if (this.pos.x > canvas_width) {
      this.pos.x = canvas_width;
      this.vel.x *= -1;
    }
    if (this.pos.y < 0) {
      this.pos.y = 0;
      this.vel.y *= -1;
    }
    if (this.pos.y > canvas_height) {
      this.pos.y = canvas_height;
      this.vel.y *= -1;
    }
  };

  this.render = function() {
    fill(255 * this.color.x, 255 * this.color.y, 255 * this.color.z);
    noStroke();
    ellipseMode(CENTER);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  };
}

function Triangle(a, b, c) {
  this.red = 0.33 * (a.color.x + b.color.x + c.color.x);
  this.green = 0.33 * (a.color.y + b.color.y + c.color.y);
  this.blue = 0.33 * (a.color.z + b.color.z + c.color.z);

  this.v1 = a.pos;
  this.v2 = b.pos;
  this.v3 = c.pos;

  this.render = function() {
    fill(255 * this.red, 255 * this.green, 255 * this.blue, 100);
    noStroke();
    triangle(
      this.v1.x, this.v1.y,
      this.v2.x, this.v2.y,
      this.v3.x, this.v3.y
    );
  };
}



// ----------------------------------------------------------------------------

var parts = [];
var triangles = [];
var radius = canvas_width / 5;


function findNeighbors(base_id, radius)  {
  // first vertex form triangle with all following pairs of point.
  var nbr = [base_id];

  var rSq = radius * radius;
  var base_pos = parts[base_id].pos;

  for (var i = base_id + 1; i < parts.length; ++i) {
    var pos = parts[i].pos;

    var magSq = p5.Vector.sub(pos, base_pos).magSq();

    if (magSq < rSq) {
      nbr.push(i);
    }
  }

  if (nbr.length < 3) {
    return null;
    //triangles = triangles.concat(nbr);
  }

  return nbr;
}

function getTrianglesFromNeighbors(nbr) {
  var tris = [];
  var i0 = nbr[0];

  for (var i = 1; i < nbr.length - 1; ++i) {
    var i1 = nbr[i];
    for (var j = i + 1; j < nbr.length; ++j) {
      var i2 = nbr[j];
      tris.push(new Triangle(parts[i0], parts[i1], parts[i2]));
    }
  }

  return tris;
}

function updateTriangles() {
  triangles.length = [];
  parts.forEach((p, i) => {
    var nbr = findNeighbors(i, radius);
    if (nbr) {
      var tris = getTrianglesFromNeighbors(nbr);
      triangles = triangles.concat(tris);
    }
  });
}

// ----------------------------------------------------------------------------

function setup() {
  var canvas = createCanvas(canvas_width, canvas_height);
  canvas.parent('p5-sketch');

  min_color = createVector(0.2, 0.0, 0.0);
  max_color = createVector(2.0, 1.0, 1.0);

  // Initialize particles.
  var numParticles = 36;
  for (var i = 0; i < numParticles; ++i) {
    var pos = createVector(random(width), random(height));
    parts.push(new Particle(pos));
  }

  blendMode(BLEND);
}

function draw() {
  background(128);

  updateTriangles();
  triangles.forEach((t) => {
    t.render();
  });

  // Update particles.
  parts.forEach((p) => {
    p.update();
  });

  // Render particles.
  parts.forEach((p) => {
    p.render();
  });

  /*
    var val = round(abs(2*((mouseX / width) - 0.5) * min(width, height)/2));
    var radius = val;//round(map(mouseX, 0, width, 20, min(width, height)/2));
    var rSqr = radius * radius;
    var x = width / 2;
    var y = height / 2;
    var bg = 128;

    loadPixels();

    for (var j = 0; j < height; ++j) {
      for (var i = 0; i < width; ++i) {
        if (   (i >= x - radius && i < x + radius) 
            && (j >= y - radius && j < y + radius))
          continue;
        var index = (j) * width + (i);
        pixels[4 * index + 0] = bg;
        pixels[4 * index + 1] = bg;
        pixels[4 * index + 2] = bg;
        pixels[4 * index + 3] = 255;
      }
    }

    for (var j = -radius; j < radius; ++j) {
      for (var i = -radius; i < radius; ++i) {
        if (j * j + i * i <= rSqr) continue;
        var index = (y + j) * width + (x + i);
        pixels[4 * index + 0] = bg;
        pixels[4 * index + 1] = bg;
        pixels[4 * index + 2] = bg;
        pixels[4 * index + 3] = 255;
      }
    }

    updatePixels();
  */
}