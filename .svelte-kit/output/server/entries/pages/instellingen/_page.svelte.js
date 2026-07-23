import { a as ensure_array_like, e as escape_html, c as attr } from "../../../chunks/index.js";
import "@tauri-apps/plugin-sql";
import "@tauri-apps/plugin-process";
import "@tauri-apps/plugin-updater";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let settings = {};
    let checkingUpdate = false;
    const fields = [
      { key: "shop_name", label: "Winkelnaam", type: "text" },
      { key: "printer_name", label: "Printernaam", type: "text" }
    ];
    $$renderer2.push(`<div class="max-w-xl flex flex-col gap-6"><h2 class="text-xl font-semibold">Instellingen</h2> <section class="border border-border rounded-lg p-5 flex flex-col gap-4"><h3 class="font-medium text-base">Algemeen</h3> <!--[-->`);
    const each_array = ensure_array_like(fields);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let field = each_array[$$index];
      $$renderer2.push(`<label class="flex flex-col gap-1 text-sm">${escape_html(field.label)} <input${attr("type", field.type)}${attr("value", settings[field.key])} class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"/></label>`);
    }
    $$renderer2.push(`<!--]--> <div class="flex items-center gap-3 pt-1"><button class="bg-primary text-primary-foreground rounded-md px-4 py-1.5 text-sm font-medium hover:opacity-90">Opslaan</button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></section> <section class="border border-border rounded-lg p-5 flex flex-col gap-3"><h3 class="font-medium text-base">Updates</h3> <p class="text-sm text-muted-foreground">Updates worden opgehaald via het publieke Bitbucket-repository.</p> <div class="flex items-center gap-3"><button class="bg-secondary text-secondary-foreground rounded-md px-4 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"${attr("disabled", checkingUpdate, true)}>${escape_html("Controleer op updates")}</button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></section> <section class="border border-border rounded-lg p-5 text-sm text-muted-foreground flex flex-col gap-1"><p><strong>Steek</strong> v0.1.0</p> <p>Borduurweelde — Turnhout, België</p> <p>Database: <code class="bg-muted px-1 rounded">steek.db</code> (SQLite)</p></section></div>`);
  });
}
export {
  _page as default
};
