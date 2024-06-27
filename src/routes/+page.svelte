<script>
  import P5 from 'p5-svelte';
  let width = window.innerWidth;
  let height = window.innerHeight;

  const sketch = (p5) => {
    let swarm = [];
    let t = 0;
    let dt = 0.1;

    p5.setup = () => {
      p5.createCanvas(width, height);
      for (let c of ['opacity-100', 'opacity-0'])
        document.querySelector('#sketch-container').classList.toggle(c);
      p5.frameRate(60);
    };

    p5.windowResized = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      p5.resizeCanvas(width, height);
    };

    p5.draw = () => {
      dt = 0.1 / (60 / p5.frameRate());
      t += dt;

      let sunRad = 200;
      let mercuryRad = 20;
      let mercuryOrbitRad = sunRad * 5;

      let minAxis = Math.min(width * 2, height);
      let scale = (minAxis / 450) * 0.2;

      p5.background('#161519');
      p5.translate(width / 2, height / 2);
      p5.scale(scale);
      p5.noStroke();

      // Sun
      p5.fill('#ebc034');
      p5.circle(0, 0, sunRad * 2);

      // Swarm
      p5.fill('#dddddd');
      for (let { x, y } of swarm) {
        p5.circle(x, y, 5);
      }

      // Mercury
      let theta = Math.PI / 2 + -t * 0.05;
      let mercury = {
        x: mercuryOrbitRad * Math.cos(theta),
        y: mercuryOrbitRad * Math.sin(theta),
        vx: mercuryOrbitRad * -Math.sin(theta) * -0.05,
        vy: mercuryOrbitRad * Math.cos(theta) * -0.05,
      };
      p5.fill('#84868a');
      p5.circle(mercury.x, mercury.y, mercuryRad * 2);

      // Update swarm
      if (p5.frameCount % 5 === 1 && swarm.length < 1e3) {
        let theta2 = theta + (1 + (Math.random() - 0.5) * 0.8) * Math.PI;
        swarm.push({
          x: mercury.x + mercuryRad * Math.cos(theta2),
          y: mercury.y + mercuryRad * Math.sin(theta2),
          vx: mercury.vx * 0.5,
          vy: mercury.vy * 0.5,
        });
      }

      let mu = 2.56e6; // Gravitational constant
      for (let sat of swarm) {
        sat.x += sat.vx * dt;
        sat.y += sat.vy * dt;

        let d2 = sat.x * sat.x + sat.y * sat.y;
        let d = Math.sqrt(d2);
        let normX = sat.x / d;
        let normY = sat.y / d;

        sat.vx += (mu / d2) * -normX * dt;
        sat.vy += (mu / d2) * -normY * dt;

        // Control if too close
        if (d2 < sunRad * sunRad * 2 * 2) {
          let targetVx = Math.sqrt(mu / d) * normY;
          let targetVy = Math.sqrt(mu / d) * -normX;

          let dVx = targetVx - sat.vx;
          let dVy = targetVy - sat.vy;
          let norm = Math.sqrt(dVx * dVx + dVy * dVy);
          let power = 20;

          sat.vx += (dVx / norm) * power * dt;
          sat.vy += (dVy / norm) * power * dt;
        }
      }
    };
  };
</script>

<svelte:head>
  <link rel="icon" href="https://fav.farm/🪩" />
  <title>Photon Farmers</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
    rel="stylesheet"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="flex h-full w-full text-white">
  <div
    class="z-10 flex h-full w-full flex-col items-center justify-between px-4 text-center"
  >
    <h1
      class="mb-2 pt-10 font-title text-6xl font-black uppercase tracking-tight sm:pt-40 sm:text-8xl"
    >
      Photon Farmers
    </h1>
    <div class="pb-10 sm:pb-40">
      <p>a game about the future of solar energy</p>
      <p class="opacity-60">coming august 2024</p>
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
