<script lang="ts">
  import { onMount } from "svelte";
  import { getAlleInstellingen, setInstelling } from "$lib/db";
  import { relaunch } from "@tauri-apps/plugin-process";
  import { check } from "@tauri-apps/plugin-updater";

  let instellingen: Record<string, string> = {};
  let opgeslagen = false;
  let updateBezig = false;
  let updateStatus = "";

  onMount(async () => {
    instellingen = await getAlleInstellingen();
  });

  async function slaOp() {
    for (const [sleutel, waarde] of Object.entries(instellingen)) {
      await setInstelling(sleutel, waarde);
    }
    opgeslagen = true;
    setTimeout(() => (opgeslagen = false), 2500);
  }

  async function checkUpdate() {
    updateBezig = true;
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
      updateBezig = false;
    }
  }

  const velden = [
    { sleutel: "winkel_naam",   label: "Winkelnaam",     type: "text" },
    { sleutel: "btw_nummer",    label: "BTW-nummer",     type: "text" },
    { sleutel: "standaard_btw", label: "Standaard BTW %",type: "number" },
    { sleutel: "printer_naam",  label: "Printernaam",    type: "text" },
  ];
</script>

<div class="max-w-xl flex flex-col gap-6">
  <h2 class="text-xl font-semibold">Instellingen</h2>

  <!-- Algemeen -->
  <section class="border border-border rounded-lg p-5 flex flex-col gap-4">
    <h3 class="font-medium text-base">Algemeen</h3>
    {#each velden as veld}
      <label class="flex flex-col gap-1 text-sm">
        {veld.label}
        <input
          type={veld.type}
          bind:value={instellingen[veld.sleutel]}
          class="border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
    {/each}
    <div class="flex items-center gap-3 pt-1">
      <button
        class="bg-primary text-primary-foreground rounded-md px-4 py-1.5 text-sm font-medium hover:opacity-90"
        onclick={slaOp}
      >
        Opslaan
      </button>
      {#if opgeslagen}
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
        disabled={updateBezig}
        onclick={checkUpdate}
      >
        {updateBezig ? "Bezig..." : "Controleer op updates"}
      </button>
      {#if updateStatus}
        <span class="text-sm text-muted-foreground">{updateStatus}</span>
      {/if}
    </div>
  </section>

  <!-- Info -->
  <section class="border border-border rounded-lg p-5 text-sm text-muted-foreground flex flex-col gap-1">
    <p><strong>Steek</strong> v0.1.0</p>
    <p>Borduurweelde — Turnhout, België</p>
    <p>Database: <code class="bg-muted px-1 rounded">steek.db</code> (SQLite)</p>
  </section>
</div>
