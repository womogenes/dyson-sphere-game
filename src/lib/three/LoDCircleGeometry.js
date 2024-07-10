// Level-of-Detail Circle Geometry
// Has more points close to one section for efficient rendering

import * as THREE from 'three';

export const LodCircleGeometry = (
  radius,
  fineTheta,
  numFineSegments,
  numCoarseSegments,
) => {
  // fineTheta: how much of circle should be fine
  // numFineSegments: number of semgents for fine area
  // numCoarseSegments: number of segments for coarse area

  const positions = new Float32Array((numFineSegments + numCoarseSegments) * 3);
  for (let i = 0; i < numFineSegments; i++) {
    const theta = -fineTheta / 2 + (i / numFineSegments) * fineTheta;
    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = Math.sin(theta) * radius;
  }
  for (let i = 0; i < numCoarseSegments; i++) {
    const theta =
      fineTheta / 2 + (i / numCoarseSegments) * (2 * Math.PI - fineTheta);
    positions[i * 3 + numFineSegments * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1 + numFineSegments * 3] = 0;
    positions[i * 3 + 2 + numFineSegments * 3] = Math.sin(theta) * radius;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geometry;
};
