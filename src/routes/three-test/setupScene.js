import * as THREE from 'three';
import { BLOOM_SCENE } from './constants.js';
import { getStarfield } from './starField.js';

let planetMesh;

export const setupScene = (scene) => {
  // Planet
  const planetGeometry = new THREE.IcosahedronGeometry(1, 16);
  const loader = new THREE.TextureLoader();
  const planetMaterial = new THREE.MeshPhongMaterial({
    map: loader.load('textures/mercury_16k.jpg'),
  });
  planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
  scene.add(planetMesh);

  // Star
  const starRadius = 100;
  const starPosition = 5000;
  const starGeometry = new THREE.SphereGeometry(starRadius, 64, 64);
  const starMaterial = new THREE.MeshStandardMaterial({
    emissive: 0xfffff0,
    emissiveIntensity: 0.5,
  });
  const starMesh = new THREE.Mesh(starGeometry, starMaterial);
  starMesh.position.set(starPosition, 0, 0);
  starMesh.rotation.x += 1;
  starMesh.layers.enable(BLOOM_SCENE);
  scene.add(starMesh);

  // Star field
  const starField = getStarfield({ numStars: 500 });
  starField.layers.enable(BLOOM_SCENE);
  scene.add(starField);

  // Light
  const light2 = new THREE.AmbientLight(0xffffff, 0.05);
  light2.position.set(-1, 0, 0);
  const light3 = new THREE.PointLight(0xffffff, 2, 0, 0);
  light3.position.set(starPosition, 0, 0);

  scene.add(light2, light3);

  return { planetMesh };
};