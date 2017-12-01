// Multiply an 4x4 homogeneous matrix by a Vector4 considered as point
// (subject to translation)
function multMatrixVector(m, v) {
  if (!(m instanceof p5.Matrix) || !(v instanceof p5.Vector)) {
    print('multMatrixVector : Invalid arguments');
    return;
  }

  var _dest = createVector();
  var mat = m.mat4;

  // Multiply in column major order.
  _dest.x = mat[0] * v.x + mat[4] * v.y + mat[8] * v.z + mat[12];
  _dest.y = mat[1] * v.x + mat[5] * v.y + mat[9] * v.z + mat[13];
  _dest.z = mat[2] * v.x + mat[6] * v.y + mat[10] * v.z + mat[14]; 
  var w =   mat[3] * v.x + mat[7] * v.y + mat[11] * v.z + mat[15];

  if (Math.abs(w) > Number.EPSILON) {
    _dest.mult(1.0 / w);
  }

  return _dest;
}

/* Project a vector from Canvas to World coordinates. */
function projectCanvasToWorld(canvas, vCanvas) {
  // Retrieve the ModelView and Projection matrices.
  var mv = canvas.uMVMatrix.copy();
  var p  = canvas.uPMatrix.copy();

  // Compute the ModelViewProjection matrix.
  var mvp = mv.mult(p);

  // Inverts the MVP.
  var invMVP = mvp.invert(mvp);
 
  // Transform the canvas vector to NDC coordinates (in [-1, 1]³).
  var vNDC = createVector();
  vNDC.x = (-1.0 + 2.0 * (vCanvas.x / canvas.GL.drawingBufferWidth));
  vNDC.y = (-1.0 + 2.0 * (vCanvas.y / canvas.GL.drawingBufferHeight));
  vNDC.z = (-1.0 + 2.0 * (vCanvas.z));

  // Transform vector from NDC to world coordinates.
  var vWorld = multMatrixVector(invMVP, vNDC);

  return vWorld;
}

/* Project a vector from World to Canvas coordinates. */
function projectWorldToCanvas(canvas, vWorld) {
  // Calculate the ModelViewProjection Matrix.
  var mvp = (canvas.uMVMatrix.copy()).mult(canvas.uPMatrix);

  // Transform the vector to Normalized Device Coordinate.
  var vNDC = multMatrixVector(mvp, vWorld);

  // Transform vector from NDC to Canvas coordinates.
  var vCanvas = createVector();
  vCanvas.x = 0.5 * (vNDC.x + 1.0) * canvas.GL.drawingBufferWidth;
  vCanvas.y = 0.5 * (vNDC.y + 1.0) * canvas.GL.drawingBufferHeight;
  vCanvas.z = 0.5 * (vNDC.z + 1.0);

  return vCanvas;
}


// ----------------------------------------------------------------------------

var canvas = null;

var do_rotate = false;
var angle = 0.0;


function intersectMousePlane(a, b, c, d) {
  // plane equation.
  var plane = createVector(a, b, c);

  // Project the mouse position from 2d screen to the Near and Far 3d planes.
  var near = projectCanvasToWorld(canvas, createVector(mouseX, mouseY, 0.0));
  var far = projectCanvasToWorld(canvas, createVector(mouseX, mouseY, 1.0));

  // Distance of the near point to its projection on the plane.
  var k = - (p5.Vector.dot(plane, near) + d);
  k *= 1.0 / p5.Vector.dot(plane, far);

  // Compute the mouse direction vector (ie. Near to Far vector).
  var ray = p5.Vector.sub(far, near);

  //ray = multMatrixVector(canvas.uMVMatrix, ray, 0.0); // ...

  // Project the point on the plane
  var pt = p5.Vector.add(near, p5.Vector.mult(ray, k));

  return pt;
}

// ----------------------------------------------------------------------------

function setup() {
  // Only works when canvas mode is WEBGL.
  canvas = createCanvas(800, 600, WEBGL);
  canvas.parent('p5-sketch');


  //noCursor();
  //
}

var t = new p5.Vector();

function draw() {
  background(50);

  // Tilt the camera.
  if (do_rotate) angle += 0.01;
  
  push();
    // work natively with rotateY, 
    // with X or Z, we need to rotate(-angle) after 'intersectMousePlane'
    // don't know why..
    // it looks like the Model matrix is applied two times..
    rotateZ(angle);
    rotateX(angle);

    // ------------------
    // it works on any custom plane, so the problem might lie in display or in
    // the modelview matrix.
    t = intersectMousePlane(0.0, 0.0, 1.0, 0.0);
    // ------------------
    
    fill(70);
    plane(150);

/* BEGIN ----------- this section should be removed */
  pop();

  push();
    // XXX
    // we should not do this..
    rotateZ(-angle);
    rotateX(-angle);
/* END ----------- this section should be removed */

    translate(t.x, t.y, t.z);
    fill(150, 120, 40);
    sphere(20.0);
  pop();

}

function mousePressed() {
  do_rotate = !do_rotate;
}

