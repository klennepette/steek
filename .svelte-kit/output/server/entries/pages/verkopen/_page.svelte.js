import { c as attr, a as ensure_array_like, d as attr_class, e as escape_html } from "../../../chunks/index.js";
import "@tauri-apps/plugin-sql";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let dayTotal;
    let sales = [];
    let selected = null;
    let from = today();
    let to = today();
    function today() {
      return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    }
    function formatPrice(price) {
      return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" }).format(price);
    }
    function formatDate(d) {
      return new Date(d).toLocaleString("nl-BE");
    }
    const paymentLabels = { cash: "Contant", payconiq: "Payconiq", mixed: "Gemengd" };
    dayTotal = sales.reduce((sum, s) => sum + s.total, 0);
    $$renderer2.push(`<div class="flex gap-6"><div class="flex-1 flex flex-col gap-4"><div class="flex items-center gap-3 flex-wrap"><h2 class="text-xl font-semibold">Verkopen</h2> <div class="flex items-center gap-2 ml-auto"><label for="from" class="text-sm text-muted-foreground">Van</label> <input id="from" type="date"${attr("value", from)} class="border border-input rounded-md px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"/> <label for="to" class="text-sm text-muted-foreground">tot</label> <input id="to" type="date"${attr("value", to)} class="border border-input rounded-md px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"/> <button class="bg-primary text-primary-foreground rounded-md px-3 py-1 text-sm font-medium hover:opacity-90">Toon</button></div></div> <div class="border border-border rounded-lg overflow-hidden"><table class="w-full text-sm"><thead class="bg-muted text-muted-foreground"><tr><th class="text-left px-4 py-2 font-medium">#</th><th class="text-left px-4 py-2 font-medium">Datum &amp; tijd</th><th class="text-left px-4 py-2 font-medium">Betaalmethode</th><th class="text-right px-4 py-2 font-medium">Totaal</th></tr></thead><tbody><!--[-->`);
    const each_array = ensure_array_like(sales);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let sale = each_array[$$index];
      $$renderer2.push(`<tr${attr_class(`border-t border-border hover:bg-muted/50 cursor-pointer transition-colors ${selected?.id === sale.id ? "bg-accent" : ""}`)}><td class="px-4 py-2 text-muted-foreground">${escape_html(sale.id)}</td><td class="px-4 py-2">${escape_html(formatDate(sale.created_at))}</td><td class="px-4 py-2">${escape_html(paymentLabels[sale.payment_method] ?? sale.payment_method)}</td><td class="px-4 py-2 text-right font-medium">${escape_html(formatPrice(sale.total))}</td></tr>`);
    }
    $$renderer2.push(`<!--]-->`);
    if (sales.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="4" class="px-4 py-8 text-center text-muted-foreground">Geen verkopen gevonden.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></tbody>`);
    if (sales.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tfoot class="bg-muted font-semibold"><tr class="border-t-2 border-border"><td colspan="3" class="px-4 py-2 text-right">Dagtotaal (${escape_html(sales.length)} verkopen)</td><td class="px-4 py-2 text-right">${escape_html(formatPrice(dayTotal))}</td></tr></tfoot>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></table></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
