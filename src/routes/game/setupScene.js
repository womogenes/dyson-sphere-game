import * as THREE from 'three';
import {
  BLOOM_SCENE,
  PLANET_RAD,
  PLANET_ORBIT_RAD,
  STAR_RAD,
  G,
  PLANET_MASS,
} from './constants.js';
import { getStarfield } from '$lib/three/StarField.js';
import { LodCircleGeometry } from '$lib/three/LoDCircleGeometry.js';
import { game } from '$lib/game.js';
import { Satellite } from './objects/Satellite.js';
import { Planet } from './objects/Planet.js';

const stores = game.stores;

// GLOBAL TIME for this scene
let t = 0;
let frameCount = 0;

export const setupScene = ({ scene, camera }) => {
  // Planet
  const planet = new Planet({
    radius: PLANET_RAD,
    orbitalRadius: PLANET_ORBIT_RAD,
    mass: PLANET_MASS,
  });
  const planetGeometry = new THREE.IcosahedronGeometry(PLANET_RAD, 16);
  const loader = new THREE.TextureLoader();
  const planetMaterial = new THREE.MeshPhongMaterial({
    map: loader.load('textures/mercury_16k.jpg'),
  });
  const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
  scene.add(planetMesh);
  Satellite.planet = planet;

  // Planet orbit
  const orbitGeometry = LodCircleGeometry(
    PLANET_ORBIT_RAD,
    Math.PI * 0.5,
    128,
    32,
  );
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0x404040,
    linewidth: 10,
  });
  const orbitMesh = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  scene.add(orbitMesh);

  // Star
  const starGeometry = new THREE.IcosahedronGeometry(STAR_RAD, 12);
  const starMaterial = new THREE.MeshStandardMaterial({
    emissive: 0xfffaf8,
    emissiveIntensity: 1,
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
  camera.position.set(-PLANET_RAD * 9, PLANET_RAD * 2, PLANET_RAD * 2);
  camera.lookAt(0, 0, 0);

  // Handler for adding new satellite
  const spawnSatellite = () => {
    if (swarm.length > 500) return; // Don't bother rendering these

    // Calculate satellite's coords relative to planet
    let phi = (Math.random() - 0.5) * 0.5 + Math.PI / 2;
    let theta = Math.random() * 2 * Math.PI;
    let initRadius = PLANET_RAD * (Math.random() * 1 + 2);
    let planetLocalCoords = new THREE.Vector3(
      initRadius * Math.sin(phi) * Math.cos(theta),
      initRadius * Math.cos(phi),
      initRadius * Math.sin(phi) * Math.sin(theta),
    );

    // Calculate velocity needed to stay in orbit
    let orbitSpeed = Math.sqrt((G * PLANET_MASS) / initRadius);
    const sat = new Satellite({
      pos: planet.pos.clone().add(planetLocalCoords),
      vel: planet.vel
        .clone()
        .add(
          new THREE.Vector3(
            Math.sin(theta) * orbitSpeed,
            0,
            -Math.cos(theta) * orbitSpeed,
          ),
        ),
      planet: planet,
    });
    sat.mesh.position.copy(planetLocalCoords);

    swarm.push(sat);
    scene.add(sat.mesh);
    stores.storedEnergy.update((x) => x - 1);
    stores.numSatellites.update((x) => ++x);
  };

  // Update function
  const updateScene = (dt) => {
    t += dt;
    frameCount++;

    // Update planet
    planet.update(t, dt);
    planetMesh.rotation.y = planet.rotation.y;
    orbitMesh.rotation.y = -planet.theta;

    // Update swarm
    swarm.forEach((sat) => sat.update(dt));

    // Move swarm meshes
    for (let sat of swarm) {
      sat.mesh.position.copy(sat.pos.clone().sub(planet.pos));
    }

    // Move star mesh relative to planet
    starMesh.position.set(-planet.pos.x, -planet.pos.y, -planet.pos.z);
    starMesh.rotation.y += dt * 0.01;
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

  return { updateScene, spawnSatellite };
};
