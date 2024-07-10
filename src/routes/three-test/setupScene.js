import * as THREE from 'three';
import { BLOOM_SCENE } from './constants.js';
import { getStarfield } from './starField.js';
import { LodCircleGeometry } from '$lib/three/LoDCircleGeometry.js';
import { MeshLine, MeshLineMaterial } from '$lib/three/THREE.MeshLine.js';

// GLOBAL TIME for this scene
let t = 0;

class Planet {
  constructor({ radius, orbitalRadius }) {
    this.radius = radius;
    this.theta = 0;
    this.x = orbitalRadius;
    this.y = 0;
    this.z = 0;
    this.orbitalPeriod = 60; // seconds
    this.orbitalRadius = orbitalRadius;
    this.rotation = { x: 0, y: 0, z: 0 };
  }

  update(dt) {
    this.rotation.y = (t * Math.PI * 2) / 60;
    this.theta = -(t * 2 * Math.PI) / this.orbitalPeriod + Math.PI;
    this.x = Math.cos(this.theta) * this.orbitalRadius;
    this.z = Math.sin(this.theta) * this.orbitalRadius;
  }
}

export const setupScene = ({ scene, camera, clock }) => {
  // CONSTANTS
  const planetRad = 1e4;
  const planetOrbitRad = 1e8;

  // Planet
  const planet = new Planet({ planetRad, orbitalRadius: planetOrbitRad });
  const planetGeometry = new THREE.IcosahedronGeometry(planetRad, 16);
  const loader = new THREE.TextureLoader();
  const planetMaterial = new THREE.MeshPhongMaterial({
    map: loader.load('textures/mercury_16k.jpg'),
  });
  const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
  scene.add(planetMesh);

  // Planet orbit
  const orbitMeshLine = new MeshLine();
  const orbitGeometry = LodCircleGeometry(
    planetOrbitRad,
    Math.PI * 0.5,
    128,
    256,
  );
  orbitMeshLine.setGeometry(orbitGeometry);
  const orbitMaterial = new MeshLineMaterial({
    lineWidth: 10,
    color: 0xffffff,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    sizeAttenuation: 0,
  });
  const orbitMesh = new THREE.Mesh(orbitMeshLine, orbitMaterial);
  scene.add(orbitMesh);

  // Star
  const starRadius = 7e6;
  const starGeometry = new THREE.IcosahedronGeometry(starRadius, 12);
  const starMaterial = new THREE.MeshStandardMaterial({
    emissive: 0xfffaf8,
    emissiveIntensity: 0.5,
    transparent: false,
  });
  const starMesh = new THREE.Mesh(starGeometry, starMaterial);
  starMesh.layers.enable(BLOOM_SCENE);
  scene.add(starMesh);

  // Star field
  const starField = getStarfield({ numStars: 1000 });
  starField.layers.enable(BLOOM_SCENE);
  scene.add(starField);

  // Lights
  const light2 = new THREE.AmbientLight(0xffffff, 0.5);
  const light3 = new THREE.PointLight(0xffffff, 2, 0, 0);
  scene.add(light2, light3);

  // Cameras
  camera.position.set(-planetRad * 9, planetRad * 0.5, planetRad * 2);
  camera.lookAt(0, 0, 0);

  // Update function
  const updateScene = (dt) => {
    t = clock.getElapsedTime();

    planet.update(dt);
    planetMesh.rotation.y = planet.rotation.y;
    orbitMesh.rotation.y = -planet.theta;

    // Move star mesh relative to planet
    starMesh.position.set(-planet.x, -planet.y, -planet.z);
    light3.position.set(
      starMesh.position.x,
      starMesh.position.y,
      starMesh.position.z,
    );
    orbitMesh.position.set(
      starMesh.position.x,
      starMesh.position.y,
      starMesh.position.z,
    );
  };

  return { planetRad, updateScene };
};
