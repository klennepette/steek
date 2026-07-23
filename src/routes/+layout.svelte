<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";

  const navItems = [
    { href: "/kassa",        label: "Kassa",       icon: "🛒" },
    { href: "/voorraad",     label: "Voorraad",    icon: "📦" },
    { href: "/verkopen",     label: "Verkopen",    icon: "📊" },
    { href: "/instellingen", label: "Instellingen",icon: "⚙️" },
  ];
</script>

<div class="flex h-screen overflow-hidden bg-background">
  <!-- Sidebar -->
  <nav class="flex flex-col w-52 bg-sidebar border-r border-sidebar-border shadow-sm shrink-0">
    <div class="px-4 py-5 border-b border-sidebar-border">
      <h1 class="text-lg font-bold text-sidebar-primary tracking-tight">Steek</h1>
      <p class="text-xs text-muted-foreground">Borduurweelde</p>
    </div>
    <ul class="flex flex-col gap-1 p-3 flex-1">
      {#each navItems as item}
        {@const active = $page.url.pathname.startsWith(item.href)}
        <li>
          <a
            href={item.href}
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
              {active
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
          >
            <span class="text-base">{item.icon}</span>
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
    <div class="px-4 py-3 border-t border-sidebar-border">
      <p class="text-xs text-muted-foreground">v0.1.0</p>
    </div>
  </nav>

  <!-- Main content -->
  <main class="flex-1 overflow-y-auto p-6">
    <slot />
  </main>
</div>
