<script lang="ts">
  import { onMount } from "svelte";
  import { getProducten, slaVerkoopOp, type Product } from "$lib/db";

  let producten: Product[] = [];
  let zoekterm = "";
  let mandje: { product: Product; aantal: number }[] = [];
  let betaalmethode = "contant";
  let opmerking = "";
  let bezig = false;
  let bevestigd = false;

  $: gefilterd = producten.filter(
    (p) =>
      p.naam.toLowerCase().includes(zoekterm.toLowerCase()) ||
      (p.sku ?? "").toLowerCase().includes(zoekterm.toLowerCase())
  );

  $: totaal = mandje.reduce((s, r) => s + r.aantal * r.product.prijs, 0);

  onMount(async () => {
    producten = await getProducten(true);
  });

  function voegToe(product: Product) {
    const bestaand = mandje.find((r) => r.product.id === product.id);
    if (bestaand) {
      bestaand.aantal++;
      mandje = [...mandje];
    } else {
      mandje = [...mandje, { product, aantal: 1 }];
    }
  }

  function verwijderRegel(index: number) {
    mandje = mandje.filter((_, i) => i !== index);
  }

  function wijzigAantal(index: number, delta: number) {
    mandje[index].aantal = Math.max(1, mandje[index].aantal + delta);
    mandje = [...mandje];
  }

  async function afrekenen() {
    if (mandje.length === 0) return;
    bezig = true;
    try {
      await slaVerkoopOp({
        betaalmethode,
        opmerking: opmerking || undefined,
        regels: mandje.map((r) => ({
          product_id: r.product.id,
          product_naam: r.product.naam,
          aantal: r.aantal,
          stukprijs: r.product.prijs,
          btw_pct: r.product.btw_pct,
        })),
      });
      bevestigd = true;
      setTimeout(() => {
        mandje = [];
        opmerking = "";
        betaalmethode = "contant";
        bevestigd = false;
        producten = [];
        getProducten(true).then((p) => (producten = p));
      }, 2000);
    } finally {
      bezig = false;
    }
  }

  function formatPrijs(prijs: number) {
    return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" }).format(prijs);
  }
</script>

<div class="flex gap-6 h-full">
  <!-- Productoverzicht -->
  <div class="flex-1 flex flex-col gap-4">
    <div class="flex items-center gap-3">
      <h2 class="text-xl font-semibold">Kassa</h2>
      <input
        type="search"
        bind:value={zoekterm}
        placeholder="Zoek op naam of SKU..."
        class="ml-auto border border-input rounded-md px-3 py-1.5 text-sm bg-background w-64 focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

    <div class="grid grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto">
      {#each gefilterd as product}
        <button
          class="text-left border border-border rounded-lg p-3 bg-card hover:bg-accent hover:border-ring transition-colors shadow-sm"
          onclick={() => voegToe(product)}
        >
          <div class="font-medium text-sm leading-tight">{product.naam}</div>
          {#if product.sku}
            <div class="text-xs text-muted-foreground mt-0.5">{product.sku}</div>
          {/if}
          <div class="mt-2 flex items-center justify-between">
            <span class="font-bold text-primary">{formatPrijs(product.prijs)}</span>
            <span class="text-xs text-muted-foreground">voorraad: {product.voorraad}</span>
          </div>
        </button>
      {/each}
      {#if gefilterd.length === 0}
        <p class="col-span-3 text-muted-foreground text-sm py-8 text-center">Geen producten gevonden.</p>
      {/if}
    </div>
  </div>

  <!-- Mandje & Afrekenen -->
  <div class="w-80 flex flex-col gap-4 shrink-0">
    <h2 class="text-xl font-semibold">Winkelmandje</h2>

    <div class="flex-1 overflow-y-auto flex flex-col gap-2">
      {#each mandje as regel, i}
        <div class="flex items-center gap-2 border border-border rounded-md p-2 bg-card text-sm">
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate">{regel.product.naam}</div>
            <div class="text-muted-foreground text-xs">{formatPrijs(regel.product.prijs)} / stuk</div>
          </div>
          <div class="flex items-center gap-1">
            <button class="w-6 h-6 rounded border border-border text-center" onclick={() => wijzigAantal(i, -1)}>−</button>
            <span class="w-6 text-center">{regel.aantal}</span>
            <button class="w-6 h-6 rounded border border-border text-center" onclick={() => wijzigAantal(i, 1)}>+</button>
          </div>
          <div class="w-16 text-right font-medium">{formatPrijs(regel.aantal * regel.product.prijs)}</div>
          <button class="text-muted-foreground hover:text-destructive ml-1" onclick={() => verwijderRegel(i)}>✕</button>
        </div>
      {/each}
      {#if mandje.length === 0}
        <p class="text-muted-foreground text-sm text-center py-8">Mandje is leeg.</p>
      {/if}
    </div>

    <div class="border-t border-border pt-4 flex flex-col gap-3">
      <div class="flex justify-between font-bold text-lg">
        <span>Totaal</span>
        <span>{formatPrijs(totaal)}</span>
      </div>

      <select
        bind:value={betaalmethode}
        class="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="contant">Contant</option>
        <option value="payconiq">Payconiq</option>
        <option value="gemengd">Gemengd</option>
      </select>

      <input
        type="text"
        bind:value={opmerking}
        placeholder="Opmerking (optioneel)"
        class="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {#if bevestigd}
        <div class="bg-green-50 border border-green-200 text-green-800 rounded-md px-4 py-3 text-center font-medium">
          Verkoop geregistreerd!
        </div>
      {:else}
        <button
          class="bg-primary text-primary-foreground rounded-md px-4 py-3 font-semibold text-sm
            hover:opacity-90 disabled:opacity-50 transition-opacity"
          disabled={mandje.length === 0 || bezig}
          onclick={afrekenen}
        >
          {bezig ? "Bezig..." : "Afrekenen"}
        </button>
      {/if}
    </div>
  </div>
</div>
