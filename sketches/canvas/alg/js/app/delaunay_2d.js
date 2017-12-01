'use strict';


function computeSuperTriangle(pointset) {
/// Find a SuperTriangle (non minimal) in a set of points.
/// A method to find the minimal is described here: 
/// http://link.springer.com/article/10.1007/s40314-014-0198-8

  if (pointset.length < 3) {
    return null;
  }

  var C = new TPoint(0, 0);
  pointset.forEach((p) => {
    C.add(p);
  });
  C.mult(1.0 / pointset.length);

  var distancesSquared = pointset.map((p) => {
    var v = C.relativeTo(p);
    return v.dot(v);
  });

  var maxDistSqr = distancesSquared.reduce((a, b) => {
    return (a > b) ? a : b;
  });
  var farestId = distancesSquared.findIndex((v) => {
    return v == maxDistSqr;
  });

  // Circumcircle radius is defined by the barycenter and its farest point.
  var radius = Math.sqrt(maxDistSqr);
  // Pythagore's formula gives h = radius / cos(60).
  var h = 2.0 * radius;
  var v = C.relativeTo(pointset[farestId]).getNormal();

  // The three super triangle points are at distance h from C
  // in direction v with rotation 60, 180 and 300 (-60).
  var rotate = (cosine, sine) => {
    return new TPoint(
      C.x + h * (cosine * v.x - sine * v.y), 
      C.y + h * (sine * v.x + cosine * v.y)
    );
  };  
  var A = rotate(0.5, 0.866);
  var B = rotate(-1.0, 0.0);
  var C = rotate(0.5, -0.866);

  return [A, B, C];
}

/* -------------------------------------------------------------------------- */

var Data = {
  init: function() {
    this.TOTAL_POINT_COUNT = 128;
    this.points = [];
  },


  // clear the point dataset
  clearPoints: function() {
    this.points = [];
  },

  // return a random point from the dataset
  getRandomPoint: function() {
    var index = parseInt(Math.random() * this.points.length);
    return this.points[index];
  },
};

/* -------------------------------------------------------------------------- */

var App = {
  // Initialize the applicaton.
  init: function() {
    CanvasView.init();
    Data.init();

    App.reset();
  },

  // Reset data pointset and rendering.
  reset: function() {
    // Generate new datapoints.
    Data.clearPoints();

    var bound = 0.25;
    var range = 1.0 - 2.0 * bound;
    for (var i = 0; i < Data.TOTAL_POINT_COUNT; ++i) {
      var x, y;

      x = (bound + range * Math.random()) * CanvasView.canvas.width;
      y = (bound + range * Math.random()) * CanvasView.canvas.height;
      Data.points.push(new TPoint(x, y));
    }

    // reset color to default.
    CanvasView.setPointColor(CanvasView.pointColor);

    // Update rendering.
    App.render();
  },

  // Render the canvas with points.
  render: function() {
    CanvasView.clear();
    CanvasView.drawPoints(Data.points);
  },

  // Run the algorithm.
  run: function() {
    // Compute the bounding triangle
    var tri = computeSuperTriangle(Data.points);
   
    // [debug] draw the bounding triangle.
    CanvasView.drawLine(tri[0], tri[1]);
    CanvasView.drawLine(tri[1], tri[2]);
    CanvasView.drawLine(tri[2], tri[0]);
  },

};

/* -------------------------------------------------------------------------- */