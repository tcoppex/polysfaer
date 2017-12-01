//-----------------------------------------------------------------------------
// MAIN

try {
  init();
  animate();
} catch (e) {
  var error_msg = "Your program encountered an unrecoverable error. Error :<br/><br/>" + e;
  alert(error_msg);
}

//-----------------------------------------------------------------------------
// VARIABLES

var camera, scene, renderer;
var cameraControls;
var stats;


//-----------------------------------------------------------------------------
// CALLBACKS

function onWindowResize() {
  var width = window.innerWidth;
  var height = window.innerHeight;

  renderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}


//-----------------------------------------------------------------------------
// FUNCTIONS

function init() {
  var container = document.getElementById('content');
  document.body.appendChild(container);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x252525, 1.0);

  renderer.gammaInput = true;
  renderer.gammaOutput = true;

  // Add to DOM
  container.appendChild(renderer.domElement);

  // Stats
  stats = new Stats();
  //container.appendChild(stats.dom);

  // Camera
  camera = new THREE.PerspectiveCamera(60.0, window.innerWidth / window.innerHeight, 0.1, 500.0);
  camera.position.z = 55.0;
  camera.position.y = 30.0;

  // Controls
  cameraControls = new THREE.OrbitControls(camera);

  // Setup scene objects
  setup_scene();

  // Callbacks
  window.addEventListener('resize', onWindowResize, false);
}

var light;

function setup_scene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(renderer.getClearColor(), 0.2 * camera.far, camera.far);

  // Assets loaders
  var objLoader = new THREE.OBJLoader();
  var mtlLoader = new THREE.MTLLoader();
  var texLoader = new THREE.TextureLoader();

  // Custom OBJ loader
  var load_obj = function(location, name, cb) {
    mtlLoader.setPath(location);
    mtlLoader.load(name + '.mtl', function(materials) {
      // Retrieve the diffuse texture location.
      var diffuseLoc = location + materials.materialsInfo.material_0.map_kd;
      // Manually load the diffuse texture map.
      var map = texLoader.load(diffuseLoc);

      objLoader.setPath(location);
      objLoader.load(name + '.obj', function(group) {
        var mesh = group.children[0];
        mesh.material = new THREE.MeshBasicMaterial({
          map: map
        });
        cb(mesh);
        scene.add(mesh);
      });
    });
  };

  // Load meshes
  load_obj('assets/obj/budha/', 'budha', function(mesh)  {
    mesh.scale.multiplyScalar(10.0);
    mesh.position.x = 20.0;
    mesh.rotation.y = THREE.Math.degToRad(-45.0);
  });

  load_obj('assets/obj/cheminee/', 'cheminee', function(mesh)  {
    mesh.scale.multiplyScalar(10.0);
    mesh.position.x = -20;
    mesh.rotation.y = Math.PI - THREE.Math.degToRad(-45.0);
  });

}


function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  cameraControls.update();
  stats.update();

  renderer.clear();
  renderer.render(scene, camera);
}

//-----------------------------------------------------------------------------