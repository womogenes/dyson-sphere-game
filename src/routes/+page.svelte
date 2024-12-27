<script>
  import P5 from 'p5-svelte';
  import { onDestroy } from 'svelte';

  let width = window.innerWidth;
  let height = window.innerHeight;

  onDestroy(() => window.p5.remove());

  const sketch = (p5) => {
    let swarm = [];
    let t = 0;
    let dt = 0.1;
    let lastUpdated;
    let id = Math.random();
    window.p5 = p5;

    p5.setup = () => {
      p5.createCanvas(width, height);
      for (let c of ['opacity-100', 'opacity-0'])
        document.querySelector('#sketch-container').classList.toggle(c);
      p5.frameRate(90);
      lastUpdated = new Date();
    };

    p5.windowResized = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      p5.resizeCanvas(width, height);
    };

    p5.draw = () => {
      dt = Math.min(new Date() - lastUpdated, 33) * 0.01;
      t += dt;

      let sunRad = 200;
      let mercuryRad = 20;
      let mercuryOrbitRad = sunRad * 5;

      let minAxis = Math.min(width * 2, height);
      let scale = (minAxis / 450) * 0.2;

      let theta = Math.PI / 2 + -t * 0.05;
      let mercury = {
        x: mercuryOrbitRad * Math.cos(theta),
        y: mercuryOrbitRad * Math.sin(theta),
        vx: mercuryOrbitRad * -Math.sin(theta) * -0.05,
        vy: mercuryOrbitRad * Math.cos(theta) * -0.05,
      };

      // Add new satellite to the swarm sometimes
      if (p5.frameCount % 5 === 1 && swarm.length < 1e3) {
        let theta2 = Math.random() * 2 * Math.PI;
        swarm.push({
          x: mercury.x + mercuryRad * Math.cos(theta2),
          y: mercury.y + mercuryRad * Math.sin(theta2),
          vx: mercury.vx * 0.5,
          vy: mercury.vy * 0.5,
        });
      }

      let mu = 2.56e6; // Gravitational constant
      for (let sat of swarm) {
        sat.d2 = sat.x * sat.x + sat.y * sat.y;
        sat.d = Math.sqrt(sat.d2);

        sat.x += sat.vx * dt;
        sat.y += sat.vy * dt;

        let normX = sat.x / sat.d;
        let normY = sat.y / sat.d;

        sat.vx += (mu / sat.d2) * -normX * dt;
        sat.vy += (mu / sat.d2) * -normY * dt;

        // Control if too close
        if (sat.d2 < sunRad * sunRad * 2 * 2) {
          let targetVx = Math.sqrt(mu / sat.d) * normY;
          let targetVy = Math.sqrt(mu / sat.d) * -normX;

          let dVx = targetVx - sat.vx;
          let dVy = targetVy - sat.vy;
          let norm = Math.sqrt(dVx * dVx + dVy * dVy);
          let power = 20;

          sat.vx += (dVx / norm) * power * dt;
          sat.vy += (dVy / norm) * power * dt;
        }
      }

      // Draw stuff
      p5.background('#18181b');
      p5.translate(width / 2, height / 2);
      p5.scale(scale);
      p5.noStroke();
      p5.strokeWeight(0);

      // Sun
      p5.fill('#ebc034');
      p5.circle(0, 0, sunRad * 2);

      // Mercury
      p5.fill('#84868a');
      p5.noStroke();
      p5.circle(mercury.x, mercury.y, mercuryRad * 2);

      // Swarm
      p5.fill('#dddddd');
      for (let sat of swarm) {
        p5.circle(sat.x, sat.y, 5);
      }

      // Update timestamp
      lastUpdated = new Date();
    };
  };
</script>

<div class="flex h-full w-full text-white">
  <div
    class="z-10 flex h-full w-full flex-col items-center justify-between px-6 text-center"
  >
    <h1
      class="mb-2 pt-10 font-title text-6xl font-black uppercase tracking-tight sm:pt-40 sm:text-8xl"
    >
      Photon Farmers
    </h1>
    <div class="pb-10 sm:pb-40">
      <p>a game about the future of solar energy</p>
      <p>coming sometime 2025</p>
      <p>
        <a href="/game" class="underline opacity-60">(play the preview here)</a>
      </p>
    </div>
  </div>
  <div
    id="sketch-container"
    class="fixed opacity-0 transition-opacity duration-1000"
  >
    <P5 {sketch} />
  </div>
</div>

<style>
  :global(body),
  :global(html) {
    height: 100%;
  }
</style>
