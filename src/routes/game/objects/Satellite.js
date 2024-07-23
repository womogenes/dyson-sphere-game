import * as THREE from 'three';
import { BLOOM_SCENE, G } from '../constants';

export class Satellite {
  static material = new THREE.MeshPhongMaterial({
    emissive: true,
    color: 0xffffff,
  });

  constructor({ pos, vel, planet }) {
    this.pos = new THREE.Vector3().copy(pos); // x, y, and z components
    this.vel = new THREE.Vector3().copy(vel);
    this.planet = planet;

    this.mesh = new THREE.Mesh(Satellite.geometry, Satellite.material);
    this.mesh.layers.enable(BLOOM_SCENE);
  }

  static getAcceleration(pos, vel) {
    // Compute acceleration given position and velocity
    const R = pos.clone().sub(Satellite.planet.pos);
    const r = R.length();

    return R.multiplyScalar(-(G * Satellite.planet.mass) / (r * r * r));
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
