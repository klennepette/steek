<script lang="ts">
  import { onMount } from "svelte";
  import {
    getProducts,
    getCategories,
    upsertProduct,
    deactivateProduct,
    type Product,
    type Category,
  } from "$lib/db";

  let products: Product[] = [];
  let categories: Category[] = [];
  let searchTerm = "";
  let selectedCategory = 0;
  let form: Omit<Product, "id" | "category_name"> & { id?: number } = emptyForm();
  let showForm = false;
  let saving = false;

  $: filtered = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(term) || (p.sku ?? "").toLowerCase().includes(term);
    const matchCategory = selectedCategory === 0 || p.category_id === selectedCategory;
    return matchSearch && matchCategory;
  });

  function emptyForm(): Omit<Product, "id" | "category_name"> & { id?: number } {
    return {
      name: "",
      description: null,
      sku: null,
      category_id: null,
      price: 0,
      vat_pct: 6,
      stock: 0,
      active: 1,
    };
  }

  onMount(async () => {
    [products, categories] = await Promise.all([getProducts(false), getCategories()]);
  });

  function newProduct() {
    form = emptyForm();
    showForm = true;
  }

  function editProduct(p: Product) {
    form = { ...p };
    showForm = true;
  }

  async function save() {
    saving = true;
    try {
      await upsertProduct(form);
      products = await getProducts(false);
      showForm = false;
    } finally {
      saving = false;
    }
  }

  async function deactivate(id: number) {
    if (!confirm("Product deactiveren?")) return;
    await deactivateProduct(id);
    products = await getProducts(false);
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" }).format(price);
  }
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center gap-3 flex-wrap">
    <h2 class="text-xl font-semibold">Voorraad</h2>

    <input
      type="search"
      bind:value={searchTerm}
      placeholder="Zoeken..."
      class="border border-input rounded-md px-3 py-1.5 text-sm bg-background w-52 focus:outline-none focus:ring-2 focus:ring-ring"
    />

    <select
      bind:value={selectedCategory}
      class="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value={0}>Alle categorieën</option>
      {#each categories as cat}
        <option value={cat.id}>{cat.name}</option>
      {/each}
    </select>

    <button
      class="ml-auto bg-primary text-primary-foreground rounded-md px-4 py-1.5 text-sm font-medium hover:opacity-90"
      onclick={newProduct}
    >
      + Nieuw product
    </button>
  </div>

  <!-- Table -->
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
        {#each filtered as product}
          <tr class="border-t border-border hover:bg-muted/50 transition-colors {product.active ? '' : 'opacity-50'}">
            <td class="px-4 py-2 font-medium">{product.name}</td>
            <td class="px-4 py-2 text-muted-foreground">{product.sku ?? "—"}</td>
            <td class="px-4 py-2 text-muted-foreground">{product.category_name ?? "—"}</td>
            <td class="px-4 py-2 text-right">{formatPrice(product.price)}</td>
            <td class="px-4 py-2 text-right">{product.vat_pct}%</td>
            <td class="px-4 py-2 text-right {product.stock <= 2 ? 'text-destructive font-semibold' : ''}">{product.stock}</td>
            <td class="px-4 py-2 text-center">{product.active ? "✓" : "✗"}</td>
            <td class="px-4 py-2 text-right">
              <button class="text-xs text-muted-foreground hover:text-foreground mr-2" onclick={() => editProduct(product)}>Bewerk</button>
              {#if product.active}
                <button class="text-xs text-destructive hover:opacity-80" onclick={() => deactivate(product.id)}>Deactiveer</button>
              {/if}
            </td>
          </tr>
        {/each}
        {#if filtered.length === 0}
          <tr>
            <td colspan="8" class="px-4 py-8 text-center text-muted-foreground">Geen producten gevonden.</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>

<!-- Product form modal -->
{#if showForm}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onclick={() => (showForm = false)}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="bg-background border border-border rounded-xl shadow-xl w-full max-w-lg p-6" onclick={(e) => e.stopPropagation()}>
      <h3 class="text-lg font-semibold mb-4">{form.id ? "Product bewerken" : "Nieuw product"}</h3>

      <div class="flex flex-col gap-3 text-sm">
        <label class="flex flex-col gap-1">
          Naam *
          <input bind:value={form.name} class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>

        <label class="flex flex-col gap-1">
          SKU / Artikelnummer
          <input bind:value={form.sku} class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>

        <label class="flex flex-col gap-1">
          Categorie
          <select bind:value={form.category_id} class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value={null}>— geen —</option>
            {#each categories as cat}
              <option value={cat.id}>{cat.name}</option>
            {/each}
          </select>
        </label>

        <div class="grid grid-cols-3 gap-3">
          <label class="flex flex-col gap-1">
            Prijs (incl. BTW) *
            <input type="number" step="0.01" bind:value={form.price} class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <label class="flex flex-col gap-1">
            BTW %
            <input type="number" step="1" bind:value={form.vat_pct} class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <label class="flex flex-col gap-1">
            Voorraad
            <input type="number" step="1" bind:value={form.stock} class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
        </div>

        <label class="flex flex-col gap-1">
          Beschrijving
          <textarea bind:value={form.description} rows="2" class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"></textarea>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" bind:checked={form.active} class="rounded" />
          Actief
        </label>
      </div>

      <div class="flex justify-end gap-3 mt-5">
        <button class="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted" onclick={() => (showForm = false)}>Annuleer</button>
        <button
          class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50"
          disabled={!form.name || saving}
          onclick={save}
        >
          {saving ? "Opslaan..." : "Opslaan"}
        </button>
      </div>
    </div>
  </div>
{/if}
