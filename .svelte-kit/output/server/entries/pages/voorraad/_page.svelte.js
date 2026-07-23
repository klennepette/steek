import { c as attr, a as ensure_array_like, d as attr_class, e as escape_html } from "../../../chunks/index.js";
import "@tauri-apps/plugin-sql";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let filtered;
    let products = [];
    let searchTerm = "";
    function formatPrice(price) {
      return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" }).format(price);
    }
    filtered = products.filter((p) => {
      const term = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(term) || (p.barcode ?? "").toLowerCase().includes(term) || (p.packetcode ?? "").toLowerCase().includes(term);
    });
    $$renderer2.push(`<div class="flex flex-col gap-4"><div class="flex items-center gap-3 flex-wrap"><h2 class="text-xl font-semibold">Voorraad</h2> <input type="search"${attr("value", searchTerm)} placeholder="Zoeken op naam, barcode of pakketcode..." class="border border-input rounded-md px-3 py-1.5 text-sm bg-background w-72 focus:outline-none focus:ring-2 focus:ring-ring"/> <button class="ml-auto bg-primary text-primary-foreground rounded-md px-4 py-1.5 text-sm font-medium hover:opacity-90">+ Nieuw product</button></div> <div class="border border-border rounded-lg overflow-hidden"><table class="w-full text-sm"><thead class="bg-muted text-muted-foreground"><tr><th class="text-left px-4 py-2 font-medium">Naam</th><th class="text-left px-4 py-2 font-medium">Barcode</th><th class="text-left px-4 py-2 font-medium">Pakketcode</th><th class="text-right px-4 py-2 font-medium">Prijs</th><th class="text-right px-4 py-2 font-medium">Voorraad</th><th class="text-center px-4 py-2 font-medium">Consig.</th><th class="text-center px-4 py-2 font-medium">Actief</th><th class="px-4 py-2"></th></tr></thead><tbody><!--[-->`);
    const each_array = ensure_array_like(filtered);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let product = each_array[$$index];
      $$renderer2.push(`<tr${attr_class(`border-t border-border hover:bg-muted/50 transition-colors ${product.active ? "" : "opacity-50"}`)}><td class="px-4 py-2 font-medium">${escape_html(product.name)}</td><td class="px-4 py-2 text-muted-foreground font-mono text-xs">${escape_html(product.barcode ?? "—")}</td><td class="px-4 py-2 text-muted-foreground font-mono text-xs">${escape_html(product.packetcode ?? "—")}</td><td class="px-4 py-2 text-right">${escape_html(formatPrice(product.price))}</td><td${attr_class(`px-4 py-2 text-right ${product.stock <= 2 ? "text-destructive font-semibold" : ""}`)}>${escape_html(product.stock)}</td><td class="px-4 py-2 text-center">${escape_html(product.consignation ? "✓" : "—")}</td><td class="px-4 py-2 text-center">${escape_html(product.active ? "✓" : "✗")}</td><td class="px-4 py-2 text-right whitespace-nowrap"><button class="text-xs text-muted-foreground hover:text-foreground mr-2">Bewerk</button> `);
      if (product.active) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<button class="text-xs text-destructive hover:opacity-80">Deactiveer</button>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></td></tr>`);
    }
    $$renderer2.push(`<!--]-->`);
    if (filtered.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="8" class="px-4 py-8 text-center text-muted-foreground">Geen producten gevonden.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
