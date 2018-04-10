/* ref @so11381673 */
window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

// ----------------------------------------------------------------------------

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

// --------------------
// p5.js Callbacks
// --------------------

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
