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
	path = require('upath'),
	camelize = require('camelize'),
	o = require('uniconf/options').option;

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
		 * Enables the fast kind of application building.
		 *
		 * Mind, this type of build is slower on re-building, i.e.,
		 * it doesn't meet with the development needs when you launch the development server and
		 * incrementally rebuild the modified chunks, but it totally matches the situation when you need
		 * to improve the speed of the release build.
		 *
		 * @cli fast-build
		 * @env FAST_BUILD
		 *
		 * @type {boolean}
		 * @default `isProd`
		 *
		 * @returns {boolean}
		 */
		fast() {
			const v = o('fast-build', {
				env: true,
				type: 'boolean'
			});

			return v != null ? v : isProd;
		},

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
		 * Enables the special kind of the demo page (pages/p-v4-components-demo) to build with
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
			env: true
		})
	},

	/**
	 * Name of the used MVVM library, like vue or react
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

	/** @override */
	runtime() {
		return {
			...super.runtime(),

			engine: this.engine(),
			noGlobals: false,
			svgSprite: true,

			'ds-diff': false,
			'ds-vars': false,

			blockNames: false,
			passDesignSystem: false,

			'core/browser': true,
			'core/session': true,

			'prelude/dependencies': true,
			'component/async-render': true,
			'component/daemons': true,

			'directives/event': true,
			'directives/resize': false,
			'directives/image': false,
			'directives/in-view': false,
			'directives/update-on': false,

			iData: true,
			bRouter: true,

			'iInput/validators': true,
			'bInput/mask': true,
			'bInput/validators': true
		};
	},

	/**
	 * Webpack configuration
	 */
	webpack: {
		/**
		 * WebPack ".devtool" option
		 */
		devtool: false,

		/**
		 * Returns the default hash algorithm to use
		 * @returns {?string}
		 */
		hashFunction() {
			return !isProd || this.fatHTML() ? undefined : this.config.build.hashAlg;
		},

		/**
		 * Returns true if all static from the build have to inline within HTML files
		 * @returns {boolean}
		 */
		fatHTML() {
			return false;
		},

		/**
		 * Returns the maximum size of a file in bytes that can be inline as base64
		 * @returns {(number|undefined)}
		 */
		dataURILimit() {
			return this.fatHTML() ? undefined : 2048;
		},

		/**
		 * WebPack ".externals" option
		 */
		externals: {
			vue: 'Vue',
			eventemitter2: 'EventEmitter2',
			setimmediate: 'setImmediate'
		},

		/**
		 * Enables hard caching of WebPack build: it helps speed up "cold" build time
		 *
		 * @cli build-cache
		 * @env BUILD_CACHE
		 *
		 * @returns {boolean}
		 */
		buildCache() {
			return o('build-cache', {
				default: !isProd,
				type: 'boolean'
			});
		},

		/**
		 * Returns a path to the directory to store application build cache
		 *
		 * @see buildCache
		 * @returns {string}
		 */
		cacheDir() {
			return '[confighash]';
		},

		/**
		 * Returns the value for WebPack "output.publicPath".
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
		 * Returns the value for WebPack "output.filename".
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
				res = !isProd || this.fatHTML() ? '[name]' : '[hash]_[name]';

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
		 * Returns the value for WebPack DllPlugin "output.filename".
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
		 * Returns the value for WebPack FileLoader "output.filename".
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

			if (!isProd || this.fatHTML()) {
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
		 * Returns path to a generated assets.json within the output directory.
		 * This file contains a JSON object with links to all JS/CSS files that are declared within "src/entries".
		 * The declaration solves the problem of connection between original files and compiled files:
		 * generated files may have different names (because of hash or other stuff) with original files.
		 *
		 * For instance:
		 *
		 * ```
		 * {
		 *   "index.dependencies": {
		 *     "path": "index.dependencies.js",
		 *     "publicPath": "index.dependencies.js"
		 *  },
		 *  "index$style": {
		 *     "path": "index$style.css",
		 *     "publicPath": "index$style.css"
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
		 * Returns path to a generated assets.js within the output directory.
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
		 * Returns value of the "nonce" hash
		 * @returns {?string}
		 */
		nonce() {
			return '{{nonce}}';
		}
	},

	/**
	 * Config for a favicon generator
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
	 * Config for image-webpack-loader
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
	 * Config for html-loader
	 * @returns {!Object}
	 */
	html() {
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
	 * Config for postcss-loader
	 * @returns {!Object}
	 */
	postcss() {
		return {};
	},

	/**
	 * Config for postcss/autoprefixer
	 * @returns {!Object}
	 */
	autoprefixer() {
		return {remove: false};
	},

	/**
	 * Config for Webpack TerserPlugin
	 * @returns {{}}
	 */
	uglify() {
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
	},

	/**
	 * Config for snakeskin-loader:
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
	 * Config for typescript-loader
	 *
	 * 1. server - to compile node.js modules
	 * 2. client - to compile client modules
	 * 3. worker - to compile web-worker modules
	 *
	 * @returns {{server: !Object, client: !Object, worker: !Object}}
	 */
	typescript() {
		return {
			client: super.typescript(),
			worker: super.typescript(),
			server: super.typescript()
		};
	},

	/**
	 * Config for worker-loader
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
	 * Config for css-loader
	 * @returns {!Object}
	 */
	css() {
		return {
			minimize: Boolean(isProd || Number(process.env.MINIFY_CSS))
		};
	},

	/**
	 * Config for stylus-loader
	 * @returns {!Object}
	 */
	stylus() {
		return {
			preferPathResolver: 'webpack'
		};
	},

	/**
	 * Config for the Typograf library
	 * @returns {!Object}
	 */
	typograf() {
		return {
			locale: this.locale
		};
	}
});
