import { c as attr, a as ensure_array_like, e as escape_html } from "../../../chunks/index.js";
import "@tauri-apps/plugin-sql";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let total;
    let cartItems = [];
    let paymentMethod = "cash";
    let note = "";
    let loading = false;
    let searchInput = "";
    function formatPrice(price) {
      return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" }).format(price);
    }
    total = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    $$renderer2.push(`<div class="flex gap-6 h-full"><div class="flex-1 flex flex-col gap-4"><h2 class="text-xl font-semibold">Kassa</h2> <div class="relative"><div class="flex items-center gap-2 border-2 border-ring rounded-lg px-3 py-2 bg-background shadow-sm focus-within:border-primary transition-colors"><svg class="w-5 h-5 text-muted-foreground shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"></path></svg> <input${attr("value", searchInput)} type="text" placeholder="Scan barcode of zoek op naam / pakketcode..." class="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground" autocomplete="off" spellcheck="false"/> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <p class="text-xs text-muted-foreground -mt-2">Barcode of pakketcode → direct toevoegen. Naam → kies uit lijst. <kbd class="bg-muted px-1 rounded">Enter</kbd> bij 1 resultaat.</p></div> <div class="w-80 flex flex-col gap-4 shrink-0"><h2 class="text-xl font-semibold">Winkelmandje</h2> <div class="flex-1 overflow-y-auto flex flex-col gap-2 max-h-[calc(100vh-18rem)]"><!--[-->`);
    const each_array_1 = ensure_array_like(cartItems);
    for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
      let item = each_array_1[i];
      $$renderer2.push(`<div class="flex items-center gap-2 border border-border rounded-md p-2 bg-card text-sm"><div class="flex-1 min-w-0"><div class="font-medium truncate">${escape_html(item.product.name)}</div> <div class="text-muted-foreground text-xs flex gap-2"><span>${escape_html(formatPrice(item.product.price))} / stuk</span> `);
      if (item.product.consignation) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="text-amber-600">consignatie</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div> <div class="flex items-center gap-1"><button class="w-6 h-6 rounded border border-border text-center leading-none">−</button> <span class="w-6 text-center">${escape_html(item.quantity)}</span> <button class="w-6 h-6 rounded border border-border text-center leading-none">+</button></div> <div class="w-16 text-right font-medium">${escape_html(formatPrice(item.quantity * item.product.price))}</div> <button class="text-muted-foreground hover:text-destructive ml-1 text-xs">✕</button></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (cartItems.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="text-muted-foreground text-sm text-center py-8">Mandje is leeg.</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="border-t border-border pt-4 flex flex-col gap-3"><div class="flex justify-between font-bold text-lg"><span>Totaal</span> <span>${escape_html(formatPrice(total))}</span></div> `);
    $$renderer2.select(
      {
        value: paymentMethod,
        class: "border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "cash" }, ($$renderer4) => {
          $$renderer4.push(`Contant`);
        });
        $$renderer3.option({ value: "payconiq" }, ($$renderer4) => {
          $$renderer4.push(`Payconiq`);
        });
        $$renderer3.option({ value: "mixed" }, ($$renderer4) => {
          $$renderer4.push(`Gemengd`);
        });
      }
    );
    $$renderer2.push(` <input type="text"${attr("value", note)} placeholder="Opmerking (optioneel)" class="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"/> `);
    {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<button class="bg-primary text-primary-foreground rounded-md px-4 py-3 font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"${attr("disabled", cartItems.length === 0 || loading, true)}>${escape_html("Afrekenen")}</button>`);
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
  });
}
export {
  _page as default
};
