import { g as getContext, a as ensure_array_like, b as store_get, c as attr, d as attr_class, e as escape_html, f as slot, u as unsubscribe_stores } from "../../chunks/index.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "../../chunks/state.svelte.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const navItems = [
      { href: "/kassa", label: "Kassa", icon: "🛒" },
      { href: "/voorraad", label: "Voorraad", icon: "📦" },
      { href: "/verkopen", label: "Verkopen", icon: "📊" },
      { href: "/instellingen", label: "Instellingen", icon: "⚙️" }
    ];
    $$renderer2.push(`<div class="flex h-screen overflow-hidden bg-background"><nav class="flex flex-col w-52 bg-sidebar border-r border-sidebar-border shadow-sm shrink-0"><div class="px-4 py-5 border-b border-sidebar-border"><h1 class="text-lg font-bold text-sidebar-primary tracking-tight">Steek</h1> <p class="text-xs text-muted-foreground">Borduurweelde</p></div> <ul class="flex flex-col gap-1 p-3 flex-1"><!--[-->`);
    const each_array = ensure_array_like(navItems);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let item = each_array[$$index];
      const active = store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith(item.href);
      $$renderer2.push(`<li><a${attr("href", item.href)}${attr_class(`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`)}><span class="text-base">${escape_html(item.icon)}</span> ${escape_html(item.label)}</a></li>`);
    }
    $$renderer2.push(`<!--]--></ul> <div class="px-4 py-3 border-t border-sidebar-border"><p class="text-xs text-muted-foreground">v0.1.0</p></div></nav> <main class="flex-1 overflow-y-auto p-6"><!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--></main></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
