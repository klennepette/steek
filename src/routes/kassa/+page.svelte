<script lang="ts">
  import { onMount } from "svelte";
  import { getProducts, recordSale, type Product } from "$lib/db";

  let products: Product[] = [];
  let searchTerm = "";
  let cartItems: { product: Product; quantity: number }[] = [];
  let paymentMethod = "cash";
  let note = "";
  let loading = false;
  let confirmed = false;

  $: filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  $: total = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  onMount(async () => {
    products = await getProducts(true);
  });

  function addToCart(product: Product) {
    const existing = cartItems.find((item) => item.product.id === product.id);
    if (existing) {
      existing.quantity++;
      cartItems = [...cartItems];
    } else {
      cartItems = [...cartItems, { product, quantity: 1 }];
    }
  }

  function removeFromCart(index: number) {
    cartItems = cartItems.filter((_, i) => i !== index);
  }

  function changeQuantity(index: number, delta: number) {
    cartItems[index].quantity = Math.max(1, cartItems[index].quantity + delta);
    cartItems = [...cartItems];
  }

  async function checkout() {
    if (cartItems.length === 0) return;
    loading = true;
    try {
      await recordSale({
        payment_method: paymentMethod,
        note: note || undefined,
        lines: cartItems.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          vat_pct: item.product.vat_pct,
        })),
      });
      confirmed = true;
      setTimeout(async () => {
        cartItems = [];
        note = "";
        paymentMethod = "cash";
        confirmed = false;
        products = await getProducts(true);
      }, 2000);
    } finally {
      loading = false;
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" }).format(price);
  }
</script>

<div class="flex gap-6 h-full">
  <!-- Product grid -->
  <div class="flex-1 flex flex-col gap-4">
    <div class="flex items-center gap-3">
      <h2 class="text-xl font-semibold">Kassa</h2>
      <input
        type="search"
        bind:value={searchTerm}
        placeholder="Zoek op naam of SKU..."
        class="ml-auto border border-input rounded-md px-3 py-1.5 text-sm bg-background w-64 focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

    <div class="grid grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto">
      {#each filtered as product}
        <button
          class="text-left border border-border rounded-lg p-3 bg-card hover:bg-accent hover:border-ring transition-colors shadow-sm"
          onclick={() => addToCart(product)}
        >
          <div class="font-medium text-sm leading-tight">{product.name}</div>
          {#if product.sku}
            <div class="text-xs text-muted-foreground mt-0.5">{product.sku}</div>
          {/if}
          <div class="mt-2 flex items-center justify-between">
            <span class="font-bold text-primary">{formatPrice(product.price)}</span>
            <span class="text-xs text-muted-foreground">voorraad: {product.stock}</span>
          </div>
        </button>
      {/each}
      {#if filtered.length === 0}
        <p class="col-span-3 text-muted-foreground text-sm py-8 text-center">Geen producten gevonden.</p>
      {/if}
    </div>
  </div>

  <!-- Cart & checkout -->
  <div class="w-80 flex flex-col gap-4 shrink-0">
    <h2 class="text-xl font-semibold">Winkelmandje</h2>

    <div class="flex-1 overflow-y-auto flex flex-col gap-2">
      {#each cartItems as item, i}
        <div class="flex items-center gap-2 border border-border rounded-md p-2 bg-card text-sm">
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate">{item.product.name}</div>
            <div class="text-muted-foreground text-xs">{formatPrice(item.product.price)} / stuk</div>
          </div>
          <div class="flex items-center gap-1">
            <button class="w-6 h-6 rounded border border-border text-center" onclick={() => changeQuantity(i, -1)}>−</button>
            <span class="w-6 text-center">{item.quantity}</span>
            <button class="w-6 h-6 rounded border border-border text-center" onclick={() => changeQuantity(i, 1)}>+</button>
          </div>
          <div class="w-16 text-right font-medium">{formatPrice(item.quantity * item.product.price)}</div>
          <button class="text-muted-foreground hover:text-destructive ml-1" onclick={() => removeFromCart(i)}>✕</button>
        </div>
      {/each}
      {#if cartItems.length === 0}
        <p class="text-muted-foreground text-sm text-center py-8">Mandje is leeg.</p>
      {/if}
    </div>

    <div class="border-t border-border pt-4 flex flex-col gap-3">
      <div class="flex justify-between font-bold text-lg">
        <span>Totaal</span>
        <span>{formatPrice(total)}</span>
      </div>

      <select
        bind:value={paymentMethod}
        class="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="cash">Contant</option>
        <option value="payconiq">Payconiq</option>
        <option value="mixed">Gemengd</option>
      </select>

      <input
        type="text"
        bind:value={note}
        placeholder="Opmerking (optioneel)"
        class="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {#if confirmed}
        <div class="bg-green-50 border border-green-200 text-green-800 rounded-md px-4 py-3 text-center font-medium">
          Verkoop geregistreerd!
        </div>
      {:else}
        <button
          class="bg-primary text-primary-foreground rounded-md px-4 py-3 font-semibold text-sm
            hover:opacity-90 disabled:opacity-50 transition-opacity"
          disabled={cartItems.length === 0 || loading}
          onclick={checkout}
        >
          {loading ? "Bezig..." : "Afrekenen"}
        </button>
      {/if}
    </div>
  </div>
</div>
