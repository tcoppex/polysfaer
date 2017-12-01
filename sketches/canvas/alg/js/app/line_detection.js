'use strict';

var Data = {
  init: function() {
    this.TOTAL_POINT_COUNT = 256;
    this.points = [];

    // percent of inliner to generate
    this.inliersPercent = 0.33;
    
    // threshold to accept point as potential inlier
    this.distThreshold = 1.0;

    // ratio of potential inlier in a sequence to accept a solution
    this.inlierRatio = 0.25;// * this.inliersPercent;
    //this.inlierRatio = Math.min(this.inliersPercent, this.inlierRatio);

    // number of iteration before stopping RANSAC
    // set as n*log(n) with n as the pointset length
    this.maxIterations = this.TOTAL_POINT_COUNT*Math.log(this.TOTAL_POINT_COUNT);
  },

  // return true if the inliercount is in the accepted ratio range
  checkInlierCount: function(inlierCount) {
    var inliersRatioCount = Math.round(Data.inlierRatio * Data.TOTAL_POINT_COUNT);
    return inliersRatioCount <= inlierCount;
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
  // Initialize the applicaton
  init: function() {
    CanvasView.init(2);
    Data.init();
    App.reset();
  },

  // Reset data pointset and rendering
  reset: function() {
    var DEFAULT_Y_SLOPE = 2.0 * (Math.random() - 0.5);
    var DEFAULT_Y_OFFSET = 0.5 * CanvasView.canvas.height;

    // Generate new datapoints
    Data.clearPoints();

    for (var i=0; i<Data.TOTAL_POINT_COUNT; ++i) {
      var x = Math.random() * CanvasView.canvas.width;
      var y = x * DEFAULT_Y_SLOPE + DEFAULT_Y_OFFSET;
      
      // create outliers
      if (/*x < 20 &&*/ Math.random() > Data.inliersPercent) {
        y = Math.random() * CanvasView.canvas.height;
      }

      Data.points.push(new TPoint(x, y));
    }

    // Update rendering
    App.render();
  },

  // Render the canvas with points
  render: function() {
    CanvasView.clear();
    CanvasView.drawPoints(Data.points);
  },

  //
  renderLine: function(param1, param2) {
    var f = (x) => new TPoint(x, x*param1 + param2);

    var A = f(0);
    var B = f(CanvasView.canvas.width);

    App.render();
    CanvasView.setLineWidth(2.0);
    CanvasView.drawLine(A, B);
  },

  // Run the RANSAC algorithm on a pointset and render the resulting line
  runRANSAC: function() {
    var bestInlierCount = 0;
    var bestParam1 = 0;
    var bestParam2 = 0;

    for (var i=0; i < Data.maxIterations; ++i) {
      // Randomly select 2 points
      var A = Data.getRandomPoint();
      var B = Data.getRandomPoint();

      // Keep only unique points
      while (B.equals(A)) {
        B = Data.getRandomPoint();
      }

      // Compute the distances between all points with the fitting line
      var V = B.relativeTo(A);
      var invlenV = 1.0 / Math.sqrt(V.dot(V)); // safe bc A != B
      var normal = new TPoint(- V.y * invlenV, V.x * invlenV);

      var distances = Data.points.map(function (p) {
        return normal.dot(p.relativeTo(A));
      });

      // Compute the inliers with distance to the line smaller than the threshold
      var inliersIndex = distances.filter(function(d) {
        return Math.abs(d) <= Data.distThreshold;
      });
      var inliersCount = inliersIndex.length;
      
      // Update the best parameter if one is found
      if (   bestInlierCount < inliersCount
          && Data.checkInlierCount(inliersCount)
          && B.x != A.x
         )
      {
        bestInlierCount = inliersCount;
        
        var param1 = (B.y - A.y) / (B.x - A.x);
        var param2 = A.y - param1 * A.x;

        bestParam1 = param1;
        bestParam2 = param2;
      }
    }

    if (bestInlierCount > 0) {
      App.renderLine(bestParam1, bestParam2);
    } else {
      console.log('No good fit found, please retry.');
    }
  },

  runLeastSquare: function() {
    var points = Data.points.map((p) => p.asArray());
    var xxx = points.map((p) => p[0]);
    var yyy = points.map((p) => p[1]);

    var X = math.matrix( [new Array(xxx.length).fill(1), xxx] );
    var Xt = math.transpose(X);
    var Yt = math.transpose(math.matrix(yyy));

    var params = math.multiply(
      math.inv(math.multiply(X, Xt)),
      math.multiply(X, Yt)
    );

    App.renderLine(params._data[1], params._data[0]);
  },


};

/* -------------------------------------------------------------------------- */

window.onload = function() {
  App.init();
  document.getElementById('run-ransac').onclick = App.runRANSAC;
  document.getElementById('run-leastsqr').onclick = App.runLeastSquare;
  document.getElementById('reset-app').onclick = App.reset;
};

/* -------------------------------------------------------------------------- */
