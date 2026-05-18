import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import './style.css';

// add axes helper
const axesHeper = new THREE.AxesHelper(5);

//add grid helper
const gridHelper = new THREE.GridHelper(100, 100);

//create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
// scene.fog = new THREE.Fog(
//     0x87ceeb,
//     20,
//     60
// );

scene.add(gridHelper);
scene.add(axesHeper);

//create a camera
const camera = new THREE.PerspectiveCamera(75,  window.innerWidth/window.innerHeight, 0.1, 4000);
camera.position.z = 2;
camera.position.y = 2;
camera.position.x = 2;
camera.lookAt(0,0,0);


//add light
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.position.set(5, 10, 7.5);
sun.castShadow = true;
scene.add(sun);

//create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// tree trunk
const treeTrunk = new THREE.Mesh(
    new THREE.BoxGeometry(1, 3, 1),
    new THREE.MeshStandardMaterial({
        color: 0x8b4513
    })
);
treeTrunk.position.set(5, 1.5, -5);
treeTrunk.castShadow = true;
scene.add(treeTrunk);

// tree leaves
const treeLeaves = new THREE.Mesh(
    new THREE.SphereGeometry(2, 16, 16),
    new THREE.MeshStandardMaterial({
        color: 0x228b22
    })
);
treeLeaves.position.set(5, 4, -5);
treeLeaves.castShadow = true;
scene.add(treeLeaves);

//rocks
for (let i = 0; i < 20; i++) {

    const rock = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({
            color: 0x777777
        })
    );

    rock.position.set(
        Math.random() * 50 - 25,
        0.5,
        Math.random() * 50 - 25
    );

    rock.castShadow = true;

    scene.add(rock);
}

// cubes
const geometry = new THREE.BoxGeometry(0.5, 1.8, 0.5);
const material = new THREE.MeshStandardMaterial({color: 0xffaaff });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.position.set(0,0,0);
cube.position.x = THREE.MathUtils.clamp(
    cube.position.x,
    -10,
    10
);

cube.position.z = THREE.MathUtils.clamp(
    cube.position.z,
    -10,
    10
);
scene.add(cube);

// ground
const groundGeometry = new THREE.PlaneGeometry(2048, 2048);
const groundMaterial = new THREE.MeshStandardMaterial({color: 0x3a7a3a});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

//clock 
const clock = new THREE.Clock();

// controls
const keys = {};
const control = new OrbitControls( camera, renderer.domElement);
control.enableDamping = true;

// state controls
  const velocity = new THREE.Vector3();
  const cameraOffset = new THREE.Vector3(0, 3, 6);
  const gravity = -9.8;
  const jumpStrength = 5;

  let verticalVelocity = 0;
  let isGrounded = true;
  let canJump = true;
  let isFPV = false;

// animate
function animate(){

  requestAnimationFrame(animate);
  
  const deltaTime = clock.getDelta();
  
  const direction = new THREE.Vector3();

  const acceleration = keys["ShiftLeft"] ? 45 : 20;

  const damping = 5;

  if(keys['KeyP']){  
    if(isFPV){
      isFPV = false;
    }
    else{
      isFPV = true;
    }
  }

  if(keys["Space"] && isGrounded && canJump){
    verticalVelocity = jumpStrength;
    isGrounded = false;
    canJump = false;
  }

  if(!keys["Space"]){
    canJump = true;
  }

  verticalVelocity += gravity * deltaTime; // gravity
  cube.position.y += verticalVelocity * deltaTime;

  if(cube.position.y <= 0.9){
    cube.position.y = 0.9;
    verticalVelocity = 0;
    isGrounded = true;
  }

  if (keys["KeyW"]) direction.z -= 1;
  if (keys["KeyS"]) direction.z += 1;
  if (keys["KeyA"]) direction.x -= 1;
  if (keys["KeyD"]) direction.x += 1;


  if(direction.length() > 0){
    
    direction.normalize();
    
    velocity.x += direction.x * acceleration * deltaTime;
    velocity.z += direction.z * acceleration * deltaTime;
    
    cube.rotation.y += (Math.atan2(direction.x, direction.z) - cube.rotation.y) * 10 * deltaTime;

  }
  
  //damping
  velocity.x -= velocity.x * damping * deltaTime;
  velocity.z -= velocity.z * damping * deltaTime;

  //update position
  cube.position.x += velocity.x * deltaTime;
  cube.position.z += velocity.z * deltaTime;

  //update camera
  //const targetCameraPosition = cube.position.clone().add(cameraOffset);
  //camera.position.lerp(targetCameraPosition, 5 * deltaTime);
  control.target.copy(cube.position);
  control.update();

  renderer.render(scene, camera);
}

animate();
// movement

// event listeners
window.addEventListener('keydown', (event) => {
  keys[event.code] = true;
});

window.addEventListener('keyup', (event) => {
  keys[event.code] = false;
});

// resize
window.addEventListener( 'resize', () =>{
  console.log('resizing');
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});