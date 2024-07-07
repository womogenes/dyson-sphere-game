<script>
  import { onDestroy, onMount } from 'svelte';
  import { createScene } from './scene.js';

  let el;
  let deleteScene = () => {};

  onMount(() => (deleteScene = createScene(el)));
  onDestroy(() => deleteScene());
</script>

<canvas bind:this={el} />
