<script lang="ts">
  import { onMount, tick } from "svelte";
  import { searchProducts, recordSale, type Product } from "$lib/db";

  // ── Cart state ───────────────────────────────────────────────────────────────

  let cartItems: { product: Product; quantity: number }[] = [];
  let paymentMethod = "cash";
  let note = "";
  let loading = false;
  let confirmed = false;

  // ── Search state ─────────────────────────────────────────────────────────────

  let searchInput = "";
  let searchResults: Product[] = [];
  let searching = false;
  let showDropdown = false;
  let inputEl: HTMLInputElement;

  // Debounce timer handle
  let debounceTimer: ReturnType<typeof setTimeout>;

  $: total = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  onMount(() => {
    inputEl?.focus();
  });

  // ── Search logic ─────────────────────────────────────────────────────────────

  async function onSearchInput() {
    clearTimeout(debounceTimer);
    const query = searchInput.trim();

    if (!query) {
      searchResults = [];
      showDropdown = false;
      return;
    }

    debounceTimer = setTimeout(async () => {
      searching = true;
      try {
        const results = await searchProducts(query);

        // Exact barcode or packetcode match → add immediately, clear input
        const exact = results.find(
          (p) => p.barcode === query || p.packetcode === query
        );
        if (exact) {
          addToCart(exact);
          searchInput = "";
          searchResults = [];
          showDropdown = false;
          return;
        }

        searchResults = results;
        showDropdown = results.length > 0;
      } finally {
        searching = false;
      }
    }, 120); // short debounce — fast enough for scanner, avoids DB spam on typing
  }

  function onSearchKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      searchInput = "";
      searchResults = [];
      showDropdown = false;
    }
    // Enter with a single result picks it
    if (e.key === "Enter" && searchResults.length === 1) {
      addToCart(searchResults[0]);
      searchInput = "";
      searchResults = [];
      showDropdown = false;
    }
  }

  function pickFromDropdown(product: Product) {
    addToCart(product);
    searchInput = "";
    searchResults = [];
    showDropdown = false;
    inputEl?.focus();
  }

  // ── Cart logic ────────────────────────────────────────────────────────────────

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
        await tick();
        inputEl?.focus();
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
  <!-- Left: scanner input + results -->
  <div class="flex-1 flex flex-col gap-4">
    <h2 class="text-xl font-semibold">Kassa</h2>

    <!-- Scanner / search bar -->
    <div class="relative">
      <div class="flex items-center gap-2 border-2 border-ring rounded-lg px-3 py-2 bg-background shadow-sm focus-within:border-primary transition-colors">
        <!-- Scanner icon -->
        <svg class="w-5 h-5 text-muted-foreground shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
        </svg>
        <input
          bind:this={inputEl}
          bind:value={searchInput}
          oninput={onSearchInput}
          onkeydown={onSearchKeydown}
          onblur={() => setTimeout(() => (showDropdown = false), 150)}
          onfocus={() => { if (searchResults.length > 0) showDropdown = true; }}
          type="text"
          placeholder="Scan barcode of zoek op naam / pakketcode..."
          class="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
          autocomplete="off"
          spellcheck="false"
        />
        {#if searching}
          <span class="text-xs text-muted-foreground animate-pulse">zoeken...</span>
        {/if}
        {#if searchInput}
          <button class="text-muted-foreground hover:text-foreground" onclick={() => { searchInput = ""; searchResults = []; showDropdown = false; inputEl?.focus(); }}>✕</button>
        {/if}
      </div>

      <!-- Dropdown results -->
      {#if showDropdown}
        <ul class="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-20 max-h-72 overflow-y-auto">
          {#each searchResults as product}
            <li>
              <button
                class="w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-center gap-4 border-b border-border last:border-0"
                onclick={() => pickFromDropdown(product)}
              >
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm">{product.name}</div>
                  <div class="text-xs text-muted-foreground mt-0.5 flex gap-3">
                    {#if product.barcode}<span>Barcode: <span class="font-mono">{product.barcode}</span></span>{/if}
                    {#if product.packetcode}<span>Pakketcode: <span class="font-mono">{product.packetcode}</span></span>{/if}
                    {#if product.category_name}<span>{product.category_name}</span>{/if}
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <div class="font-bold text-primary">{formatPrice(product.price)}</div>
                  <div class="text-xs text-muted-foreground">voorraad: {product.stock}</div>
                </div>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- Hint -->
    <p class="text-xs text-muted-foreground -mt-2">
      Barcode of pakketcode → direct toevoegen. Naam → kies uit lijst. <kbd class="bg-muted px-1 rounded">Enter</kbd> bij 1 resultaat.
    </p>
  </div>

  <!-- Right: Cart & checkout -->
  <div class="w-80 flex flex-col gap-4 shrink-0">
    <h2 class="text-xl font-semibold">Winkelmandje</h2>

    <div class="flex-1 overflow-y-auto flex flex-col gap-2 max-h-[calc(100vh-18rem)]">
      {#each cartItems as item, i}
        <div class="flex items-center gap-2 border border-border rounded-md p-2 bg-card text-sm">
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate">{item.product.name}</div>
            <div class="text-muted-foreground text-xs flex gap-2">
              <span>{formatPrice(item.product.price)} / stuk</span>
              {#if item.product.consignation}<span class="text-amber-600">consignatie</span>{/if}
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button class="w-6 h-6 rounded border border-border text-center leading-none" onclick={() => changeQuantity(i, -1)}>−</button>
            <span class="w-6 text-center">{item.quantity}</span>
            <button class="w-6 h-6 rounded border border-border text-center leading-none" onclick={() => changeQuantity(i, 1)}>+</button>
          </div>
          <div class="w-16 text-right font-medium">{formatPrice(item.quantity * item.product.price)}</div>
          <button class="text-muted-foreground hover:text-destructive ml-1 text-xs" onclick={() => removeFromCart(i)}>✕</button>
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
