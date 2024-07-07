import * as THREE from 'three';

// Selective bloom from https://threejs.org/examples/webgl_postprocessing_unreal_bloom_selective

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { BLOOM_SCENE } from './constants.js';
import { setupScene } from './setupScene.js';

export const createScene = (canvas) => {
  let animationFrameId = null;

  const bloomLayer = new THREE.Layers();
  bloomLayer.set(BLOOM_SCENE);

  const params = {
    threshold: 0,
    strength: 1,
    radius: 0.5,
    exposure: 1,
  };

  const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
  const materials = {};

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ReinhardToneMapping;

  let scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    40, // Focal length
    window.innerWidth / window.innerHeight, // Aspect ratio
    1, // Near plane
    1e9, // Far plane
  );
  camera.position.set(-5, 0, 2);
  camera.lookAt(0, 0, 0);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 2;
  controls.enableDamping = true;
  controls.rotateSpeed = 0.5;
  controls.enablePan = false;

  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85,
  );
  bloomPass.threshold = params.threshold;
  bloomPass.strength = params.strength;
  bloomPass.radius = params.radius;

  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);

  const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
      fragmentShader: `  
        uniform sampler2D baseTexture;
        uniform sampler2D bloomTexture;
        varying vec2 vUv;
        void main() {
          gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
        }`,
      defines: {},
    }),
    'baseTexture',
  );
  mixPass.needsSwap = true;

  const outputPass = new OutputPass();

  const finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderScene);
  finalComposer.addPass(mixPass);
  finalComposer.addPass(outputPass);

  window.onresize = function () {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    bloomComposer.setSize(width, height);
    finalComposer.setSize(width, height);
  };

  const disposeMaterial = (obj) => {
    if (obj.material) {
      obj.material.dispose();
    }
  };

  const render = () => {
    if (!scene) return;

    scene.traverse(darkenNonBloomed);
    bloomComposer.render();
    scene.traverse(restoreMaterial);

    // render the entire scene, then render bloom scene on top
    finalComposer.render();

    // Updates, animations, etc.
    controls.update();
    planetMesh.rotation.y += 0.002;

    animationFrameId = requestAnimationFrame(render);
  };

  function darkenNonBloomed(obj) {
    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
      materials[obj.uuid] = obj.material;
      obj.material = darkMaterial;
    }
  }

  function restoreMaterial(obj) {
    if (materials[obj.uuid]) {
      obj.material = materials[obj.uuid];
      delete materials[obj.uuid];
    }
  }

  scene.traverse(disposeMaterial);
  scene.children.length = 0;
  const { planetMesh } = setupScene(scene);
  render();

  return () => {
    scene = null;
    cancelAnimationFrame(animationFrameId);
  };
};
