var canvas_width = window.innerWidth;
var canvas_height = 0.9*window.innerHeight;
var min_color;
var max_color;
var bg_color;

var canvas;
var particles = [];
var triangles = [];
var radius = canvas_height / 6;
var numParticles = 90;

var colors = [
  new p5.Vector(1.0, 0.0, 0.0),
  new p5.Vector(1.0, 0.7, 0.5),
  new p5.Vector(0.3, 0.0, 0.8),
  new p5.Vector(0.3, 1.0, 1.0),
];

// ----------------------------------------------------------------------------

function Particle(pos, vel) {
  this.pos = pos.copy();
  this.vel = p5.Vector.random2D().mult(random(0.25, 1.6));
  this.color = colors[Math.floor(random(colors.length))];
  createVector(
    lerp(min_color.x, max_color.x, random()),
    lerp(min_color.y, max_color.y, random()),
    lerp(min_color.z, max_color.z, random())
  );
  
  this.size = random(1, 5);

  this.update = function() {
    this.pos.add(this.vel);

    if (this.pos.x < 0) {
      this.pos.x = 0;
      this.vel.x *= -1;
    }
    if (this.pos.x >= canvas.width) {
      this.pos.x = canvas.width-1;
      this.vel.x *= -1;
    }
    if (this.pos.y < 0) {
      this.pos.y = 0;
      this.vel.y *= -1;
    }
    if (this.pos.y >= canvas.height) {
      this.pos.y = canvas.height-1;
      this.vel.y *= -1;
    }
  };

  this.render = function() {
    fill(255 * this.color.x, 255 * this.color.y, 255 * this.color.z, 40);
    noStroke();
    ellipseMode(CENTER);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  };
}

// ----------------------------------------------------------------------------

function Triangle(a, b, c) {
  this.red = 0.33 * (a.color.x + b.color.x + c.color.x);
  this.green = 0.33 * (a.color.y + b.color.y + c.color.y);
  this.blue = 0.33 * (a.color.z + b.color.z + c.color.z);

  this.v1 = a.pos;
  this.v2 = b.pos;
  this.v3 = c.pos;

  this.render = function() {
    var side = Math.abs(this.v1.x-canvas.width/2) - canvas.width/4;

    if (side < 0) {
      fill(255 * this.red, 255 * this.green, 255 * this.blue, 18);
      noStroke();
      triangle(
        this.v1.x, this.v1.y,
        this.v2.x, this.v2.y,
        this.v3.x, this.v3.y
      );
    } else {
      stroke(255 * this.red, 255 * this.green, 255 * this.blue, 8);
      line(this.v1.x, this.v1.y, this.v2.x, this.v2.y);
      line(this.v3.x, this.v3.y, this.v2.x, this.v2.y);
    }
  };
}

// ----------------------------------------------------------------------------

function update_triangles() {
  var neighbors = [];

  // Search radius-distant particles. O(n²) complexity.
  var squared_radius = radius * radius;
  for (var i=0; i < particles.length-1; ++i) {
    var neighbor_list = [];
    var particle_pos = particles[i].pos;

    for (var j= i + 1; j < particles.length; ++j) {
      var pos = particles[j].pos;
      var squared_distance = p5.Vector.sub(pos, particle_pos).magSq();
      if (squared_distance < squared_radius) {
        neighbor_list.push(j);
      }
    }
    neighbors.push(neighbor_list);
  }

  // Create triangles from neighbours. O(n²) complexity.
  triangles = [];
  for (var i in neighbors) {
    var neighbor_list = neighbors[i];

    // take every 'simple' pairs of neighbours.
    var max_z = Math.min(neighbor_list.length-1, 3);
    for (var z=0; z < max_z; ++z)
    for (var j=z; j < neighbor_list.length; ++j) {
      triangles.push(new Triangle(
        particles[i],
        particles[neighbor_list[z]], 
        particles[neighbor_list[j]])
      );
    }
  }
}

// ----------------------------------------------------------------------------

function resize_cb() {
  for (var i in particles) {
    var p = particles[i];

    var dx = p.pos.x / canvas.width;
    var dy = p.pos.y / canvas.height;

    p.pos.x = window.innerWidth * dx;
    p.pos.y = window.innerHeight * dy;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// ----------------------------------------------------------------------------


function setup() {
  canvas = createCanvas(canvas_width, canvas_height);
  canvas.parent('p5-sketch');

  bg_color = $('body').css('background-color');

  min_color = createVector(0.2, 0.0, 0.0);
  max_color = createVector(2.0, 1.0, 1.0);

  // Initialize particles.
  for (var i = 0; i < numParticles; ++i) {
    var pos = createVector(random(width), random(height));
    particles.push(new Particle(pos));
  }

  blendMode(BLEND);

  $(window).resize(resize_cb);
  draw();
}

function draw() {
  if (frameCount > 0 && window.mobilecheck()) {
    return;
  }

  background(bg_color);

  // Update particles.
  particles.forEach((p) => { p.update(); });

  // compute triangles
  update_triangles();

  // Render Triangles
  triangles.forEach((t) => { t.render(); });

  // Render particles.
  //particles.forEach((p) => { p.render(); });  
}


