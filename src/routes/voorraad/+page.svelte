<script lang="ts">
  import { onMount } from "svelte";
  import {
    getProducten,
    getCategorieen,
    upsertProduct,
    verwijderProduct,
    type Product,
    type Categorie,
  } from "$lib/db";

  let producten: Product[] = [];
  let categorieen: Categorie[] = [];
  let zoekterm = "";
  let geselecteerdCategorie = 0;
  let formulier: Omit<Product, "id" | "categorie_naam"> & { id?: number } = leegFormulier();
  let toonFormulier = false;
  let bezig = false;

  $: gefilterd = producten.filter((p) => {
    const zoek = zoekterm.toLowerCase();
    const matchZoek =
      p.naam.toLowerCase().includes(zoek) || (p.sku ?? "").toLowerCase().includes(zoek);
    const matchCat = geselecteerdCategorie === 0 || p.categorie_id === geselecteerdCategorie;
    return matchZoek && matchCat;
  });

  function leegFormulier(): Omit<Product, "id" | "categorie_naam"> & { id?: number } {
    return {
      naam: "",
      beschrijving: null,
      sku: null,
      categorie_id: null,
      prijs: 0,
      btw_pct: 6,
      voorraad: 0,
      actief: 1,
    };
  }

  onMount(async () => {
    [producten, categorieen] = await Promise.all([getProducten(false), getCategorieen()]);
  });

  function nieuwProduct() {
    formulier = leegFormulier();
    toonFormulier = true;
  }

  function bewerkProduct(p: Product) {
    formulier = { ...p };
    toonFormulier = true;
  }

  async function slaOp() {
    bezig = true;
    try {
      await upsertProduct(formulier);
      producten = await getProducten(false);
      toonFormulier = false;
    } finally {
      bezig = false;
    }
  }

  async function deactiveer(id: number) {
    if (!confirm("Product deactiveren?")) return;
    await verwijderProduct(id);
    producten = await getProducten(false);
  }

  function formatPrijs(prijs: number) {
    return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" }).format(prijs);
  }
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center gap-3 flex-wrap">
    <h2 class="text-xl font-semibold">Voorraad</h2>

    <input
      type="search"
      bind:value={zoekterm}
      placeholder="Zoeken..."
      class="border border-input rounded-md px-3 py-1.5 text-sm bg-background w-52 focus:outline-none focus:ring-2 focus:ring-ring"
    />

    <select
      bind:value={geselecteerdCategorie}
      class="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value={0}>Alle categorieën</option>
      {#each categorieen as cat}
        <option value={cat.id}>{cat.naam}</option>
      {/each}
    </select>

    <button
      class="ml-auto bg-primary text-primary-foreground rounded-md px-4 py-1.5 text-sm font-medium hover:opacity-90"
      onclick={nieuwProduct}
    >
      + Nieuw product
    </button>
  </div>

  <!-- Tabel -->
  <div class="border border-border rounded-lg overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-muted text-muted-foreground">
        <tr>
          <th class="text-left px-4 py-2 font-medium">Naam</th>
          <th class="text-left px-4 py-2 font-medium">SKU</th>
          <th class="text-left px-4 py-2 font-medium">Categorie</th>
          <th class="text-right px-4 py-2 font-medium">Prijs</th>
          <th class="text-right px-4 py-2 font-medium">BTW</th>
          <th class="text-right px-4 py-2 font-medium">Voorraad</th>
          <th class="text-center px-4 py-2 font-medium">Actief</th>
          <th class="px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {#each gefilterd as p}
          <tr class="border-t border-border hover:bg-muted/50 transition-colors {p.actief ? '' : 'opacity-50'}">
            <td class="px-4 py-2 font-medium">{p.naam}</td>
            <td class="px-4 py-2 text-muted-foreground">{p.sku ?? "—"}</td>
            <td class="px-4 py-2 text-muted-foreground">{p.categorie_naam ?? "—"}</td>
            <td class="px-4 py-2 text-right">{formatPrijs(p.prijs)}</td>
            <td class="px-4 py-2 text-right">{p.btw_pct}%</td>
            <td class="px-4 py-2 text-right {p.voorraad <= 2 ? 'text-destructive font-semibold' : ''}">{p.voorraad}</td>
            <td class="px-4 py-2 text-center">{p.actief ? "✓" : "✗"}</td>
            <td class="px-4 py-2 text-right">
              <button class="text-xs text-muted-foreground hover:text-foreground mr-2" onclick={() => bewerkProduct(p)}>Bewerk</button>
              {#if p.actief}
                <button class="text-xs text-destructive hover:opacity-80" onclick={() => deactiveer(p.id)}>Deactiveer</button>
              {/if}
            </td>
          </tr>
        {/each}
        {#if gefilterd.length === 0}
          <tr>
            <td colspan="8" class="px-4 py-8 text-center text-muted-foreground">Geen producten gevonden.</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>

<!-- Formulier modal -->
{#if toonFormulier}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onclick={() => (toonFormulier = false)}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="bg-background border border-border rounded-xl shadow-xl w-full max-w-lg p-6" onclick={(e) => e.stopPropagation()}>
      <h3 class="text-lg font-semibold mb-4">{formulier.id ? "Product bewerken" : "Nieuw product"}</h3>

      <div class="flex flex-col gap-3 text-sm">
        <label class="flex flex-col gap-1">
          Naam *
          <input bind:value={formulier.naam} class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>

        <label class="flex flex-col gap-1">
          SKU / Artikelnummer
          <input bind:value={formulier.sku} class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>

        <label class="flex flex-col gap-1">
          Categorie
          <select bind:value={formulier.categorie_id} class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value={null}>— geen —</option>
            {#each categorieen as cat}
              <option value={cat.id}>{cat.naam}</option>
            {/each}
          </select>
        </label>

        <div class="grid grid-cols-3 gap-3">
          <label class="flex flex-col gap-1">
            Prijs (incl. BTW) *
            <input type="number" step="0.01" bind:value={formulier.prijs} class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <label class="flex flex-col gap-1">
            BTW %
            <input type="number" step="1" bind:value={formulier.btw_pct} class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <label class="flex flex-col gap-1">
            Voorraad
            <input type="number" step="1" bind:value={formulier.voorraad} class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
        </div>

        <label class="flex flex-col gap-1">
          Beschrijving
          <textarea bind:value={formulier.beschrijving} rows="2" class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"></textarea>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" bind:checked={formulier.actief} class="rounded" />
          Actief
        </label>
      </div>

      <div class="flex justify-end gap-3 mt-5">
        <button class="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted" onclick={() => (toonFormulier = false)}>Annuleer</button>
        <button
          class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50"
          disabled={!formulier.naam || bezig}
          onclick={slaOp}
        >
          {bezig ? "Opslaan..." : "Opslaan"}
        </button>
      </div>
    </div>
  </div>
{/if}
