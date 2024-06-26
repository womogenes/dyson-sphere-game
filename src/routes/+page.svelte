<script>
  import P5 from 'p5-svelte';
  let width = window.innerWidth;
  let height = window.innerHeight;

  const sketch = (p5) => {
    let swarm = [];

    p5.setup = () => {
      p5.createCanvas(width, height);
    };

    p5.windowResized = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      p5.resizeCanvas(width, height);
    };

    p5.draw = () => {
      p5.background('#161519');

      let sunRad = 200;
      let mercuryRad = 20;
      let mercuryOrbitRad = 400;

      p5.noStroke();

      let minAxis = Math.min(width, height);
      let scale = (minAxis / 400) * 0.2;

      // Sun
      p5.fill('#ebc034');
      p5.circle(width / 2, height / 2, sunRad * scale);

      // Mercury
      let theta = p5.frameCount * 0.005;
      p5.fill('#84868a');
      p5.circle(
        width / 2 + mercuryOrbitRad * Math.cos(theta) * scale,
        height / 2 + mercuryOrbitRad * Math.sin(theta) * scale,
        mercuryRad * scale,
      );

      p5.fill('#dddddd');
      for (let { x, y } of swarm) {
        p5.circle(x, y, 5 * scale, 5 * scale);
      }

      if (p5.frameCount % 10 === 0)
        swarm.push({ x: Math.random() * width, y: Math.random() * height });
    };
  };
</script>

<svelte:head>
  <link rel="icon" href="https://fav.farm/🪩" />
  <title>Svelte</title>

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

<div class="flex h-screen w-full bg-black text-white">
  <div class="z-10 flex w-full flex-col items-center p-32">
    <h1
      class="mb-2 text-center font-[Montserrat] text-6xl font-black uppercase"
    >
      Photon Farmers
    </h1>
    <p>a game about building a dyson sphere</p>
    <p>coming august 2024</p>
  </div>
  <div class="absolute"><P5 {sketch} /></div>
</div>
