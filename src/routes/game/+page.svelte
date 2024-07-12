<script>
  import { onDestroy, onMount } from 'svelte';
  import { createScene } from './scene.js';
  import Stats from 'stats.js';

  import { game } from '$lib/game.js';
  let stores = {};
  let storeSubscriptions = [];
  Object.keys(game.stores).forEach((key) => {
    const unsubscribe =
      game?.stores[key]?.subscribe &&
      game?.stores[key]?.subscribe((value) => {
        stores[key] = value;
      });
    storeSubscriptions.push(unsubscribe);
  });

  // Graphics scene
  let stats = new Stats();
  let canvasEl, graphicsContainerEl;
  let deleteScene = () => {};
  let tickLoopTimeoutId;
  let lastTickTime = 0;

  onMount(() => {
    // Set up 3D scene, stats.js
    deleteScene = createScene(canvasEl, stats, graphicsContainerEl);
    stats.showPanel(0);
    graphicsContainerEl.appendChild(stats.dom);
    stats.dom.classList.toggle('stats-js');

    // Game tick
    const tickLoop = () => {
      let dt = Math.min(Date.now() - lastTickTime, 1000);
      game.tick(dt);
      tickLoopTimeoutId = setTimeout(tickLoop, 50);
      lastTickTime = Date.now();
    };
    tickLoop();
  });

  onDestroy(() => {
    deleteScene();
    storeSubscriptions.forEach((unsub) => unsub());
    stats = null;
    clearTimeout(tickLoopTimeoutId);
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
        <span>Power</span>
        <div
          class="mb-1 flex flex-wrap items-end justify-between whitespace-pre"
        >
          <span class="text-2xl font-bold tabular-nums">{stores.power} MW</span>
          <span class="ml-auto">/ {stores.maxPower.toLocaleString()} MW</span>
        </div>
        <div class="h-2.5 w-full overflow-hidden rounded-full bg-zinc-700">
          <div
            class="h-full rounded-full bg-yellow-400"
            style={`width: ${(stores.power / stores.maxPower) * 100}%`}
          ></div>
        </div>
      </div>

      <div>
        <span>Energy</span>
        <div
          class="mb-1 flex flex-wrap items-end justify-between whitespace-pre"
        >
          <span class="text-2xl font-bold tabular-nums"
            >{stores.storedEnergy.toLocaleString('en-US', {
              maximumFractionDigits: 0,
            })} MWh</span
          >
          <span class="ml-auto"
            >/ {stores.maxStoredEnergy.toLocaleString()} MWh</span
          >
        </div>
        <div class="h-2.5 w-full overflow-hidden rounded-full bg-zinc-700">
          <div
            class="h-full rounded-full bg-blue-400"
            style={`width: ${(stores.storedEnergy / stores.maxStoredEnergy) * 100}%`}
          ></div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="h-full p-4">
      <h1 class="font-bold">Swarm</h1>
      <p>Satellites: {stores.numSatellites}</p>
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
