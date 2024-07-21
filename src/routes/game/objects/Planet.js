import * as THREE from 'three';

export class Planet {
  constructor({ radius, orbitalRadius, mass }) {
    this.radius = radius;
    this.theta = 0;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.orbitalPeriod = 60 * 60 * 0.5; // seconds
    this.orbitalRadius = orbitalRadius;
    this.rotation = { x: 0, y: 0, z: 0 };
    this.mass = mass;
  }

  update(t, dt) {
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
