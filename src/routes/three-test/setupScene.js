import * as THREE from 'three';
import { BLOOM_SCENE } from './constants.js';
import { getStarfield } from './starField.js';

let planetMesh;

export const setupScene = ({ scene }) => {
  // CONSTANTS
  const planetRad = 2.4e3;

  // Planet
  const planetGeometry = new THREE.IcosahedronGeometry(planetRad, 16);
  const loader = new THREE.TextureLoader();
  const planetMaterial = new THREE.MeshPhongMaterial({
    map: loader.load('textures/8081_earthmap10k.jpg'),
  });
  planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
  scene.add(planetMesh);

  // Star
  const starRadius = 6.96e5;
  const starPosition = 6.2e6;
  const starGeometry = new THREE.SphereGeometry(starRadius, 64, 64);
  const starMaterial = new THREE.MeshStandardMaterial({
    emissive: 0xfffff8,
    emissiveIntensity: 0.5,
  });
  const starMesh = new THREE.Mesh(starGeometry, starMaterial);
  starMesh.position.set(starPosition, 0, 0);
  starMesh.rotation.x += 1;
  starMesh.layers.enable(BLOOM_SCENE);
  scene.add(starMesh);

  // Star field
  const starField = getStarfield({ numStars: 1000 });
  starField.layers.enable(BLOOM_SCENE);
  scene.add(starField);

  // Light
  const light2 = new THREE.AmbientLight(0xffffff, 0.5);
  const light3 = new THREE.PointLight(0xffffff, 2, 0, 0);
  light3.position.set(starPosition, 0, 0);

  scene.add(light2, light3);

  return { planetMesh, planetRad };
};
