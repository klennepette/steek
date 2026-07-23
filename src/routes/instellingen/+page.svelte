<script lang="ts">
  import { onMount } from "svelte";
  import { getAllSettings, setSetting } from "$lib/db";
  import { relaunch } from "@tauri-apps/plugin-process";
  import { check } from "@tauri-apps/plugin-updater";

  let settings: Record<string, string> = {};
  let saved = false;
  let checkingUpdate = false;
  let updateStatus = "";

  onMount(async () => {
    settings = await getAllSettings();
  });

  async function save() {
    for (const [key, value] of Object.entries(settings)) {
      await setSetting(key, value);
    }
    saved = true;
    setTimeout(() => (saved = false), 2500);
  }

  async function checkForUpdate() {
    checkingUpdate = true;
    updateStatus = "Bezig met controleren...";
    try {
      const update = await check();
      if (update?.available) {
        updateStatus = `Update beschikbaar: v${update.version}. Bezig met downloaden...`;
        await update.downloadAndInstall();
        updateStatus = "Update geïnstalleerd. De app wordt herstart...";
        setTimeout(() => relaunch(), 2000);
      } else {
        updateStatus = "U hebt de nieuwste versie.";
        setTimeout(() => (updateStatus = ""), 3000);
      }
    } catch (e) {
      updateStatus = `Fout: ${e}`;
    } finally {
      checkingUpdate = false;
    }
  }

  const fields = [
    { key: "shop_name",   label: "Winkelnaam",     type: "text" },
    { key: "vat_number",  label: "BTW-nummer",     type: "text" },
    { key: "default_vat", label: "Standaard BTW %", type: "number" },
    { key: "printer_name",label: "Printernaam",    type: "text" },
  ];
</script>

<div class="max-w-xl flex flex-col gap-6">
  <h2 class="text-xl font-semibold">Instellingen</h2>

  <!-- General -->
  <section class="border border-border rounded-lg p-5 flex flex-col gap-4">
    <h3 class="font-medium text-base">Algemeen</h3>
    {#each fields as field}
      <label class="flex flex-col gap-1 text-sm">
        {field.label}
        <input
          type={field.type}
          bind:value={settings[field.key]}
          class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
    {/each}
    <div class="flex items-center gap-3 pt-1">
      <button
        class="bg-primary text-primary-foreground rounded-md px-4 py-1.5 text-sm font-medium hover:opacity-90"
        onclick={save}
      >
        Opslaan
      </button>
      {#if saved}
        <span class="text-green-700 text-sm">Opgeslagen!</span>
      {/if}
    </div>
  </section>

  <!-- Updates -->
  <section class="border border-border rounded-lg p-5 flex flex-col gap-3">
    <h3 class="font-medium text-base">Updates</h3>
    <p class="text-sm text-muted-foreground">
      Updates worden opgehaald via het publieke Bitbucket-repository.
    </p>
    <div class="flex items-center gap-3">
      <button
        class="bg-secondary text-secondary-foreground rounded-md px-4 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        disabled={checkingUpdate}
        onclick={checkForUpdate}
      >
        {checkingUpdate ? "Bezig..." : "Controleer op updates"}
      </button>
      {#if updateStatus}
        <span class="text-sm text-muted-foreground">{updateStatus}</span>
      {/if}
    </div>
  </section>

  <!-- About -->
  <section class="border border-border rounded-lg p-5 text-sm text-muted-foreground flex flex-col gap-1">
    <p><strong>Steek</strong> v0.1.0</p>
    <p>Borduurweelde — Turnhout, België</p>
    <p>Database: <code class="bg-muted px-1 rounded">steek.db</code> (SQLite)</p>
  </section>
</div>
