import * as THREE from 'three';

// Selective bloom from https://threejs.org/examples/webgl_postprocessing_unreal_bloom_selective

import { OrbitControls } from '$lib/three/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { BLOOM_SCENE, PLANET_RAD } from './constants.js';
import { setupScene } from './setup-scene.js';

export const createScene = (canvas, stats) => {
  let animationFrameId = null;
  let isWindowFocused = document.hasFocus();
  const parentEl = canvas.parentElement;

  const bloomLayer = new THREE.Layers();
  bloomLayer.set(BLOOM_SCENE);

  const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
  const materials = {};

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(parentEl.clientWidth, parentEl.clientHeight);
  renderer.toneMapping = THREE.ReinhardToneMapping;

  const camera = new THREE.PerspectiveCamera(
    40, // Focal length
    parentEl.clientWidth / parentEl.clientHeight, // Aspect ratio
    1, // Near plane
    1e20, // Far plane
  );

  const clock = new THREE.Clock();
  let scene = new THREE.Scene();
  const { updateScene, spawnSatellite } = setupScene({ scene, camera, clock });

  // Controls
  const controls = new OrbitControls(camera, parentEl);
  controls.dynamicDampingFactor = 0.2;
  controls.minDistance = PLANET_RAD * 1.1;
  controls.enableDamping = true;
  controls.zoomDampingFactor = 0.1;
  controls.rotateSpeed = 1;
  controls.zoomSpeed = 0.5;
  controls.enablePan = false;
  controls.addEventListener('changezoom', () => {
    const zoom = controls.getDistance() / PLANET_RAD - 1;
    controls.rotateSpeed = Math.min(zoom * 0.13, 1);
    controls.zoomSpeed = Math.min(zoom * 200, 3);
  });

  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(parentEl.clientWidth, parentEl.clientHeight),
  );
  bloomPass.threshold = 0;
  bloomPass.strength = 0.5;
  bloomPass.radius = 1;

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
    const width = parentEl.clientWidth;
    const height = parentEl.clientHeight;

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

  window.onfocus = () => (isWindowFocused = true);
  window.onblur = () => (isWindowFocused = false);

  const render = () => {
    const dt = Math.min(clock.getDelta(), 0.016);
    animationFrameId = requestAnimationFrame(render);
    if (!scene) return;
    if (!isWindowFocused) return;

    stats.begin();

    scene.traverse(darkenNonBloomed);
    bloomComposer.render();
    scene.traverse(restoreMaterial);
    finalComposer.render();

    controls.update();

    // Update scene
    updateScene(dt);

    stats.end();
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
  render();

  return {
    deleteScene: () => {
      scene = null;
      cancelAnimationFrame(animationFrameId);
    },
    spawnSatellite,
  };
};
