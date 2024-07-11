<script>
  import { onDestroy, onMount } from 'svelte';
  import { createScene } from './scene.js';
  import Stats from 'stats.js';

  let stats = new Stats();

  let canvasEl, graphicsContainerEl;
  let deleteScene = () => {};

  onMount(() => {
    deleteScene = createScene(canvasEl, stats, graphicsContainerEl);
    stats.showPanel(0);
    graphicsContainerEl.appendChild(stats.dom);
    stats.dom.classList.toggle('stats-js');
  });
  onDestroy(() => {
    deleteScene();
    stats = null;
  });
</script>

<div
  class="flex h-full w-full divide-x-2 divide-zinc-600 overflow-auto text-white"
>
  <!-- Left column-->
  <div class="flex min-w-96 flex-col divide-y-2 divide-zinc-600">
    <div class="px-4 py-2">
      <h1 class="text-xl font-black uppercase">Photon Farmers</h1>
    </div>

    <!-- Energy stats -->
    <div class="flex flex-col gap-4 p-4">
      <!-- Production section -->
      <div class="flex flex-col">
        <span>Production</span>
        <div
          class="mb-1 flex flex-wrap items-end justify-between whitespace-pre"
        >
          <span class="text-2xl font-bold">51,346 MW</span>
          <span class="ml-auto">/ 170,000 MW</span>
        </div>
        <div class="h-3 w-full rounded-full bg-zinc-700">
          <div
            class="h-full rounded-full bg-yellow-400"
            style="width: 50%"
          ></div>
        </div>
      </div>

      <div>
        <span>Storage</span>
        <div
          class="mb-1 flex flex-wrap items-end justify-between whitespace-pre"
        >
          <span class="text-2xl font-bold">45,805 MWh</span>
          <span class="ml-auto">/ 50,000 MWh</span>
        </div>
        <div class="h-3 w-full rounded-full bg-zinc-700">
          <div class="h-full rounded-full bg-blue-400" style="width: 80%"></div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="h-full p-4">
      <h1>Production</h1>
    </div>
  </div>

  <!-- Center column -->
  <div
    id="sketch-container"
    class="relative h-full w-full min-w-96 overflow-hidden"
  >
    <!-- Tabs -->
    <div class="w-full">
      <div class="mx-auto flex w-min gap-16 rounded-b-lg p-4 font-bold">
        <button>Earth</button>
        <button class="underline">Mercury</button>
        <button>Sun</button>
      </div>
    </div>

    <!-- Graphics -->
    <div
      bind:this={graphicsContainerEl}
      class="absolute left-0 top-0 z-50 h-full w-full"
    >
      <canvas bind:this={canvasEl} />
    </div>
  </div>
</div>

<style>
  :global(body, html) {
    height: 100%;
  }
  :global(div.stats-js) {
    position: absolute !important;
  }
</style>
