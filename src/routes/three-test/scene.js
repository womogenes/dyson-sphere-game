import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getStarfield } from './starField.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

export const createScene = (canvas) => {
  let animationFrameId = null;

  const w = window.innerWidth;
  const h = window.innerHeight;
  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1e9);
  camera.position.z = 5;
  let renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
  renderer.setSize(w, h);
  renderer.setPixelRatio(2);

  // Effect composer pipeline
  const renderScene = new RenderPass(scene, camera);
  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.addPass(renderScene);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(w, h),
    1.0, // Strength
    10, // Radius of bloom
    0, // Threshold
  );
  bloomComposer.addPass(bloomPass);
  bloomComposer.renderToScreen = false;

  // Selective bloom filter tutorial: https://youtu.be/VTKi70bCVwQ
  const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform sampler2D baseTexture;
        uniform sampler2D bloomTexture;
        varying vec2 vUv;
        void main() {
          gl_FragColor = (texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv));
        }`,
    }),
    'baseTexture',
  );
  mixPass.needsSwap = true;

  const finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderScene);
  finalComposer.addPass(mixPass);

  const outputPass = new OutputPass();
  finalComposer.addPass(outputPass);

  // Controls
  let controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.rotateSpeed = 0.5;

  // Planet
  const geometry = new THREE.IcosahedronGeometry(1, 16);
  const loader = new THREE.TextureLoader();
  const material = new THREE.MeshPhysicalMaterial({
    map: loader.load('textures/mercury_16k.jpg'),
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Sun
  const sun = new THREE.SphereGeometry(1, 64, 64);

  // Star field
  const starField = getStarfield({ numStars: 500 });
  scene.add(starField);

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 2.0);
  light.position.set(1, 0, 0);
  const light2 = new THREE.AmbientLight(0xffffff, 0.02);
  light2.position.set(-1, 0, 0);
  scene.add(light, light2);

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    controls.update();
    mesh.rotation.y += 0.002;

    bloomComposer.render();
    finalComposer.render();
  };

  animate();

  const handleWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    bloomComposer.setSize(window.innerWidth, window.innerHeight);
    finalComposer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', handleWindowResize, false);

  // Destroy
  return () => {
    if (scene) scene.remove.apply(scene, scene.children);
    cancelAnimationFrame(animationFrameId);
    scene = null;
    camera = null;
    controls = null;
  };
};
