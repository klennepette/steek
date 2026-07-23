<script lang="ts">
  import { onMount } from "svelte";
  import { getSales, getSaleLines, type Sale, type SaleLine } from "$lib/db";

  let sales: Sale[] = [];
  let selected: Sale | null = null;
  let lines: SaleLine[] = [];
  let from = today();
  let to = today();

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  $: dayTotal = sales.reduce((sum, s) => sum + s.total_incl, 0);

  onMount(() => loadSales());

  async function loadSales() {
    sales = await getSales(from + " 00:00:00", to + " 23:59:59");
  }

  async function selectSale(sale: Sale) {
    selected = sale;
    lines = await getSaleLines(sale.id);
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" }).format(price);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString("nl-BE");
  }

  const paymentLabels: Record<string, string> = {
    cash: "Contant",
    payconiq: "Payconiq",
    mixed: "Gemengd",
  };
</script>

<div class="flex gap-6">
  <!-- Overview -->
  <div class="flex-1 flex flex-col gap-4">
    <div class="flex items-center gap-3 flex-wrap">
      <h2 class="text-xl font-semibold">Verkopen</h2>
      <div class="flex items-center gap-2 ml-auto">
        <label for="from" class="text-sm text-muted-foreground">Van</label>
        <input id="from" type="date" bind:value={from} class="border border-input rounded-md px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        <label for="to" class="text-sm text-muted-foreground">tot</label>
        <input id="to" type="date" bind:value={to} class="border border-input rounded-md px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        <button class="bg-primary text-primary-foreground rounded-md px-3 py-1 text-sm font-medium hover:opacity-90" onclick={loadSales}>Toon</button>
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
          {#each sales as sale}
            <tr
              class="border-t border-border hover:bg-muted/50 cursor-pointer transition-colors {selected?.id === sale.id ? 'bg-accent' : ''}"
              onclick={() => selectSale(sale)}
            >
              <td class="px-4 py-2 text-muted-foreground">{sale.id}</td>
              <td class="px-4 py-2">{formatDate(sale.created_at)}</td>
              <td class="px-4 py-2">{paymentLabels[sale.payment_method] ?? sale.payment_method}</td>
              <td class="px-4 py-2 text-right">{formatPrice(sale.total_excl)}</td>
              <td class="px-4 py-2 text-right">{formatPrice(sale.total_vat)}</td>
              <td class="px-4 py-2 text-right font-medium">{formatPrice(sale.total_incl)}</td>
            </tr>
          {/each}
          {#if sales.length === 0}
            <tr>
              <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">Geen verkopen gevonden.</td>
            </tr>
          {/if}
        </tbody>
        {#if sales.length > 0}
          <tfoot class="bg-muted font-semibold">
            <tr class="border-t-2 border-border">
              <td colspan="5" class="px-4 py-2 text-right">Dagtotaal ({sales.length} verkopen)</td>
              <td class="px-4 py-2 text-right">{formatPrice(dayTotal)}</td>
            </tr>
          </tfoot>
        {/if}
      </table>
    </div>
  </div>

  <!-- Detail panel -->
  {#if selected}
    <div class="w-72 border border-border rounded-lg bg-card p-4 flex flex-col gap-3 shrink-0 h-fit">
      <h3 class="font-semibold">Verkoop #{selected.id}</h3>
      <p class="text-xs text-muted-foreground">{formatDate(selected.created_at)}</p>
      <p class="text-sm">{paymentLabels[selected.payment_method] ?? selected.payment_method}</p>
      {#if selected.note}
        <p class="text-sm text-muted-foreground">{selected.note}</p>
      {/if}

      <div class="border-t border-border pt-3 flex flex-col gap-2">
        {#each lines as line}
          <div class="flex justify-between text-sm">
            <span class="flex-1 truncate">{line.product_name} × {line.quantity}</span>
            <span class="ml-2 font-medium">{formatPrice(line.subtotal)}</span>
          </div>
        {/each}
      </div>

      <div class="border-t border-border pt-3 flex flex-col gap-1 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Excl. BTW</span>
          <span>{formatPrice(selected.total_excl)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">BTW</span>
          <span>{formatPrice(selected.total_vat)}</span>
        </div>
        <div class="flex justify-between font-semibold">
          <span>Totaal</span>
          <span>{formatPrice(selected.total_incl)}</span>
        </div>
      </div>
    </div>
  {/if}
</div>
