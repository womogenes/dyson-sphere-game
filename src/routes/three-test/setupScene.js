import * as THREE from 'three';
import { BLOOM_SCENE } from './constants.js';
import { getStarfield } from '$lib/three/StarField.js';
import { LodCircleGeometry } from '$lib/three/LoDCircleGeometry.js';
import { game } from '$lib/game.js';

const stores = game.stores;

// GLOBAL TIME for this scene
let t = 0;
let frameCount = 0;

class Planet {
  constructor({ radius, orbitalRadius }) {
    this.radius = radius;
    this.theta = 0;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.orbitalPeriod = 1e10; // seconds
    this.orbitalRadius = orbitalRadius;
    this.rotation = { x: 0, y: 0, z: 0 };
  }

  update(dt) {
    this.rotation.y = (t * Math.PI * 2) / 60;
    this.theta = -(t * 2 * Math.PI) / this.orbitalPeriod + Math.PI;
    this.pos.x = Math.cos(this.theta) * this.orbitalRadius;
    this.pos.z = Math.sin(this.theta) * this.orbitalRadius;
  }
}

class Satellite {
  static geometry = new THREE.ConeGeometry(100, 200, 8, 1, false);
  static material = new THREE.MeshPhongMaterial({
    emissive: true,
    color: 0xffffff,
  });

  constructor({ pos, vel }) {
    this.pos = pos; // x, y, and z components
    this.vel = vel;

    this.mesh = new THREE.Mesh(Satellite.geometry, Satellite.material);
    this.mesh.layers.enable(BLOOM_SCENE);
  }

  update(dt) {
    // Get attracted to center
  }
}

export const setupScene = ({ scene, camera, clock }) => {
  // CONSTANTS
  const planetRad = 1e4;
  const planetOrbitRad = 1e8;
  const starRadius = 7e6;

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
  const orbitGeometry = LodCircleGeometry(
    planetOrbitRad,
    Math.PI * 0.5,
    128,
    32,
  );
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0x404040,
    linewidth: 10,
  });
  const orbitMesh = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  // scene.add(orbitMesh);

  // Star
  const starGeometry = new THREE.IcosahedronGeometry(starRadius, 12);
  const starMaterial = new THREE.MeshStandardMaterial({
    emissive: 0xfffaf8,
    emissiveIntensity: 0.5,
    depthTest: true,
  });
  const starMesh = new THREE.Mesh(starGeometry, starMaterial);
  starMesh.layers.enable(BLOOM_SCENE);
  scene.add(starMesh);

  // Star field
  const starField = getStarfield({ numStars: 1000 });
  starField.layers.enable(BLOOM_SCENE);
  scene.add(starField);

  // Swarm
  const swarm = [];
  stores.numSatellites.set(0);

  // Lights
  const light2 = new THREE.AmbientLight(0xffffff, 0.5);
  const light3 = new THREE.PointLight(0xffffff, 2, 0, 0);
  scene.add(light2, light3);

  // Cameras
  camera.position.set(-planetRad * 9, planetRad * 2, planetRad * 2);
  camera.lookAt(0, 0, 0);

  // Update function
  const updateScene = (dt) => {
    t = clock.getElapsedTime();
    frameCount++;

    // Update swarm
    if (frameCount % 30 === 1 && swarm.length < 1000) {
      let phi = Math.random() * Math.PI;
      let theta = Math.random() * 2 * Math.PI;
      let planetLocalCoords = new THREE.Vector3(
        (planetRad + 10) * Math.sin(phi) * Math.cos(theta),
        (planetRad + 10) * Math.cos(phi),
        (planetRad + 10) * Math.sin(phi) * Math.sin(theta),
      );
      const sat = new Satellite({
        pos: planetLocalCoords.clone().add(planet.pos),
        vel: new THREE.Vector3(),
      });
      sat.mesh.position.copy(planetLocalCoords);

      swarm.push(sat);
      scene.add(sat.mesh);
      stores.numSatellites.update((x) => ++x);
    }

    // Update planet
    planet.update(dt);
    planetMesh.rotation.y = planet.rotation.y;
    orbitMesh.rotation.y = -planet.theta;

    // Move star mesh relative to planet
    starMesh.position.set(-planet.pos.x, -planet.pos.y, -planet.pos.z);
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
