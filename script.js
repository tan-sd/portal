import './style.css';
import * as dat from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import firefliesVertexShader from './shaders/fireflies/vertex.glsl';
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl';
import portalVertexShader from './shaders/portal/vertex.glsl';
import portalFragmentShader from './shaders/portal/fragment.glsl';
import Stats from 'three/examples/jsm/libs/stats.module';

/**
 * Stats
 */
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

/** 
 * Base 
 */ 
// Debug 
const debugObject = {};
const gui = new dat.GUI({ 
    width: 400 
})

// Canvas 
const canvas = document.querySelector('canvas.webgl');
 
// Scene 
const scene = new THREE.Scene();

/** 
 * Loaders 
 */ 
// Texture loader 
const textureLoader = new THREE.TextureLoader();
 
// Draco loader 
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');
 
// GLTF loader 
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Model
 */
gltfLoader.load(
  'model/portal.glb',
  (gltf) => {
    console.log('loaded');
    gltf.scene.traverse((child) => {
      // console.log(child)
      child.material = bakedMaterial

      const bakedMesh = gltf.scene.children.find(child => child.name ==='baked');
      const portalLightMesh = gltf.scene.children.find(child => child.name ==='portalLight');
      const poleLightAMesh = gltf.scene.children.find(child => child.name === 'poleLightA');
      const poleLightBMesh = gltf.scene.children.find(child => child.name === 'poleLightB');
  
      bakedMesh.material = bakedMaterial;
  
      poleLightAMesh.material = poleLightMaterial;
      poleLightBMesh.material = poleLightMaterial;
      portalLightMesh.material = portalLightMaterial;
    })
    scene.add(gltf.scene);
  }
)

/**
 * Firefiles
 */
// Geometry
const firefliesGeometry = new THREE.BufferGeometry();
const firefliesCount = 50;
const positionArray = new Float32Array(firefliesCount * 3);
const scaleArray = new Float32Array(firefliesCount);

for(let i = 0; i < firefliesCount; i++) {
  positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4;
  positionArray[i * 3 + 1] = Math.random() * 1.5;
  positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4;

  scaleArray[i] = Math.random();
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(positionArray, 1));

// Material
const firefliesMaterial = new THREE.ShaderMaterial({ 
  uniforms:
  {
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uSize: { value: 100 }
  },
  vertexShader: firefliesVertexShader, 
  fragmentShader: firefliesFragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
})

gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(300).step(1).name('firefliesSize');

// Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
scene.add(fireflies);

/**
 * Textures
 */
const bakedTexture = textureLoader.load('texture/baked.jpg');
bakedTexture.flipY = false;
bakedTexture.encoding = THREE.sRGBEncoding;

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });

// Portal light material
const portalLightMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColorStart: { value: new THREE.Color(0x000000) },
    uColorEnd: { value: new THREE.Color(0xffffff) },
  },
  vertexShader: portalVertexShader,
  fragmentShader: portalFragmentShader
})

debugObject.portalColorStart = '#000000';
debugObject.portalColorEnd = '#ffffff';

gui
  .addColor(debugObject, 'portalColorStart')
  .onChange(() => {
    portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
  })

gui
  .addColor(debugObject, 'portalColorEnd')
  .onChange(() => {
    portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
})

/** 
 * Sizes 
 */ 
const sizes = { 
  width: window.innerWidth, 
  height: window.innerHeight 
};

window.addEventListener('resize', () => 
{ 
  // Update sizes 
  sizes.width = window.innerWidth 
  sizes.height = window.innerHeight 

  // Update camera 
  camera.aspect = sizes.width / sizes.height 
  camera.updateProjectionMatrix() 

  // Update renderer 
  renderer.setSize(sizes.width, sizes.height) 
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

/** 
 * Camera 
 */ 
// Base camera 
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);
 
// Controls 
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2.5;
controls.minPolarAngle = -Math.PI / 4;
 
/** 
 * Renderer 
 */ 
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    antialias: true 
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

debugObject.clearColor = '#201919';
renderer.setClearColor(debugObject.clearColor);

gui
  .addColor(debugObject, 'clearColor')
  .name('backgroundColor')
  .onChange(() => {
    renderer.setClearColor(debugObject.clearColor)
  })

/** 
 * Animate 
 */ 
const clock = new THREE.Clock();
 
const tick = () => 
{ 
    const elapsedTime = clock.getElapsedTime();
 
    firefliesMaterial.uniforms.uTime.value = elapsedTime;
    portalLightMaterial.uniforms.uTime.value = elapsedTime;

    // Update controls 
    controls.update();
 
    // Render 
    renderer.render(scene, camera);
 
    // Call tick again on the next frame 
    window.requestAnimationFrame(tick);

    stats.update();
} 
 
tick();