<script>
  import { onDestroy, onMount } from 'svelte';
  import { createScene } from './scene.js';
  import Stats from 'stats.js';

  let stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  stats.dom.classList.toggle('stats-js');

  let el;
  let deleteScene = () => {};

  onMount(() => (deleteScene = createScene(el, stats)));
  onDestroy(() => {
    deleteScene();
    stats = null;
  });
</script>

<canvas bind:this={el} />

<style>
  :global(div.stats-js) {
    position: absolute !important;
  }
</style>
