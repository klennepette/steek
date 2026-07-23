export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","svelte.svg","tauri.svg","vite.svg"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.B5i0Sq0N.js",app:"_app/immutable/entry/app.d_GV7oyW.js",imports:["_app/immutable/entry/start.B5i0Sq0N.js","_app/immutable/chunks/CjLqs119.js","_app/immutable/chunks/D6YVsugE.js","_app/immutable/chunks/DD3P-n30.js","_app/immutable/entry/app.d_GV7oyW.js","_app/immutable/chunks/D6YVsugE.js","_app/immutable/chunks/CLNtX1Hv.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/C21KFVfL.js","_app/immutable/chunks/BUR0yJqe.js","_app/immutable/chunks/Chet2iAz.js","_app/immutable/chunks/DD3P-n30.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/instellingen",
				pattern: /^\/instellingen\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/kassa",
				pattern: /^\/kassa\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/verkopen",
				pattern: /^\/verkopen\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/voorraad",
				pattern: /^\/voorraad\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
