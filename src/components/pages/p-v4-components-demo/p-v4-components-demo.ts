/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/pages/p-v4-components-demo/README.md]]
 * @packageDocumentation
 */

import iStaticPage, { component, prop, field, system } from 'components/super/i-static-page/i-static-page';
import VDOM, * as VDOMAPI from 'components/friends/vdom';
import type { Item } from 'components/traits/i-active-items/interface';

export * from 'components/super/i-static-page/i-static-page';

VDOM.addToPrototype(VDOMAPI);

// eslint-disable-next-line no-console
console.time('Initializing');

let items: Item[] = createItems();

/**
 * Page with component demos.
 * Basically it uses with component tests.
 */
@component({root: true})
export default class pV4ComponentsDemo extends iStaticPage {
	/** {@link iStaticPage.selfDispatching} */
	@prop(Boolean)
	readonly selfDispatchingProp: boolean = false;

	@system((o) => o.sync.link())
	override readonly selfDispatching!: boolean;

	/**
	 * Parameter to test
	 */
	@system()
	rootParam?: number;

	/**
	 * Field for tests purposes
	 */
	@field()
	someField: unknown = 'foo';

	@system()
	items: Item[] = items;

	protected beforeCreate(): void {
		//#unless runtime has storybook
		// eslint-disable-next-line no-console
		console.time('Render');
		//#endunless
	}

	protected updateSomeField(): void {
		this.someField = Math.random();
	}
}


function createItems() {
	return [
		{
			"label": "Props",
			"folded": false,
			"children": [
				{
					"label": "selfDispatchingProp",
					"data": false
				},
				{
					"label": "iPage",
					"folded": true,
					"children": [
						{
							"label": "hideIfOffline",
							"data": false
						},
						{
							"label": "pageTitleProp",
							"data": ""
						},
						{
							"label": "pageDescriptionProp",
							"data": ""
						},
						{
							"label": "stagePageTitles"
						}
					]
				},
				{
					"label": "iData",
					"folded": true,
					"children": [
						{
							"label": "dataProviderProp"
						},
						{
							"label": "dataProviderOptions"
						},
						{
							"label": "request"
						},
						{
							"label": "dbConverter"
						},
						{
							"label": "componentConverter"
						},
						{
							"label": "defaultRequestFilter"
						},
						{
							"label": "suspendedRequestsProp",
							"data": false
						},
						{
							"label": "offlineReload",
							"data": false
						},
						{
							"label": "checkDBEquality",
							"data": true
						}
					]
				},
				{
					"label": "iBlock",
					"folded": true,
					"children": [
						{
							"label": "componentIdProp"
						},
						{
							"label": "globalName"
						},
						{
							"label": "rootTag",
							"data": "div"
						},
						{
							"label": "verbose",
							"data": false
						},
						{
							"label": "stageProp"
						},
						{
							"label": "modsProp"
						},
						{
							"label": "activatedProp",
							"data": true
						},
						{
							"label": "forceActivation",
							"data": false
						},
						{
							"label": "reloadOnActivation",
							"data": true
						},
						{
							"label": "renderOnActivation",
							"data": false
						},
						{
							"label": "dependenciesProp"
						},
						{
							"label": "ssrRendering",
							"data": true
						},
						{
							"label": "wait"
						},
						{
							"label": "remoteProvider",
							"data": false
						},
						{
							"label": "dontWaitRemoteProvidersProp"
						},
						{
							"label": "syncRouterStoreOnInit",
							"data": true
						},
						{
							"label": "routerStateUpdateMethod",
							"data": "push"
						},
						{
							"label": "watchProp"
						},
						{
							"label": "proxyCall",
							"data": false
						},
						{
							"label": "dispatching",
							"data": false
						},
						{
							"label": "p"
						},
						{
							"label": "classes"
						},
						{
							"label": "styles"
						},
						{
							"label": "renderComponentId",
							"data": true
						},
						{
							"label": "getRoot"
						},
						{
							"label": "getParent"
						}
					]
				}
			]
		},
		{
			"label": "Fields",
			"folded": false,
			"children": [
				{
					"label": "someField",
					"data": "foo"
				},
				{
					"label": "iStaticPage",
					"folded": true,
					"children": [
						{
							"label": "isAuth",
							"data": false
						},
						{
							"label": "isOnline",
							"data": true
						},
						{
							"label": "shouldMountTeleports",
							"data": true
						},
						{
							"label": "routeStore"
						},
						{
							"label": "localeStore",
							"data": "en"
						}
					]
				},
				{
					"label": "iData",
					"folded": true,
					"children": [
						{
							"label": "dbStore"
						}
					]
				},
				{
					"label": "iBlock",
					"folded": true,
					"children": [
						{
							"label": "reactiveTmp",
							"data": "{}",
							"children": []
						},
						{
							"label": "rootAttrsStore",
							"data": "{}",
							"children": []
						},
						{
							"label": "reactiveModsStore",
							"data": "{}",
							"children": []
						},
						{
							"label": "componentStatusStore",
							"data": "beforeReady"
						},
						{
							"label": "stageStore"
						}
					]
				}
			]
		},
		{
			"label": "ComputedFields",
			"folded": false,
			"children": [
				{
					"label": "iStaticPage",
					"folded": true,
					"children": [
						{
							"label": "activePage"
						},
						{
							"label": "locale",
							"data": "en"
						}
					]
				},
				{
					"label": "iPage",
					"folded": true,
					"children": [
						{
							"label": "scrollToProxy",
							"data": {
								"declaration": "(...args) => {\n            this.async.setImmediate(() => this.scrollTo(...args), {\n                label: $$.scrollTo\n            });\n        }"
							}
						}
					]
				},
				{
					"label": "iData",
					"folded": true,
					"children": [
						{
							"label": "db"
						}
					]
				},
				{
					"label": "iBlock",
					"folded": true,
					"children": [
						{
							"label": "rootAttrs",
							"data": "{}",
							"children": []
						},
						{
							"label": "sharedMods",
							"data": null
						},
						{
							"label": "m",
							"data": "{\"hidden\":\"false\"}",
							"children": [
								{
									"label": "hidden",
									"data": "false"
								}
							]
						}
					]
				}
			]
		},
		{
			"label": "SystemFields",
			"folded": false,
			"children": [
				{
					"label": "console"
				},
				{
					"label": "rootParam"
				},
				{
					"label": "iStaticPage",
					"folded": true,
					"children": [
						{
							"label": "pageMetaData",
							"data": "PageMetaData"
						},
						{
							"label": "providerDataStore",
							"data": "RestrictedCache"
						},
						{
							"label": "theme",
							"data": null
						},
						{
							"label": "lastOnlineDate"
						},
						{
							"label": "initialRoute"
						},
						{
							"label": "globalEnv",
							"data": "{}",
							"children": []
						},
						{
							"label": "routerStore"
						},
						{
							"label": "rootMods",
							"data": "{\"p-v4-components-demo_active\"...}",
							"children": [
								{
									"label": "p-v4-components-demo_active",
									"data": "{\"name\":\"active\",\"value\":\"true...}",
									"children": [
										{
											"label": "name",
											"data": "active"
										},
										{
											"label": "value",
											"data": "true"
										},
										{
											"label": "class",
											"data": "p-v4-components-demo-active-true"
										},
										{
											"label": "component",
											"data": "Object",
											"children": [
												{
													"label": "$root",
													"data": "*restricted*"
												},
												{
													"label": "$children",
													"data": "*restricted*"
												},
												{
													"label": "rootAttrs",
													"data": "{}",
													"children": []
												},
												{
													"label": "m",
													"data": "{\"hidden\":\"false\"}",
													"children": [
														{
															"label": "hidden",
															"data": "false"
														}
													]
												},
												{
													"label": "scrollToProxy",
													"data": {
														"declaration": "(...args) => {\n            this.async.setImmediate(() => this.scrollTo(...args), {\n                label: $$.scrollTo\n            });\n        }"
													}
												},
												{
													"label": "locale",
													"data": "en"
												},
												{
													"label": "isFunctional",
													"data": false
												},
												{
													"label": "self",
													"data": "*restricted*"
												},
												{
													"label": "r",
													"data": "*restricted*"
												},
												{
													"label": "i18n",
													"data": {
														"declaration": "function i18n(value, params) {\n        var _a, _b;\n        if (Object.isArray(value) && value.length !== 1) {\n            throw new SyntaxError('Using i18n with template literals is allowed only without variables');\n        }\n        const key = Object.isString(value) ? value : value[0], correctKeyset = keysetNames.find((keysetName) => { var _a, _b; return (_b = (_a = lang__WEBPACK_IMPORTED_MODULE_2__[\"default\"][resolvedLocale]) === null || _a === void 0 ? void 0 : _a[keysetName]) === null || _b === void 0 ? void 0 : _b[key]; }), translateValue = (_b = (_a = lang__WEBPACK_IMPORTED_MODULE_2__[\"default\"][resolvedLocale]) === null || _a === void 0 ? void 0 : _a[correctKeyset !== null && correctKeyset !== void 0 ? correctKeyset : '']) === null || _b === void 0 ? void 0 : _b[key];\n        if (translateValue != null && translateValue !== '') {\n            return resolveTemplate(translateValue, params);\n        }\n        logger.error('Translation for the given key is not found', `Key: ${key}, KeysetNames: ${keysetNames.join(', ')}, LocaleName: ${resolvedLocale}`);\n        return resolveTemplate(key, params);\n    }"
													}
												},
												{
													"label": "t",
													"data": {
														"declaration": "function i18n(value, params) {\n        var _a, _b;\n        if (Object.isArray(value) && value.length !== 1) {\n            throw new SyntaxError('Using i18n with template literals is allowed only without variables');\n        }\n        const key = Object.isString(value) ? value : value[0], correctKeyset = keysetNames.find((keysetName) => { var _a, _b; return (_b = (_a = lang__WEBPACK_IMPORTED_MODULE_2__[\"default\"][resolvedLocale]) === null || _a === void 0 ? void 0 : _a[keysetName]) === null || _b === void 0 ? void 0 : _b[key]; }), translateValue = (_b = (_a = lang__WEBPACK_IMPORTED_MODULE_2__[\"default\"][resolvedLocale]) === null || _a === void 0 ? void 0 : _a[correctKeyset !== null && correctKeyset !== void 0 ? correctKeyset : '']) === null || _b === void 0 ? void 0 : _b[key];\n        if (translateValue != null && translateValue !== '') {\n            return resolveTemplate(translateValue, params);\n        }\n        logger.error('Translation for the given key is not found', `Key: ${key}, KeysetNames: ${keysetNames.join(', ')}, LocaleName: ${resolvedLocale}`);\n        return resolveTemplate(key, params);\n    }"
													}
												},
												{
													"label": "randomGenerator",
													"data": "Xor128"
												},
												{
													"label": "remoteState",
													"data": "{\"isAuth\":false,\"isOnline\":tru...}",
													"children": [
														{
															"label": "isAuth",
															"data": false
														},
														{
															"label": "isOnline",
															"data": true
														},
														{
															"label": "globalEnv",
															"data": "{}",
															"children": []
														}
													]
												},
												{
													"label": "componentStatus",
													"data": "ready"
												},
												{
													"label": "isReady",
													"data": true
												},
												{
													"label": "stageGroup",
													"data": "stage.undefined"
												},
												{
													"label": "isRelatedToSSR",
													"data": false
												},
												{
													"label": "hook",
													"data": "mounted"
												},
												{
													"label": "router",
													"data": "*restricted*"
												},
												{
													"label": "pageTitle",
													"data": "Default app"
												},
												{
													"label": "$fields",
													"data": "*restricted*"
												},
												{
													"label": "$watch",
													"data": "*restricted*"
												},
												{
													"label": "$set",
													"data": "*restricted*"
												},
												{
													"label": "$delete",
													"data": "*restricted*"
												},
												{
													"label": "$systemFields",
													"data": "*restricted*"
												},
												{
													"label": "pageTitleStore",
													"data": ""
												}
											]
										}
									]
								},
								{
									"label": "p-v4-components-demo_online",
									"data": "{\"name\":\"online\",\"value\":\"true...}",
									"children": [
										{
											"label": "name",
											"data": "online"
										},
										{
											"label": "value",
											"data": "true"
										},
										{
											"label": "class",
											"data": "p-v4-components-demo-online-true"
										},
										{
											"label": "component",
											"data": "Object",
											"children": [
												{
													"label": "$root",
													"data": "*restricted*"
												},
												{
													"label": "$children",
													"data": "*restricted*"
												},
												{
													"label": "rootAttrs",
													"data": "{}",
													"children": []
												},
												{
													"label": "m",
													"data": "{\"hidden\":\"false\"}",
													"children": [
														{
															"label": "hidden",
															"data": "false"
														}
													]
												},
												{
													"label": "scrollToProxy",
													"data": {
														"declaration": "(...args) => {\n            this.async.setImmediate(() => this.scrollTo(...args), {\n                label: $$.scrollTo\n            });\n        }"
													}
												},
												{
													"label": "locale",
													"data": "en"
												},
												{
													"label": "isFunctional",
													"data": false
												},
												{
													"label": "self",
													"data": "*restricted*"
												},
												{
													"label": "r",
													"data": "*restricted*"
												},
												{
													"label": "i18n",
													"data": {
														"declaration": "function i18n(value, params) {\n        var _a, _b;\n        if (Object.isArray(value) && value.length !== 1) {\n            throw new SyntaxError('Using i18n with template literals is allowed only without variables');\n        }\n        const key = Object.isString(value) ? value : value[0], correctKeyset = keysetNames.find((keysetName) => { var _a, _b; return (_b = (_a = lang__WEBPACK_IMPORTED_MODULE_2__[\"default\"][resolvedLocale]) === null || _a === void 0 ? void 0 : _a[keysetName]) === null || _b === void 0 ? void 0 : _b[key]; }), translateValue = (_b = (_a = lang__WEBPACK_IMPORTED_MODULE_2__[\"default\"][resolvedLocale]) === null || _a === void 0 ? void 0 : _a[correctKeyset !== null && correctKeyset !== void 0 ? correctKeyset : '']) === null || _b === void 0 ? void 0 : _b[key];\n        if (translateValue != null && translateValue !== '') {\n            return resolveTemplate(translateValue, params);\n        }\n        logger.error('Translation for the given key is not found', `Key: ${key}, KeysetNames: ${keysetNames.join(', ')}, LocaleName: ${resolvedLocale}`);\n        return resolveTemplate(key, params);\n    }"
													}
												},
												{
													"label": "t",
													"data": {
														"declaration": "function i18n(value, params) {\n        var _a, _b;\n        if (Object.isArray(value) && value.length !== 1) {\n            throw new SyntaxError('Using i18n with template literals is allowed only without variables');\n        }\n        const key = Object.isString(value) ? value : value[0], correctKeyset = keysetNames.find((keysetName) => { var _a, _b; return (_b = (_a = lang__WEBPACK_IMPORTED_MODULE_2__[\"default\"][resolvedLocale]) === null || _a === void 0 ? void 0 : _a[keysetName]) === null || _b === void 0 ? void 0 : _b[key]; }), translateValue = (_b = (_a = lang__WEBPACK_IMPORTED_MODULE_2__[\"default\"][resolvedLocale]) === null || _a === void 0 ? void 0 : _a[correctKeyset !== null && correctKeyset !== void 0 ? correctKeyset : '']) === null || _b === void 0 ? void 0 : _b[key];\n        if (translateValue != null && translateValue !== '') {\n            return resolveTemplate(translateValue, params);\n        }\n        logger.error('Translation for the given key is not found', `Key: ${key}, KeysetNames: ${keysetNames.join(', ')}, LocaleName: ${resolvedLocale}`);\n        return resolveTemplate(key, params);\n    }"
													}
												},
												{
													"label": "randomGenerator",
													"data": "Xor128"
												},
												{
													"label": "remoteState",
													"data": "{\"isAuth\":false,\"isOnline\":tru...}",
													"children": [
														{
															"label": "isAuth",
															"data": false
														},
														{
															"label": "isOnline",
															"data": true
														},
														{
															"label": "globalEnv",
															"data": "{}",
															"children": []
														}
													]
												},
												{
													"label": "componentStatus",
													"data": "ready"
												},
												{
													"label": "isReady",
													"data": true
												},
												{
													"label": "stageGroup",
													"data": "stage.undefined"
												},
												{
													"label": "isRelatedToSSR",
													"data": false
												},
												{
													"label": "hook",
													"data": "mounted"
												},
												{
													"label": "router",
													"data": "*restricted*"
												},
												{
													"label": "pageTitle",
													"data": "Default app"
												},
												{
													"label": "$fields",
													"data": "*restricted*"
												},
												{
													"label": "$watch",
													"data": "*restricted*"
												},
												{
													"label": "$set",
													"data": "*restricted*"
												},
												{
													"label": "$delete",
													"data": "*restricted*"
												},
												{
													"label": "$systemFields",
													"data": "*restricted*"
												},
												{
													"label": "pageTitleStore",
													"data": ""
												}
											]
										}
									]
								}
							]
						}
					]
				},
				{
					"label": "iPage",
					"folded": true,
					"children": [
						{
							"label": "pageTitleStore",
							"data": ""
						},
						{
							"label": "pageDescriptionStore",
							"data": ""
						}
					]
				},
				{
					"label": "iData",
					"folded": true,
					"children": [
						{
							"label": "dataProvider"
						},
						{
							"label": "dbConverters",
							"data": "[]",
							"children": []
						},
						{
							"label": "componentConverters",
							"data": "[]",
							"children": []
						},
						{
							"label": "suspendedRequests",
							"data": false
						},
						{
							"label": "requestParams",
							"data": "{\"get\":{}}",
							"children": [
								{
									"label": "get",
									"data": "{}",
									"children": []
								}
							]
						}
					]
				},
				{
					"label": "iBlock",
					"folded": true,
					"children": [
						{
							"label": "provide",
							"data": "Provide"
						},
						{
							"label": "infoRender",
							"data": "InfoRender"
						},
						{
							"label": "field",
							"data": "Field"
						},
						{
							"label": "analytics",
							"data": "Analytics"
						},
						{
							"label": "sync",
							"data": "Sync"
						},
						{
							"label": "asyncRender",
							"data": "AsyncRender"
						},
						{
							"label": "vdom",
							"data": "VDOM"
						},
						{
							"label": "lfc",
							"data": "Lfc"
						},
						{
							"label": "daemons",
							"data": "Daemons"
						},
						{
							"label": "block",
							"data": "Block"
						},
						{
							"label": "dom",
							"data": "DOM"
						},
						{
							"label": "storage",
							"data": "Storage"
						},
						{
							"label": "state",
							"data": "State"
						},
						{
							"label": "moduleLoader",
							"data": "ModuleLoader"
						},
						{
							"label": "ifOnceStore",
							"data": "{}",
							"children": []
						},
						{
							"label": "opt",
							"data": "Opt"
						},
						{
							"label": "browser",
							"data": "{\"is\":{\"Chrome\":[\"Chrome\",[116...}",
							"children": [
								{
									"label": "is",
									"data": "{\"Chrome\":[\"Chrome\",[116,0,584...}",
									"children": [
										{
											"label": "Chrome",
											"data": "Array(2)",
											"children": [
												{
													"label": "0",
													"data": "Chrome"
												},
												{
													"label": "1",
													"data": "Array(4)",
													"children": [
														{
															"label": "0",
															"data": 116
														},
														{
															"label": "1",
															"data": 0
														},
														{
															"label": "2",
															"data": 5845
														},
														{
															"label": "3",
															"data": 2319
														}
													]
												}
											]
										},
										{
											"label": "Firefox",
											"data": false
										},
										{
											"label": "Android",
											"data": false
										},
										{
											"label": "BlackBerry",
											"data": false
										},
										{
											"label": "iOS",
											"data": false
										},
										{
											"label": "OperaMini",
											"data": false
										},
										{
											"label": "WindowsMobile",
											"data": false
										},
										{
											"label": "Safari",
											"data": false
										},
										{
											"label": "mobile",
											"data": false
										}
									]
								},
								{
									"label": "match",
									"data": {
										"declaration": "function match(pattern) {\n    var _a, _b;\n    if (typeof navigator === 'undefined') {\n        return false;\n    }\n    const { userAgent } = navigator;\n    let name, version;\n    if (Object.isFunction(pattern)) {\n        [name, version] = (_a = pattern(userAgent)) !== null && _a !== void 0 ? _a : [];\n    }\n    else {\n        const rgxp = Object.isString(pattern) ? new RegExp(`(${pattern})(?:[ \\\\/-]([0-9._]*))?`, 'i') : pattern;\n        [, name, version] = (_b = rgxp.exec(userAgent)) !== null && _b !== void 0 ? _b : [];\n    }\n    const versionParts = version != null && version.length !== 0 ?\n        version.split(/[._]/).map(map) :\n        null;\n    if (name != null) {\n        return [name, versionParts];\n    }\n    return false;\n    function map(el) {\n        const v = parseInt(el, 10);\n        return Object.isTruly(v) ? v : 0;\n    }\n}"
									}
								},
								{
									"label": "test",
									"data": {
										"declaration": "function test(platform, operation, version) {\n    const val = core_browser_const__WEBPACK_IMPORTED_MODULE_1__.is[platform];\n    if (val === false) {\n        return false;\n    }\n    if (operation == null || version == null) {\n        return true;\n    }\n    if (val[1] == null) {\n        return false;\n    }\n    return (0,core_semver__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(val[1].join('.'), version, operation);\n}"
									}
								}
							]
						},
						{
							"label": "presets",
							"data": "{\"loopback\":{}}",
							"children": [
								{
									"label": "loopback",
									"data": "{}",
									"children": []
								}
							]
						},
						{
							"label": "h",
							"data": "{\"NBSP\":\" \"}",
							"children": [
								{
									"label": "NBSP",
									"data": " "
								}
							]
						},
						{
							"label": "location",
							"data": "Location"
						},
						{
							"label": "global",
							"data": "Window"
						},
						{
							"label": "componentId",
							"data": "u11b99ae2e0e3b2"
						},
						{
							"label": "isActivated",
							"data": true
						},
						{
							"label": "isVirtualTpl",
							"data": false
						},
						{
							"label": "beforeReadyListeners",
							"data": 0
						},
						{
							"label": "blockReadyListeners",
							"data": "[]",
							"children": []
						},
						{
							"label": "tmp",
							"data": "{}",
							"children": []
						},
						{
							"label": "watchCache",
							"data": "{}",
							"children": []
						},
						{
							"label": "componentI18nKeysets",
							"data": "Array(5)",
							"children": [
								{
									"label": "0",
									"data": "p-v4-components-demo"
								},
								{
									"label": "1",
									"data": "i-static-page"
								},
								{
									"label": "2",
									"data": "i-page"
								},
								{
									"label": "3",
									"data": "i-data"
								},
								{
									"label": "4",
									"data": "i-block"
								}
							]
						},
						{
							"label": "selfEmitter",
							"data": "{}",
							"children": []
						},
						{
							"label": "localEmitter",
							"data": "EventEmitter"
						},
						{
							"label": "parentEmitter",
							"data": "{}",
							"children": []
						},
						{
							"label": "rootEmitter",
							"data": "{}",
							"children": []
						},
						{
							"label": "globalEmitter",
							"data": "EventEmitter"
						},
						{
							"label": "mods",
							"data": "{\"hidden\":\"false\"}",
							"children": [
								{
									"label": "hidden",
									"data": "false"
								}
							]
						},
						{
							"label": "dependencies",
							"data": "[]",
							"children": []
						},
						{
							"label": "isReadyOnce",
							"data": true
						},
						{
							"label": "shadowComponentStatusStore",
							"data": "ready"
						},
						{
							"label": "dontWaitRemoteProviders",
							"data": false
						},
						{
							"label": "selfDispatching",
							"data": false
						}
					]
				}
			]
		}
	]
}
