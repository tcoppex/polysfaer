
// Return an array of ordered vertices that specify
// the convex hull of 'vertices'.
// Note : the first and last vertices are the sames.
function QuickHull(vertices) {
  // Find corners vertices.
  var min_x = vertices.reduce((a, b) => { return (a.x < b.x) ? a : b; });
  var max_x = vertices.reduce((a, b) => { return (a.x > b.x) ? a : b; });
  var sd_x = min_x.squaredDistanceTo(max_x);
  var min_y = vertices.reduce((a, b) => { return (a.y < b.y) ? a : b; });
  var max_y = vertices.reduce((a, b) => { return (a.y > b.y) ? a : b; });
  var sd_y = min_y.squaredDistanceTo(max_y);
  // Initial edge extremities.
  var init_edge = (sd_x > sd_y) ? [min_x, max_x] : [min_y, max_y];

  // Vertices of the hull, initialized with the first left vertex.
  var hverts = [init_edge[0]];

  // Find the farest point from the segment and add it to the hull.
  var findHullVertex = function(vset, A, B) {
    var AB = B.relativeTo(A);
    // Compute AB orthogonal vector (ie. the normal).
    var N = AB.getNormal();

    // Filter-out outside vertices.
    var dp_set = vset.map((v) => { return v.relativeTo(A).dot(N); });
    vset = vset.filter((v, id) => { return dp_set[id] > Number.EPSILON; });

    // Exit condition: add the right vertex and quit.
    if ((vset.length === 0) || ((vset.length == 1) && (vset[0] == B))) {
      hverts.push(B);
      return;
    }

    // Search for the farest vertex index.
    var max_dp_index = 0;
    dp_set = dp_set.filter((v) => { return v > Number.EPSILON; });
    dp_set.reduce((a, b, index) => {
      max_dp_index = (b > a) ? index : max_dp_index;
      return (b > a) ? b : a;
    });
    var P = vset[max_dp_index];

    // Continue with the new segments.
    findHullVertex(vset, A, P);
    findHullVertex(vset, P, B);
  };

  findHullVertex(vertices, init_edge[0], init_edge[1]);
  findHullVertex(vertices, init_edge[1], init_edge[0]);  

  return hverts;
}

/* -------------------------------------------------------------------------- */

var Data = {
  init: function() {
    this.TOTAL_POINT_COUNT = 32;
    this.points = [];
    this.directions = [];
  },


  // clear the point dataset
  clearPoints: function() {
    this.points = [];
    this.directions = [];
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

    var bound = 0.15;
    var range = 1.0 - 2.0 * bound;
    for (var i=0; i<Data.TOTAL_POINT_COUNT; ++i) {
      var x, y;
      
      x = (bound + range*Math.random()) * CanvasView.canvas.width;
      y = (bound + range*Math.random()) * CanvasView.canvas.height;
      Data.points.push(new TPoint(x, y));

      var scale = 0.01;
      x = scale * (Math.random()-0.5) * CanvasView.canvas.width;
      y = scale * (Math.random()-0.5) * CanvasView.canvas.height;
      Data.directions.push(new TPoint(x, y).getNormal());
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
    var hull_vertices = QuickHull(Data.points);

    hull_vertices.reduce((a, b) => {
      CanvasView.drawLine(a, b);
      return b;
    });
    CanvasView.setPointColor("#00ff00");
    CanvasView.drawPoints(hull_vertices);
  },

  animate: function() {
    // Update points locations
    var scale = 0.01;
    for (var i=0; i<Data.TOTAL_POINT_COUNT; ++i) {
      //var x = scale*(Math.random()-0.5) * CanvasView.canvas.width;
      //var y = scale*(Math.random()-0.5) * CanvasView.canvas.height;

      var pt = Data.points[i];

      pt.x += Data.directions[i].x;
      pt.y += Data.directions[i].y;
      
      if (pt.x < 0 || pt.x >= CanvasView.canvas.width) Data.directions[i].x *= -1;
      if (pt.y < 0 || pt.y >= CanvasView.canvas.height) Data.directions[i].y *= -1;

      Data.points[i] = pt;
    }

    // Render points
    App.render();

    // Render Hull
    App.run();

    // loop
    window.requestAnimationFrame(App.animate);
  }
};

/* -------------------------------------------------------------------------- */
