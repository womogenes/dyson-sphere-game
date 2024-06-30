export const sketch = (p5) => {
  let t = 0;
  let dt = 0.1;
  let lastUpdated;

  let parentDiv = document.querySelector('#sketch-container');
  let width, height;

  window.p5 = p5;

  p5.setup = () => {
    p5.windowResized();
    p5.createCanvas(width, height);
    for (let c of ['opacity-100', 'opacity-0']) parentDiv.classList.toggle(c);
    p5.frameRate(90);
    lastUpdated = new Date();
  };

  p5.windowResized = () => {
    width = parentDiv.clientWidth;
    height = parentDiv.clientHeight;
    p5.resizeCanvas(width, height);
  };

  p5.draw = () => {
    dt = Math.min(new Date() - lastUpdated, 33) * 0.01;
    t += dt;

    p5.translate(width / 2, height / 2);
    p5.background('#18181b');
    p5.fill('#3b82f6');
    p5.circle(0, 0, 200);

    // Update timestamp
    lastUpdated = new Date();
  };

  return p5;
};
