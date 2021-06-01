'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('@v4fire/core/config/default'),
	pzlr = require('@pzlr/build-core');

const
	fs = require('fs'),
	path = require('upath');

const
	camelize = require('camelize'),
	o = require('uniconf/options').option;

const
	{nanoid} = require('nanoid');

module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
	__proto__: config,

	/** @inheritDoc */
	build: {
		/**
		 * List of entries to build.
		 * The entries are taken from the "core/entries" directory.
		 *
		 * You can use this parameter when you develop some particular chunk and don't want to build the whole application,
		 * because it may slow down the build time.
		 *
		 * @cli entries
		 * @env ENTRIES
		 *
		 * @type {string}
		 *
		 * @example
		 * ```bash
		 * # Build only entries foo and bar
		 * npx webpack --entries foo,bar
		 * ```
		 */
		entries: o('entries', {
			env: true,
			coerce: (v) => v ? v.split(',') : []
		}),

		/**
		 * Every client build starts with calculating the project graph.
		 * The graph contains information about entry points, dependencies, and other stuff.
		 * This information is used by WebPack to deduplicate code blocks and optimize building,
		 * but the process of graph calculation may take time.
		 *
		 * This option enables that the graph can be taken from the previous build if it exists.
		 * Mind, the invalid graph can produce to the broken build of the application.
		 *
		 * @cli build-graph-from-cache
		 * @env BUILD_GRAPH_FROM_CACHE
		 *
		 * @type {boolean}
		 * @default `false`
		 */
		buildGraphFromCache: o('build-graph-from-cache', {
			env: true,
			type: 'boolean'
		}),

		/**
		 * The number of available CPUs that can be used with application building
		 *
		 * @cli processes
		 * @env PROCESSES
		 *
		 * @type {number}
		 * @default `require('os').cpus().length - 1`
		 */
		processes: o('processes', {
			env: true,
			short: 'p',
			type: 'number',
			default: require('os').cpus().length - 1
		}),

		/**
		 * Returns a list of components to build within the demo page (pages/p-v4-components-demo).
		 * The list contains objects with default properties for each specified component.
		 *
		 * ```js
		 * [
		 *   {name: 'b-button', attrs: {':theme': "'demo'"}, content: {default: 'Hello world'}},
		 *   {name: 'b-select', attrs: {':theme': "'demo'"}}
		 * ]
		 * ```
		 *
		 * To specify the default properties for a component demo, you should create a "demo.js" file and
		 * place it with the component directory, for instance, "b-button/demo.js":
		 *
		 * ```js
		 * module.exports = [
		 *   {
		 *     // Within "attrs" you can specify attributes that will be passed to the component
		 *     attrs: {':theme': "'demo'"},
		 *
		 *     // Within "content" you can specify slots that will be passed to the component
		 *     content: {default: 'Hello world'}
		 *   }
		 * ];
		 * ```
		 *
		 * Every object from the list represents one instance of a component,
		 * i.e. to create two or more examples of a component with different attributes just add more objects to the list.
		 *
		 * ```js
		 * module.exports = [
		 *   {
		 *     attrs: {':theme': "'demo'"},
		 *     content: {default: 'Hello world'}
		 *   },
		 *
		 *   {
		 *     attrs: {':theme': "'demo2'"}
		 *   }
		 * ];
		 * ```
		 *
		 * @cli components
		 * @env COMPONENTS
		 *
		 * @type {!Array<{name: string, args?: Object, content?: Object}>}
		 *
		 * @example
		 * ```bash
		 * # Build the demo page with b-button and b-select
		 * npx webpack --components b-button,b-select
		 * ```
		 */
		components: o('components', {
			env: true,
			coerce: (v) => {
				const
					args = require('arg')({'--suit': String}, {permissive: true});

				try {
					const
						obj = JSON.parse(v);

					if (Object.isArray(obj)) {
						return obj;
					}

					return [Object.isObject(obj) ? obj : {name: obj}];

				} catch {}

				if (!v) {
					return [];
				}

				return v
					.split(',')
					.flatMap((name) => {
						try {
							const
								demo = require(pzlr.resolve.blockSync(`${name}/demo.js`)),
								suit = camelize(args['--suit'] || 'demo');

							const
								wrap = (d) => [].concat((d || []).map((p) => ({name, ...p})));

							if (Object.isObject(demo)) {
								return wrap(demo[suit]);
							}

							return wrap(demo);

						} catch {}

						return {name};
					});
			}
		}),

		/**
		 * A name of the component to build demo examples or tests
		 */
		demoPage: o('demo-page', {
			env: true,
			default: 'p-v4-components-demo'
		}),

		/**
		 * Enables the special kind of a demo page to build with
		 * the feature of component inspection by using the "bV4ComponentDemo" component.
		 *
		 * The inspection mode allows us to see all component modifiers/props and dynamically change it.
		 *
		 * @cli inspect-components
		 * @env INSPECT_COMPONENTS
		 *
		 * @type {boolean}
		 */
		inspectComponents: o('inspect-components', {
			env: true,
			type: 'boolean'
		}),

		/**
		 * This option is used with component test files.
		 *
		 * For instance, you have the "b-button/test.js" file that contains tests for the component.
		 * You may export one function to call to run tests, or you can export an object where each key
		 * exports a function to test the component with different attributes.
		 * The value of "suit" refers to the key of the test function to invoke.
		 *
		 * See the "/test" folder for more details.
		 *
		 * @cli suit
		 * @env SUIT
		 *
		 * @type {string}
		 */
		suit: o('suit', {
			env: true,
			default: 'demo'
		})
	},

	/**
	 * Name of the used MVVM library, like Vue or React
	 *
	 * @cli engine
	 * @env ENGINE
	 */
	engine() {
		return o('engine', {
			env: true,
			default: 'vue',
			validate(v) {
				return Boolean({
					vue: true,
					zero: true
				}[v]);
			}
		});
	},

	/**
	 * WebPack configuration
	 */
	webpack: {
		/**
		 * Value of `mode`
		 *
		 * @cli mode
		 * @env MODE
		 *
		 * @returns {string}
		 */
		mode() {
			return o('mode', {
				env: true,
				default: IS_PROD ? 'production' : 'development'
			});
		},

		/**
		 * Value of `cache.type`
		 *
		 * @cli cache-type
		 * @env CACHE_TYPE
		 *
		 * @returns {string}
		 */
		cacheType() {
			return o('cache-type', {
				env: true,
				default: 'memory'
			});
		},

		/**
		 * Value of `target`
		 *
		 * @cli target
		 * @env TARGET
		 *
		 * @returns {?string}
		 */
		target() {
			return o('target', {
				env: true,
				default: /ES[35]$/.test(this.config.es()) ? 'browserslist:ie 11' : undefined
			});
		},

		/**
		 * Value of `devtool`
		 *
		 * @cli devtool
		 * @env DEVTOOL
		 *
		 * @returns {?string}
		 */
		devtool() {
			return o('devtool', {
				env: true
			});
		},

		/**
		 * Returns the default hash algorithm to use
		 * @returns {?string}
		 */
		hashFunction() {
			return this.mode() !== 'production' || this.fatHTML() ? undefined : this.config.build.hashAlg;
		},

		/**
		 * Returns true if all assets from the build have to inline within HTML files
		 *
		 * @cli fat-html
		 * @env FAT_HTML
		 *
		 * @returns {boolean}
		 */
		fatHTML() {
			return o('fat-html', {
				env: true,
				type: 'boolean',
				default: false
			});
		},

		/**
		 * Some webpack options to optimize build
		 */
		optimize: {
			/**
			 * The minimum size of a chunk file in bytes that can be separated into a single file
			 *
			 * @cli optimize-min-chunk-size
			 * @env OPTIMIZE_MIN_CHUNK_SIZE
			 *
			 * @returns {(number|undefined)}
			 */
			minChunkSize: o('optimize-min-chunk-size', {
				env: true,
				type: 'number',
				default: 10 * 1024
			}),

			/**
			 * Returns parameters for `optimization.splitChunks`
			 * @returns {!Object}
			 */
			splitChunks() {
				return {};
			},

			/**
			 * Returns the maximum size of a file in bytes that can be inline as base64
			 *
			 * @cli optimize-data-uri-limit
			 * @env OPTIMIZE_DATA_URI_LIMIT
			 *
			 * @returns {(number|undefined)}
			 */
			dataURILimit() {
				if (require('config').webpack.fatHTML()) {
					return undefined;
				}

				return o('optimize-data-uri-limit', {
					env: true,
					type: 'number',
					default: 2 * 1024
				});
			}
		},

		/**
		 * Value of `externals`
		 */
		externals: {
			vue: 'Vue',
			eventemitter2: 'EventEmitter2',
			setimmediate: 'setImmediate'
		},

		/**
		 * Returns a value for `output.publicPath`.
		 * The method can take arguments that will be concatenated to the base value.
		 *
		 * @cli public-path
		 * @env PUBLIC_PATH
		 *
		 * @param args
		 * @returns {string}
		 *
		 * @example
		 * ```bash
		 * npx webpack --public-path /s3/hash
		 *
		 * # For local build without a static server
		 * npx webpack --public-path ''
		 * ```
		 *
		 * ```js
		 * // PUBLIC_PATH = '/s3/hash'
		 * publicPath('foo', 'bar') // /s3/hash/foo/bar
		 * ```
		 */
		publicPath(...args) {
			const
				concatUrls = require('urlconcat').concat;

			let
				pathVal;

			if (this.fatHTML()) {
				pathVal = '';

			} else {
				pathVal = o('public-path', {
					env: true,
					default: concatUrls('/', this.config.src.rel('clientOutput'))
				});

				if (!Object.isString(pathVal)) {
					pathVal = '';
				}
			}

			if (args.length) {
				args = args.map((el) => el.replace(/^\.?/, ''));

				if (pathVal && !/^(\w+:)?\/\//.test(args[0])) {
					return concatUrls(pathVal, ...args);
				}

				return concatUrls(...args);
			}

			return pathVal;
		},

		/**
		 * Returns a value for `output.filename`.
		 * The method can take an object with values to expand macros.
		 *
		 * @param params
		 * @returns {string}
		 *
		 * @example
		 * ```js
		 * output() // [hash]_[name]
		 * output({hash: 'foo', name: 'bla'}) // foo_bla
		 * ```
		 */
		output(params) {
			const
				res = this.mode() !== 'production' || this.fatHTML() ? '[name]' : '[hash]_[name]';

			if (params) {
				return res.replace(/_?\[(.*?)]/g, (str, key) => {
					if (params[key] != null) {
						return params[key];
					}

					return '';
				});
			}

			return res;
		},

		/**
		 * Returns a value for `DllPlugin.output.filename`.
		 * The method can take an object with values to expand macros.
		 *
		 * @param params
		 * @returns {string}
		 *
		 * @example
		 * ```js
		 * dllOutput() // [hash]_[name]
		 * dllOutput({hash: 'foo', name: 'bla'}) // foo_bla
		 * ```
		 */
		dllOutput(params) {
			return this.output(params);
		},

		/**
		 * Returns a value for `FileLoader.output.filename`.
		 * The method can take an object with values to expand macros.
		 *
		 * @param params
		 * @returns {string}
		 *
		 * @example
		 * ```js
		 * assetsOutput() // assets/[hash].[ext]
		 * assetsOutput({hash: 'foo'}) // assets/foo.[ext]
		 * ```
		 */
		assetsOutput(params) {
			const
				root = 'assets';

			if (this.mode() !== 'production' || this.fatHTML()) {
				return this.output({
					...params,
					name: `${root}/[path][name].[ext]`,
					hash: null
				});
			}

			return this.output({
				...params,
				hash: `${root}/[hash].[ext]`,
				name: null
			});
		},

		/**
		 * Returns path to the generated assets.json within the output directory.
		 * This file contains a JSON object with links to all JS/CSS files that are declared within "src/entries".
		 * The declaration solves the problem of connection between original files and compiled files:
		 * generated files may have different names (because of hash or other stuff) with original files.
		 *
		 * For instance:
		 *
		 * ```
		 * {
		 *  "index_style": {
		 *     "path": "index_style.css",
		 *     "publicPath": "index_style.css"
		 *  },
		 *  "index_tpl": {
		 *     "path": "index_tpl.js",
		 *     "publicPath": "index_tpl.js"
		 *  }
		 * }
		 * ```
		 *
		 * @returns {string}
		 */
		assetsJSON() {
			return 'assets.json';
		},

		/**
		 * Returns a path to the generated assets.js within the output directory.
		 * This file contains the modified version of "assets.json" to load as a JS script.
		 *
		 * @returns {string}
		 */
		assetsJS() {
			return path.changeExt(this.assetsJSON(), '.js');
		}
	},

	/**
	 * Options of Content Security Policy
	 */
	csp: {
		/**
		 * If true, the nonce attributes will be post-processed by a proxy, like Nginx
		 * (this mode will insert nonce attributes into inline tags too).
		 *
		 * If false, nonce attributes will be inserted from the JS runtime.
		 * Note, this mode doesn't support nonce attributes for inline tags.
		 */
		postProcessor: true,

		/**
		 * Return a name of the generated runtime global variable where the nonce value is stored
		 * @returns {?string}
		 */
		nonceStore() {
			if (this.nonce() == null) {
				return 'GLOBAL_NONCE';
			}

			if (this.nonceStore.result) {
				return this.nonceStore.result;
			}

			this.nonceStore.result = nanoid();
			return this.nonceStore.result;
		},

		/**
		 * Returns a value of the "nonce" hash
		 * @returns {?string}
		 */
		nonce() {
			return undefined;
		}
	},

	/**
	 * Returns parameters for TypeScript:
	 *
	 * 1. server - to compile node.js modules
	 * 2. client - to compile client modules
	 * 3. worker - to compile web-worker modules
	 *
	 * @override
	 * @returns {{server: !Object, client: !Object, worker: !Object}}
	 */
	typescript() {
		const
			server = super.typescript();

		const configFile = fs.existsSync(path.join(this.src.cwd(), 'client.tsconfig.json')) ?
			'client.tsconfig.json' :
			'tsconfig.json';

		const client = this.extend({}, server, {
			configFile,
			compilerOptions: {
				module: this.webpack.fatHTML() ? 'commonjs' : 'ES2020'
			}
		});

		return {
			client,
			server,
			worker: client
		};
	},

	/**
	 * Returns parameters for TerserPlugin
	 * @returns {{}}
	 */
	terser() {
		return {};
	},

	/**
	 * Returns parameters for worker-loader
	 * @returns {{shared: !Object, service: !Object, worker: !Object}}
	 */
	worker() {
		return {
			worker: {},

			serviceWorker: {
				workerType: 'ServiceWorker'
			},

			sharedWorker: {
				workerType: 'SharedWorker'
			}
		};
	},

	/**
	 * Returns parameters for stylus-loader
	 * @returns {!Object}
	 */
	stylus() {
		return {
			webpackImporter: false
		};
	},

	/**
	 * Returns parameters for css-loader
	 * @returns {!Object}
	 */
	css() {
		return {};
	},

	/**
	 * Returns parameters for CssMinimizerPlugin
	 * @returns {!Object}
	 */
	cssMinimizer() {
		return {};
	},

	/**
	 * Returns parameters for MiniCssExtractPlugin
	 * @returns {!Object}
	 */
	miniCssExtractPlugin() {
		return {};
	},

	/**
	 * Returns parameters for postcss-loader
	 * @returns {!Object}
	 */
	postcss() {
		return {};
	},

	/**
	 * Returns parameters for postcss/autoprefixer
	 * @returns {!Object}
	 */
	autoprefixer() {
		return {remove: false};
	},

	/**
	 * Returns parameters for style-loader
	 * @returns {!Object}
	 */
	style() {
		return {
			injectType: 'styleTag'
		};
	},

	/**
	 * Options to manage app themes
	 */
	theme: {
		/**
		 * Returns a name of the default app theme to use
		 *
		 * @cli t
		 * @env THEME
		 * @returns {string}
		 */
		default() {
			return o('theme', {
				short: 't',
				env: true
			});
		},

		/**
		 * Returns an array of available themes to passing from a design system to the runtime or `true`,
		 * if needed to pass all themes from the design system
		 *
		 * @cli include-themes
		 * @env INCLUDE_THEMES
		 *
		 * @returns {!Array<string>|boolean}
		 */
		include() {
			return o('include-themes', {
				env: true
			});
		},

		/**
		 * Returns an attribute name to set a value of the theme to the root element
		 *
		 * @cli theme-attribute
		 * @env THEME_ATTRIBUTE
		 *
		 * @default `data-theme`
		 */
		attribute: o('theme-attribute', {
			env: true,
			default: 'data-theme'
		})
	},

	/**
	 * Returns parameters for snakeskin-loader:
	 *
	 * 1. server - for .ess files
	 * 2. client - for .ss files
	 *
	 * @returns {{server: !Object, client: !Object}}
	 */
	snakeskin() {
		const
			snakeskinVars = include('build/snakeskin/vars');

		return {
			client: this.extend(super.snakeskin(), {
				adapter: 'ss2vue',
				adapterOptions: {transpiler: true},
				tagFilter: 'tagFilter',
				tagNameFilter: 'tagNameFilter',
				bemFilter: 'bemFilter',
				vars: snakeskinVars
			}),

			server: this.extend(super.snakeskin(), {
				vars: {
					...snakeskinVars,
					publicPath: this.webpack.publicPath
				}
			})
		};
	},

	/**
	 * Returns parameters for html-loader
	 * @returns {!Object}
	 */
	html() {
		const
			isProd = this.webpack.mode() === 'production';

		return {
			attributes: false,

			minimize: {
				useShortDoctype: true,
				conservativeCollapse: true,
				removeAttributeQuotes: true,
				removeComments: isProd,
				collapseWhitespace: isProd
			}
		};
	},

	/**
	 * Returns parameters for a favicon generator
	 * @returns {!Object}
	 */
	favicons() {
		return {
			appName: this.appName,
			path: this.src.assets('favicons'),
			background: '#FFF',
			display: 'standalone',
			orientation: 'portrait',
			version: 1.0,
			logging: false
		};
	},

	/**
	 * Returns parameters for image-webpack-loader
	 * @returns {!Object}
	 */
	imageOpts() {
		return {
			svgo: {
				removeUnknownsAndDefaults: false
			},

			webp: {
				quality: 75
			}
		};
	},

	/**
	 * Returns parameters for Typograf
	 * @returns {!Object}
	 */
	typograf() {
		return {
			locale: this.locale
		};
	},

	/** @override */
	runtime() {
		return {
			...super.runtime(),
			engine: this.engine(),

			debug: false,
			noGlobals: false,

			svgSprite: true,
			'ds/use-css-vars': false,

			blockNames: false,
			passDesignSystem: false,

			'core/browser': true,
			'core/session': true,

			'prelude/test-env': !isProd,
			'component/async-render': true,
			'component/daemons': true,

			'directives/event': true,
			'directives/image': true,
			'directives/in-view': true,
			'directives/resize-observer': true,
			'directives/update-on': true,

			iData: true,
			bRouter: true,

			'iInput/validators': true,
			'bInput/validators': true,

			'iInputText/mask': true
		};
	},

	/**
	 * Returns a map of component dependencies.
	 * This map can be used to provide dynamic component dependencies within `index.js` files.
	 *
	 * @returns {!Object}
	 *
	 * @example
	 * ```
	 * componentDependencies() {
	 *   return {'b-dummy': ['b-icon']};
	 * }
	 * ```
	 *
	 * ```
	 * package('b-dummy')
	 *   .extends('i-data')
	 *   .dependencies(...require('config').componentDependencies()['b-dummy'] ?? []);
	 * ```
	 */
	componentDependencies() {
		return {};
	},

	/** @override */
	monic() {
		const
			runtime = this.runtime(),
			es = this.es(),
			demo = Boolean(this.build.components && this.build.components.length);

		return {
			stylus: {
				flags: {
					runtime,
					'+:*': true,
					demo
				}
			},

			typescript: {
				flags: {
					runtime,
					es,
					demo
				}
			},

			javascript: {
				flags: {
					runtime,
					es,
					demo
				}
			}
		};
	}
});
