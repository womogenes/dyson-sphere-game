import * as THREE from 'three';
import { BLOOM_SCENE } from './constants.js';
import { getStarfield } from './starField.js';

let planetMesh;

class Planet {
  constructor({ radius }) {
    this.radius = radius;
  }

  update(dt) {}
}

export const setupScene = ({ scene }) => {
  // CONSTANTS
  const planetRad = 1e4;

  // Planet
  const planetGeometry = new THREE.IcosahedronGeometry(planetRad, 16);
  const loader = new THREE.TextureLoader();
  const planetMaterial = new THREE.MeshPhongMaterial({
    map: loader.load('textures/mercury_16k.jpg'),
  });
  planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
  scene.add(planetMesh);

  // Star
  const starRadius = 7e4;
  const starPosition = 1e6;
  const starGeometry = new THREE.IcosahedronGeometry(starRadius, 20);
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

  // Update function
  const updateScene = () => {
    planetMesh.rotation.y += 0.002;
  };

  return { planetMesh, planetRad, updateScene };
};
