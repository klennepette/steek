
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/instellingen" | "/kassa" | "/verkopen" | "/voorraad";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/instellingen": Record<string, never>;
			"/kassa": Record<string, never>;
			"/verkopen": Record<string, never>;
			"/voorraad": Record<string, never>
		};
		Pathname(): "/" | "/instellingen" | "/kassa" | "/verkopen" | "/voorraad";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.png" | "/svelte.svg" | "/tauri.svg" | "/vite.svg" | string & {};
	}
}