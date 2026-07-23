<script lang="ts">
  import { onMount } from "svelte";
  import { getVerkopen, getVerkoopRegels, type Verkoop, type VerkoopRegel } from "$lib/db";

  let verkopen: Verkoop[] = [];
  let geselecteerd: Verkoop | null = null;
  let regels: VerkoopRegel[] = [];
  let van = vandaag();
  let tot = vandaag();

  function vandaag() {
    return new Date().toISOString().slice(0, 10);
  }

  $: dagTotaal = verkopen.reduce((s, v) => s + v.totaal_incl, 0);

  onMount(() => laadVerkopen());

  async function laadVerkopen() {
    verkopen = await getVerkopen(van + " 00:00:00", tot + " 23:59:59");
  }

  async function selecteerVerkoop(v: Verkoop) {
    geselecteerd = v;
    regels = await getVerkoopRegels(v.id);
  }

  function formatPrijs(prijs: number) {
    return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" }).format(prijs);
  }

  function formatDatum(d: string) {
    return new Date(d).toLocaleString("nl-BE");
  }
</script>

<div class="flex gap-6">
  <!-- Overzicht -->
  <div class="flex-1 flex flex-col gap-4">
    <div class="flex items-center gap-3 flex-wrap">
      <h2 class="text-xl font-semibold">Verkopen</h2>
      <div class="flex items-center gap-2 ml-auto">
        <label for="van" class="text-sm text-muted-foreground">Van</label>
        <input id="van" type="date" bind:value={van} class="border border-input rounded-md px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        <label for="tot" class="text-sm text-muted-foreground">tot</label>
        <input id="tot" type="date" bind:value={tot} class="border border-input rounded-md px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        <button class="bg-primary text-primary-foreground rounded-md px-3 py-1 text-sm font-medium hover:opacity-90" onclick={laadVerkopen}>Toon</button>
      </div>
    </div>

    <div class="border border-border rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-muted text-muted-foreground">
          <tr>
            <th class="text-left px-4 py-2 font-medium">#</th>
            <th class="text-left px-4 py-2 font-medium">Datum & tijd</th>
            <th class="text-left px-4 py-2 font-medium">Betaalmethode</th>
            <th class="text-right px-4 py-2 font-medium">Excl. BTW</th>
            <th class="text-right px-4 py-2 font-medium">BTW</th>
            <th class="text-right px-4 py-2 font-medium">Totaal</th>
          </tr>
        </thead>
        <tbody>
          {#each verkopen as v}
            <tr
              class="border-t border-border hover:bg-muted/50 cursor-pointer transition-colors {geselecteerd?.id === v.id ? 'bg-accent' : ''}"
              onclick={() => selecteerVerkoop(v)}
            >
              <td class="px-4 py-2 text-muted-foreground">{v.id}</td>
              <td class="px-4 py-2">{formatDatum(v.datum)}</td>
              <td class="px-4 py-2 capitalize">{v.betaalmethode}</td>
              <td class="px-4 py-2 text-right">{formatPrijs(v.totaal_excl)}</td>
              <td class="px-4 py-2 text-right">{formatPrijs(v.totaal_btw)}</td>
              <td class="px-4 py-2 text-right font-medium">{formatPrijs(v.totaal_incl)}</td>
            </tr>
          {/each}
          {#if verkopen.length === 0}
            <tr>
              <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">Geen verkopen gevonden.</td>
            </tr>
          {/if}
        </tbody>
        {#if verkopen.length > 0}
          <tfoot class="bg-muted font-semibold">
            <tr class="border-t-2 border-border">
              <td colspan="5" class="px-4 py-2 text-right">Dagtotaal ({verkopen.length} verkopen)</td>
              <td class="px-4 py-2 text-right">{formatPrijs(dagTotaal)}</td>
            </tr>
          </tfoot>
        {/if}
      </table>
    </div>
  </div>

  <!-- Detailpaneel -->
  {#if geselecteerd}
    <div class="w-72 border border-border rounded-lg bg-card p-4 flex flex-col gap-3 shrink-0 h-fit">
      <h3 class="font-semibold">Verkoop #{geselecteerd.id}</h3>
      <p class="text-xs text-muted-foreground">{formatDatum(geselecteerd.datum)}</p>
      <p class="text-sm capitalize">Betaling: {geselecteerd.betaalmethode}</p>
      {#if geselecteerd.opmerking}
        <p class="text-sm text-muted-foreground">{geselecteerd.opmerking}</p>
      {/if}

      <div class="border-t border-border pt-3 flex flex-col gap-2">
        {#each regels as r}
          <div class="flex justify-between text-sm">
            <span class="flex-1 truncate">{r.product_naam} × {r.aantal}</span>
            <span class="ml-2 font-medium">{formatPrijs(r.subtotaal)}</span>
          </div>
        {/each}
      </div>

      <div class="border-t border-border pt-3 flex flex-col gap-1 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Excl. BTW</span>
          <span>{formatPrijs(geselecteerd.totaal_excl)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">BTW</span>
          <span>{formatPrijs(geselecteerd.totaal_btw)}</span>
        </div>
        <div class="flex justify-between font-semibold">
          <span>Totaal</span>
          <span>{formatPrijs(geselecteerd.totaal_incl)}</span>
        </div>
      </div>
    </div>
  {/if}
</div>
