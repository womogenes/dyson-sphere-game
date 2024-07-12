import * as THREE from 'three';
import {
  BLOOM_SCENE,
  PLANET_RAD,
  PLANET_ORBIT_RAD,
  STAR_RAD,
  G,
  PLANET_MASS,
  STAR_MASS,
} from './constants.js';
import { getStarfield } from '$lib/three/StarField.js';
import { LodCircleGeometry } from '$lib/three/LoDCircleGeometry.js';
import { game } from '$lib/game.js';

const stores = game.stores;

// GLOBAL TIME for this scene
let t = 0;
let frameCount = 0;

class Planet {
  constructor({ radius, orbitalRadius, mass }) {
    this.radius = radius;
    this.theta = 0;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.orbitalPeriod = 60 * 60 * 0.1; // seconds
    this.orbitalRadius = orbitalRadius;
    this.rotation = { x: 0, y: 0, z: 0 };
    this.mass = mass;
  }

  update(dt) {
    this.rotation.y = (t * Math.PI * 2) / 60;
    this.theta = -(t * 2 * Math.PI) / this.orbitalPeriod + Math.PI;

    this.pos.x = Math.cos(this.theta) * this.orbitalRadius;
    this.pos.z = Math.sin(this.theta) * this.orbitalRadius;

    // Calculus (blegh)
    let dTheta = (-2 * Math.PI) / this.orbitalPeriod;
    this.vel.set(
      -Math.sin(this.theta) * dTheta * this.orbitalRadius,
      0,
      Math.cos(this.theta) * dTheta * this.orbitalRadius,
    );
  }
}

class Satellite {
  static material = new THREE.MeshPhongMaterial({
    emissive: true,
    color: 0xffffff,
  });

  constructor({ pos, vel, planet }) {
    this.pos = pos; // x, y, and z components
    this.vel = vel;
    this.planet = planet;

    this.mesh = new THREE.Mesh(Satellite.geometry, Satellite.material);
    this.mesh.layers.enable(BLOOM_SCENE);
  }

  getAcceleration(pos, vel) {
    // Compute acceleration given position and velocity
    const R = this.pos.clone().sub(this.planet.pos);
    const r = R.length();
    return R.multiplyScalar((G * this.planet.mass) / (r * r));
  }

  update(dt) {
    // Velocity Verlet: https://en.wikipedia.org/wiki/Verlet_integration#Velocity_Verlet
    let acc = Satellite.getAcceleration(this.pos, this.vel);
    let newPos = this.pos
      .clone()
      .addScaledVector(this.vel, dt)
      .addScaledVector(acc, (dt * dt) / 2);
    let newAcc = Satellite.getAcceleration(newPos, this.vel);
    let newVel = this.vel.clone().addScaledVector(acc.add(newAcc), dt / 2);

    this.pos.copy(newPos);
    this.vel.copy(newVel);
    this.mesh.lookAt(this.mesh.position.clone().add(this.vel));
  }
}
Satellite.geometry = new THREE.ConeGeometry(200, 400, 8, 1, false);
Satellite.geometry.rotateX(Math.PI / 2); // Orient point for mesh.lookAt

export const setupScene = ({ scene, camera }) => {
  // Planet
  const planet = new Planet({
    radius: PLANET_RAD,
    orbitalRadius: PLANET_ORBIT_RAD,
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
  camera.position.set(-PLANET_RAD * 9, PLANET_RAD * 2, PLANET_RAD * 2);
  camera.lookAt(0, 0, 0);

  // Update function
  const updateScene = (dt) => {
    t += dt;
    frameCount++;

    // Update planet
    planet.update(dt);
    planetMesh.rotation.y = planet.rotation.y;
    orbitMesh.rotation.y = -planet.theta;

    // Update swarm
    if (frameCount % 2 === 1 && swarm.length < 500) {
      let phi = (Math.random() - 0.5) * 3.14 + Math.PI / 2;
      let theta = Math.random() * 2 * Math.PI;
      let planetLocalCoords = new THREE.Vector3(
        PLANET_RAD * 1.5 * Math.sin(phi) * Math.cos(theta),
        PLANET_RAD * 1.5 * Math.cos(phi),
        PLANET_RAD * 1.5 * Math.sin(phi) * Math.sin(theta),
      );
      const sat = new Satellite({
        pos: planet.pos.clone().add(planetLocalCoords),
        vel: planet.vel.clone(),
        planet: planet,
      });
      sat.mesh.position.copy(planetLocalCoords);

      swarm.push(sat);
      scene.add(sat.mesh);
      stores.numSatellites.update((x) => ++x);
    }
    swarm.forEach((sat) => sat.update(dt));

    // Move swarm meshes
    for (let sat of swarm) {
      sat.mesh.position.copy(sat.pos.clone().sub(planet.pos));
    }

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

  return { updateScene };
};
