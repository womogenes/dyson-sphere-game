<script>
  import P5 from 'p5-svelte';
  import { sketch } from './p5-sketch';
  import { onDestroy } from 'svelte';

  onDestroy(() => window.p5.remove());

  import { Game } from '$lib/game.js';
  let game = new Game();
</script>

<svelte:head>
  <title>Photon Farmers</title>
</svelte:head>

<div class="flex h-full w-full divide-x-2 divide-zinc-600 text-white">
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

    <!-- Sketch -->
    <div class="absolute left-0 top-0 -z-10"><P5 {sketch} /></div>
  </div>

  <!-- Right column -->
  <div class="flex min-w-96 flex-col"></div>
</div>

<style>
  :global(body),
  :global(html) {
    height: 100%;
  }
</style>
