/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

/* eslint-disable max-lines */

const
	config = require('@v4fire/core/config/default');

const
	fs = require('node:fs'),
	path = require('upath');

const
	o = require('@v4fire/config/options').option;

const
	{nanoid} = require('nanoid');

module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
	__proto__: config,

	/**
	 * The name of the component library to use, such as Vue or React
	 *
	 * @cli engine
	 * @env ENGINE
	 *
	 * @param {string} [def] - default value
	 * @returns {string}
	 */
	engine(def = 'vue3') {
		return o('engine', {
			env: true,
			default: def,
			validate: (val) => new Set(['vue3']).has(val)
		});
	},

	src: {
		/**
		 * Returns a path to the application dist directory for client scripts
		 *
		 * @cli client-output
		 * @env CLIENT_OUTPUT
		 *
		 * @param {string[]} args
		 * @returns {string}
		 */
		clientOutput(...args) {
			const v = o('client-output', {
				env: true,
				default: this.config.webpack.storybook() ? 'storybook' : 'client'
			});

			return this.output(v, ...args);
		}
	},

	build: {
		/**
		 * Returns true if the current build environment is a testing environment
		 * @returns {boolean}
		 */
		isTestEnv() {
			return !isProd && !this.config.webpack.ssr;
		},

		/**
		 * Test server port
		 * @env TEST_PORT
		 */
		testPort: o('test-port', {
			env: true,
			default: 8000
		}),

		/**
		 * Project build mode
		 *
		 * @cli build-mode
		 * @env BUILD_MODE
		 *
		 * @param {string} [def] - default value
		 * @returns {string}
		 */
		mode(def = IS_PROD ? 'production' : 'development') {
			return o('build-mode', {
				env: true,
				default: def
			});
		},

		/**
		 * True, if the build process is running within CI
		 *
		 * @cli build-ci
		 * @env BUILD_CI
		 *
		 * @type {boolean}
		 */
		ci: o('build-ci', {
			env: true,
			type: 'boolean',
			default: Boolean(process.env.CI)
		}),

		/**
		 * A list of entries to build.
		 * The entries are taken from the "core/entries" directory.
		 *
		 * You can use this option when you are developing a specific piece,
		 * and you don't want to build the whole application because it can slow down the build time.
		 *
		 * @cli entries
		 * @env ENTRIES
		 *
		 * @type {string}
		 *
		 * @example
		 * ```bash
		 * # Build only entries foo and bar
		 * npx webpack --env entries=foo,bar
		 * ```
		 */
		entries: o('entries', {
			env: true,
			coerce: (v) => v ? v.split(',') : []
		}),

		/**
		 * The number of available CPUs that can be used to build the application
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
		 * Returns a prefix for the `components-lock.json` file.
		 * When you have different component loc files associated with some runtime options, you need to keep them separate.
		 *
		 * @cli component-lock-prefix
		 * @env COMPONENT_LOCK_PREFIX
		 *
		 * @param {string} [def] - default value
		 * @returns {string}
		 */
		componentLockPrefix(def = this.config.webpack.fatHTML() ? 'fat-html' : '') {
			return o('component-lock-prefix', {
				env: true,
				default: def
			});
		},

		/**
		 * Each client build begins with a project graph calculation.
		 * The graph contains information about entry points, dependencies, and more.
		 *
		 * This information is used by WebPack for code block deduplication and build optimization,
		 * but the graph calculation process may take some time.
		 *
		 * This option allows to take the project graph from a previous build if it exists.
		 * Keep in mind, an incorrect graph can break the application build.
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
		 * The name of the component to create demos or tests
		 *
		 * @cli demo-page
		 * @env DEMO_PAGE
		 *
		 * @param {string} [def] - default value
		 * @returns {string}
		 */
		demoPage(def = 'p-v4-components-demo') {
			return o('demo-page', {
				env: true,
				default: def
			});
		},

		/**
		 * The name of the component to run synchronous tests
		 *
		 * @cli sync-test-page
		 * @env SYNC_TEST_PAGE
		 *
		 * @param {string} [def] - default value
		 * @returns {string}
		 */
		syncTestPage(def = 'p-v4-sync-test-page') {
			return o('sync-test-page', {
				env: true,
				default: def
			});
		},

		/**
		 * Returns true if the application build should include special stub components for testing purposes.
		 * By default, these components are only loaded in the development environment.
		 *
		 * @cli load-dummy-components
		 * @env LOAD_DUMMY_COMPONENTS
		 *
		 * @param {boolean} [def] - default value
		 * @returns {boolean}
		 */
		loadDummyComponents(def) {
			def ??= this.isTestEnv() && !this.config.webpack.storybook();

			return o('load-dummy-components', {
				env: true,
				type: 'boolean',
				default: def
			});
		},

		/**
		 * Returns `true` if the application build times should be traced.
		 * Trace file will be created in the project's root.
		 * It's highly recommended to use this option with `module-parallelism=1`.
		 *
		 * @cli trace-build-times
		 * @env TRACE_BUILD_TIMES
		 *
		 * @param {boolean} [def] - default value
		 * @returns {boolean}
		 */
		trace(def = false) {
			return o('trace-build-times', {
				env: true,
				type: 'boolean',
				default: def
			});
		},

		/**
		 * Controls the level of verbosity in the project's build output.
		 * This parameter is useful for users who want to have more detailed information about the project's build.
		 *
		 * @cli verbose
		 * @env VERBOSE
		 */
		verbose: o('verbose', {
			env: true,
			default: false
		})
	},

	/**
	 * WebPack configuration
	 */
	webpack: {
		/**
		 * Returns the `webpack.mode` value
		 *
		 * @cli mode
		 * @env MODE
		 *
		 * @param {string} [def] - default value
		 * @returns {string}
		 */
		mode(def = IS_PROD ? 'production' : 'development') {
			return o('mode', {
				env: true,
				default: def
			});
		},

		/**
		 * Returns the `webpack.cache.type` value
		 *
		 * @cli cache-type
		 * @env CACHE_TYPE
		 *
		 * @param {string} [def] - default value
		 * @returns {string}
		 */
		cacheType(def = 'memory') {
			return o('cache-type', {
				env: true,
				default: def
			});
		},

		/**
		 * Returns the `webpack.target` value
		 *
		 * @cli target
		 * @env TARGET
		 *
		 * @param {string} [def] - default value
		 * @returns {?string}
		 */
		target(
			def = /ES[35]$/.test(this.config.es()) && !this.storybook() ?
				'browserslist:ie 11' :
				'web'
		) {
			return o('target', {
				env: true,
				default: this.ssr ? 'node' : def
			});
		},

		/**
		 * Returns the `webpack.devtool` value
		 *
		 * @cli devtool
		 * @env DEVTOOL
		 *
		 * @param {string} [def] - default value
		 * @returns {?string}
		 */
		devtool(def) {
			return o('devtool', {
				env: true,
				default: def
			});
		},

		/**
		 * Returns the `webpack.stats` value
		 *
		 * @cli stats
		 * @env STATS
		 *
		 * @param {boolean} [def] - default value
		 * @returns {(boolean|string|object)}
		 */
		stats(def = true) {
			return o('stats', {
				env: true,
				type: 'json',
				default: def
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
		 * True if the application needs to be built for SSR
		 *
		 * @cli ssr
		 * @env SSR
		 *
		 * @type {boolean}
		 */
		ssr: o('ssr', {
			env: true,
			type: 'boolean'
		}),

		/**
		 * Returns true if the application needs to be built with hydration support
		 *
		 * @cli hydration
		 * @env HYDRATION
		 *
		 * @param {boolean} [def] - default value
		 * @returns {boolean}
		 */
		hydration(def = false) {
			return o('hydration', {
				env: true,
				type: 'boolean',
				default: def
			});
		},

		/**
		 * Returns true if the application should be built for the [storybook](https://storybook.js.org/)
		 *
		 * @cli storybook
		 * @env STORYBOOK
		 *
		 * @param {boolean} [def] - default value
		 * @returns {boolean}
		 */
		storybook(def = false) {
			return o('storybook', {
				env: true,
				type: 'boolean',
				default: def
			});
		},

		/**
		 * Returns
		 *   1. `1` if all resources from the build should be embedded in HTML files;
		 *   2. `2` if all scripts and links from the build should be embedded in HTML files;
		 *   3. `0` if resources from the build should not be embedded in HTML files.
		 *
		 * @cli fat-html
		 * @env FAT_HTML
		 *
		 * @param {number} [def] - default value
		 * @returns {number}
		 */
		fatHTML(def = 0) {
			return o('fat-html', {
				env: true,
				type: 'number',
				coerce: (value) => value === 'script-link' ? 2 : Number(value),
				default: def
			});
		},

		/**
		 * Returns true if all resources from the initial entry point should be embedded in HTML files.
		 * Otherwise, they will be loaded via tags, either dynamically inserted or inlined
		 *
		 * @cli inline-initial
		 * @env INLINE_INITIAL
		 *
		 * @param {boolean} [def] - default value
		 * @returns {boolean}
		 */
		inlineInitial(def = false) {
			return o('inline-initial', {
				env: true,
				type: 'boolean',
				default: def
			});
		},

		/**
		 * Returns true if no code should be inlined directly in HTML
		 *
		 * @cli externalize-inline
		 * @env EXTERNALIZE_INLINE
		 *
		 * @param {boolean} [def] - default value
		 * @returns {boolean}
		 */
		externalizeInline(def = false) {
			return o('externalize-inline', {
				env: true,
				type: 'boolean',
				default: def,
				validate: (externalizeInline) => {
					const {webpack} = this.config;

					return !externalizeInline || (
						!webpack.dynamicPublicPath() &&
						!webpack.inlineInitial() &&
						!webpack.fatHTML()
					);
				}
			});
		},

		/**
		 * Webpack options for build optimization
		 */
		optimize: {
			/**
			 * The minimum fragment file size, in bytes, that can be split into a single file
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
			 * @returns {object}
			 */
			splitChunks() {
				return {};
			},

			/**
			 * Returns the maximum file size in bytes that can be embedded as base64
			 *
			 * @cli optimize-data-uri-limit
			 * @env OPTIMIZE_DATA_URI_LIMIT
			 *
			 * @param {number} [def] - default value
			 * @returns {(number|undefined)}
			 */
			dataURILimit(def = 2 * 1024) {
				const
					fatHTML = require('@config/config').webpack.fatHTML();

				if (fatHTML === true || fatHTML === 1) {
					return undefined;
				}

				return o('optimize-data-uri-limit', {
					env: true,
					type: 'number',
					default: def
				});
			}
		},

		/**
		 * This option should be used to specify managed libs, which will
		 * be excluded from `snapshot.managedPaths` and from `watchOptions.ignore`
		 *
		 * @cli managed-libs
		 * @env MANAGED_LIBS
		 *
		 * @example
		 * ```bash
		 * npx webpack --env managed-libs="@scope/helpers,@scope/core"
		 * ```
		 *
		 * @returns {string[]}
		 */
		managedLibs() {
			return o('managed-libs', {
				env: true,
				default: ''
			})
				.split(',')
				.map((str) => str.trim());
		},

		/**
		 * Returns the `webpack.aliases` value
		 *
		 * @see https://webpack.js.org/configuration/resolve/#resolvealias
		 * @returns {object}
		 */
		aliases() {
			const aliases = {
				dompurify: this.config.es().toLowerCase() === 'es5' ? 'dompurify-v2' : 'dompurify-v3',
				'vue/server-renderer': 'assets/lib/server-renderer.js'
			};

			if (!this.config.webpack.ssr) {
				aliases['assets/lib/server-renderer'] = false;
				aliases['vue/server-renderer'] = false;
			}

			return aliases;
		},

		/**
		 * Returns the `webpack.externals` value
		 * @returns {object}
		 */
		externals() {
			return {
				vue: this.config.webpack.ssr ? 'vue' : 'root Vue',
				jsdom: 'jsdom',
				eventemitter2: 'EventEmitter2',
				setimmediate: 'setImmediate'
			};
		},

		/**
		 * An expression that provides the public path for resources at runtime.
		 *
		 * If the value is provided as a boolean value, it allows modifications to `publicPath` at runtime,
		 * otherwise it takes the value as a static string parameter.
		 *
		 * @cli dynamic-public-path
		 * @env DYNAMIC_PUBLIC_PATH
		 *
		 * @param {(boolean|string)} [def] - default value
		 * @returns {(?string|boolean)}
		 */
		dynamicPublicPath(def) {
			const v = o('dynamic-public-path', {
				env: true,
				default: def
			});

			try {
				return JSON.parse(v);

			} catch {
				return v;
			}
		},

		/**
		 * If true, the path to load resources can be defined at runtime using the `publicPath` URL query parameter
		 *
		 * @cli provide-public-path-with-query
		 * @env PROVIDE_PUBLIC_PATH_WITH_QUERY
		 *
		 * @param {boolean} [def] - default value
		 * @returns {boolean}
		 */
		providePublicPathWithQuery(def = true) {
			return Boolean(this.dynamicPublicPath() && o('provide-public-path-with-query', {
				env: true,
				type: 'boolean',
				default: def
			}));
		},

		/**
		 * Returns the `output.publicPath` value.
		 * The method can take arguments that will be concatenated to the base value.
		 *
		 * @cli public-path
		 * @env PUBLIC_PATH
		 *
		 * @param {...Array<string>} args
		 * @returns {string}
		 *
		 * @example
		 * ```bash
		 * npx webpack --env public-path=/s3/hash
		 *
		 * # For local build without a static server
		 * npx webpack --env public-path
		 * ```
		 *
		 * ```js
		 * // PUBLIC_PATH = '/s3/hash'
		 * publicPath('foo', 'bar') // /s3/hash/foo/bar
		 * ```
		 */
		publicPath(...args) {
			const {concatURLs} = require('@v4fire/core/lib/core/url');

			const def = concatURLs('/', this.config.src.rel('clientOutput'));

			let pathVal = o('public-path', {
				env: true,
				default: def
			});

			if (!Object.isString(pathVal)) {
				pathVal = '';
			}

			if (this.storybook() && pathVal === def) {
				pathVal = '//';
			}

			if (pathVal[0] === '\\') {
				pathVal = pathVal.slice(1);
			}

			if (args.length) {
				args = args.map((el) => el.replace(/^\.?/, ''));

				if (pathVal && !/^(\w+:)?\/\//.test(args[0])) {
					return concatURLs(pathVal, ...args);
				}

				return concatURLs(...args);
			}

			if (pathVal) {
				return concatURLs(pathVal, '/').replace(/^\/+/, '/');
			}

			return pathVal;
		},

		/**
		 * Returns the `output.filename` value.
		 * The method can take a dictionary with values to expand macros.
		 *
		 * @param {object} vars
		 * @returns {string}
		 *
		 * @example
		 * ```js
		 * output() // [hash]_[name]
		 * output({hash: 'foo', name: 'bla'}) // foo_bla
		 * ```
		 */
		output(vars) {
			const
				res = this.mode() !== 'production' || this.fatHTML() ? '[name]' : '[hash]_[name]';

			if (vars) {
				return res.replace(/_?\[(.*?)]/g, (str, key) => {
					if (vars[key] != null) {
						return vars[key];
					}

					return '';
				});
			}

			return res;
		},

		/**
		 * Returns the `DllPlugin.output.filename` value.
		 * The method can take a dictionary with values to expand macros.
		 *
		 * @param {object} vars
		 * @returns {string}
		 *
		 * @example
		 * ```js
		 * dllOutput() // [hash]_[name]
		 * dllOutput({hash: 'foo', name: 'bla'}) // foo_bla
		 * ```
		 */
		dllOutput(vars) {
			return this.output(vars);
		},

		/**
		 * Returns the `FileLoader.output.filename` value.
		 * The method can take a dictionary with values to expand macros.
		 *
		 * @param {object} params
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
		 * Returns a path to the generated assets.json file in the output directory.
		 * This file contains a JSON object with links to all JS/CSS files declared in "src/entries".
		 * The declaration solves the connection problem between source files and compiled files:
		 * the generated files may have different names (because of the hash or other things) with the original files.
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
		 * Returns a path to the generated assets.js file in the output directory.
		 * This file contains a modified version of "assets.json" to download as a JS script.
		 *
		 * @returns {string}
		 */
		assetsJS() {
			return path.changeExt(this.assetsJSON(), '.js');
		},

		/**
		 * Returns options for displaying webpack build progress
		 *
		 * @cli progress
		 * @env PROGRESS
		 *
		 * @see https://github.com/npkgz/cli-progress
		 * @param {boolean} [def] - default value
		 * @returns {void|object}
		 */
		progress(def = true) {
			const enabled = o('progress', {
				env: true,
				default: def,
				type: 'boolean'
			});

			if (enabled) {
				return {
					opts: {
						clearOnComplete: true,
						stopOnComplete: true,
						forceRedraw: true,
						noTTYOutput: this.config.build.ci,
						hideCursor: null
					}
				};
			}
		},

		/**
		 * Returns number of modules to build in parallel
		 *
		 * @cli module-parallelism
		 * @env MODULE_PARALLELISM
		 *
		 * @see https://webpack.js.org/configuration/other-options/#parallelism
		 * @param {number} [def] - default value
		 * @returns {number}
		 */
		moduleParallelism(def = 100) {
			return o('module-parallelism', {
				env: true,
				default: def,
				type: 'number'
			});
		}
	},

	/**
	 * Options of Content Security Policy
	 */
	csp: {
		/**
		 * If true, the nonce attributes will be processed by a proxy such as Nginx
		 * (this mode will also insert the nonce attributes into inline tags).
		 *
		 * If false, the nonce attributes will be inserted from the JS runtime.
		 * Note that this mode does not support nonce attributes for inline tags.
		 */
		postProcessor: true,

		/**
		 * Returns the name of the generated global runtime variable that holds the nonce value
		 * @returns {?string}
		 */
		nonceStore() {
			if (this.nonce() == null) {
				return 'GLOBAL_NONCE';
			}

			if (this.nonceStore.cachedResult) {
				return this.nonceStore.cachedResult;
			}

			this.nonceStore.cachedResult = nanoid();
			return this.nonceStore.cachedResult;
		},

		/**
		 * Returns the hash value of "nonce"
		 * @returns {?string}
		 */
		nonce() {
			return undefined;
		}
	},

	/**
	 * Returns parameters for a TypeScript compiler:
	 *
	 * 1. server - options for compiling the application as a node.js library;
	 * 2. client - options for compiling the application as a client app.
	 *
	 * @override
	 * @returns {{server: object, client: object}}
	 */
	typescript() {
		const configFile = fs.existsSync(path.join(this.src.cwd(), 'client.tsconfig.json')) ?
			'client.tsconfig.json' :
			'tsconfig.json';

		const
			server = super.typescript();

		const {
			compilerOptions: {module}
		} = require(path.join(this.src.cwd(), configFile));

		const client = this.extend({}, server, {
			configFile,
			compilerOptions: {
				module: this.webpack.ssr ? 'commonjs' : module
			}
		});

		return {
			client,
			server
		};
	},

	/**
	 * Returns parameters for `TerserPlugin`
	 * @returns {{}}
	 */
	terser() {
		return {};
	},

	/**
	 * Returns a component dependency map.
	 * This map can be used to provide dynamic component dependencies in `index.js` files.
	 *
	 * @returns {object}
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
	 *   .dependencies(...require('@config/config').componentDependencies()['b-dummy'] ?? []);
	 * ```
	 */
	componentDependencies() {
		return {};
	},

	/**
	 * Returns parameters for `Statoscope`
	 *
	 * @see https://github.com/statoscope/statoscope/tree/master/packages/webpack-plugin#usage
	 * @returns {object}
	 */
	statoscope() {
		return {
			enabled: o('statoscope-webpack-plugin', {
				default: false,
				env: true
			}),

			entryDownloadDiffSizeLimits: {
				runtime: 50 * 1024,
				standalone: 50 * 1024,
				styles: 50 * 1024,
				html: 10 * 1024
			},

			entryDownloadDiffTimeLimits: {
				runtime: 50,
				standalone: 50,
				styles: 50,
				html: 10
			},

			webpackPluginConfig: {
				saveStatsTo: 'statoscope-stats/stats-[name].json',
				saveOnlyStats: true,
				normalizeStats: false,
				watchMode: false,
				open: false
			}
		};
	},

	/**
	 * Returns parameters for `stylus-loader`
	 * @returns {object}
	 */
	stylus() {
		return {
			webpackImporter: false,

			stylusOptions: {
				compress: false
			}
		};
	},

	/**
	 * Returns parameters for `css-loader`
	 * @returns {object}
	 */
	css() {
		return {};
	},

	/**
	 * Returns parameters for `CssMinimizerPlugin`
	 * @returns {object}
	 */
	cssMinimizer() {
		return {};
	},

	/**
	 * Returns parameters for `MiniCssExtractPlugin`
	 * @returns {object}
	 */
	miniCssExtractPlugin() {
		return {};
	},

	/**
	 * Returns parameters for `postcss-loader`
	 * @returns {object}
	 */
	postcss() {
		return {};
	},

	/**
	 * Returns parameters for `postcss/autoprefixer`
	 * @returns {object}
	 */
	autoprefixer() {
		return {remove: false};
	},

	/**
	 * Returns parameters for `style-loader`
	 * @returns {object}
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
		 * Returns the default application theme name to use
		 *
		 * @cli t
		 * @env THEME
		 *
		 * @param {string} [def] - default value
		 * @returns {string}
		 */
		default(def) {
			return o('theme', {
				short: 't',
				env: true,
				default: def
			});
		},

		/**
		 * Returns an array of available themes to pass from the design system to the runtime,
		 * or returns true to pass all themes from the design system
		 *
		 * @cli include-themes
		 * @env INCLUDE_THEMES
		 *
		 * @param {string} [def] - default value
		 * @returns {Array<string>|boolean}
		 */
		include(def) {
			return o('include-themes', {
				env: true,
				default: def
			});
		},

		/**
		 * The attribute name used to assign the theme value to the root element
		 *
		 * @cli theme-attribute
		 * @env THEME_ATTRIBUTE
		 *
		 * @default `data-theme`
		 */
		attribute: o('theme-attribute', {
			env: true,
			default: 'data-theme'
		}),

		/**
		 * If set to true, the theme attribute will be processed by a proxy server, such as Nginx.
		 * Otherwise, the theme attributes will be sourced from the JS runtime.
		 */
		postProcessor: false,

		/**
		 * The name of the template variable that will be replaced by the proxy server for forwarding the active theme
		 *
		 * @cli theme-post-processor-template
		 * @env THEME_POST_PROCESSOR_TEMPLATE
		 */
		postProcessorTemplate: o('theme-post-processor-template', {
			default: 'COLOR_THEME',
			env: true
		})
	},

	/**
	 * Additional parameters for the template compiler
	 */
	template: {
		/**
		 * Returns a dictionary with directive descriptors that need to be specifically processed during code generation
		 * @returns {Object<string, {tag?: string, innerHTML?: boolean, withBindings?: boolean}>}
		 */
		transformableDirectives() {
			return {
				tag: {},
				icon: include('src/components/directives/icon/compiler-info'),
				image: include('src/components/directives/image/compiler-info'),
				'safe-html': include('src/components/directives/safe-html/compiler-info')
			};
		},

		/**
		 * Returns parameters for @vue/compiler-sfc
		 * @returns {object}
		 */
		compilerSFC() {
			const {ssr} = this.config.webpack;

			const
				NOT_CONSTANT = 0,
				EXPRESSION = 4,
				DIRECTIVE = 7;

			const transformableDirectives = this.transformableDirectives();

			const nodeTransforms = [
				(node) => {
					const {props} = node;

					if (!ssr || props == null) {
						return;
					}

					props.slice().forEach((prop) => {
						if (prop.type !== DIRECTIVE || transformableDirectives[prop.name] == null) {
							return;
						}

						if (prop.name === 'tag') {
							node.tag = `__TAG_INTERPOLATION:\${${stringifyProp(prop.exp)}}$`;
							return;
						}

						const directive = transformableDirectives[prop.name];

						const args = {
							arg: stringifyProp(prop.arg),
							value: stringifyProp(prop.exp),
							modifiers: JSON.stringify(prop.modifiers),
							instance: '_ctx'
						};

						if (directive.withBindings) {
							const bindings = props.reduce((acc, prop) => {
								if (prop.name === 'bind' && prop.arg?.content) {
									try {
										acc[prop.arg.content] = JSON.parse(prop.exp.content);

									} catch {
										acc[prop.arg.content] = prop.exp.content;
									}
								}

								return acc;
							}, {});

							args.bindings = JSON.stringify(bindings);
						}

						const argsStr = `{${Object.entries(args).map(([k, v]) => `"${k}": ${v}`).join(',')}}`;

						if (directive.innerHTML) {
							props.push({
								type: DIRECTIVE,
								name: 'html',

								exp: {
									type: EXPRESSION,
									constType: NOT_CONSTANT,
									isStatic: false,
									content: `_ctx.$renderEngine.r.resolveDirective.call(_ctx, '${prop.name}')?.getSSRProps?.(${argsStr}).innerHTML`,
									loc: prop.exp?.loc ?? prop.loc
								},

								arg: undefined,
								modifiers: [],
								loc: prop.loc
							});
						}

						if (directive.tag != null) {
							node.tag = directive.tag;
						}
					});

					function stringifyProp(prop) {
						if (prop == null) {
							return;
						}

						if (Object.isString(prop)) {
							return prop;
						}

						if (prop.children != null) {
							return prop.children.reduce((acc, prop) => acc + stringifyProp(prop), '');
						}

						return prop.isStatic ? JSON.stringify(prop.content) : prop.content;
					}
				}
			];

			return {
				ssr: this.config.webpack.ssr,
				ssrCssVars: {},
				compilerOptions: {nodeTransforms}
			};
		}
	},

	/**
	 * Returns parameters for `snakeskin-loader`:
	 *
	 * 1. server - for .ess files;
	 * 2. client - for .ss files.
	 *
	 * @returns {{server: object, client: object}}
	 */
	snakeskin() {
		const snakeskinVars = {
			...include('build/snakeskin/vars'),
			teleport: this.webpack.storybook() ? '#storybook-root' : '#teleports'
		};

		return {
			client: this.extend(super.snakeskin(), {
				adapter: 'ss2vue3',
				adapterOptions: this.template.compilerSFC(),
				i18nFn: 't',
				tagFilter: 'tagFilter',
				tagNameFilter: 'tagNameFilter',
				bemFilter: 'bemFilter',
				vars: snakeskinVars
			}),

			server: this.extend(super.snakeskin(), {
				i18nFn: 't',
				vars: {
					...snakeskinVars,
					publicPath: this.webpack.publicPath
				}
			})
		};
	},

	/**
	 * Returns parameters for `html-loader`
	 *
	 * @see https://webpack.js.org/loaders/html-loader/#options
	 * @returns {object}
	 */
	html() {
		const
			isProd = this.webpack.mode() === 'production';

		return {
			sources: false,
			minimize: isProd && {
				caseSensitive: true,
				collapseWhitespace: true,
				conservativeCollapse: true,
				keepClosingSlash: true,
				minifyCSS: true,
				minifyJS: false,
				// Keep comments for SSI
				removeComments: false,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true
			}
		};
	},

	/**
	 * Returns parameters for a favicon generator
	 *
	 * @see https://github.com/itgalaxy/favicons#usage
	 * @returns {object}
	 */
	favicons() {
		return {
			src: 'logo.png',
			appName: this.appName,
			path: '$faviconPublicPath',
			html: 'favicons.html',
			background: '#2E2929',
			display: 'standalone',
			orientation: 'portrait',
			version: 1.0,
			logging: false,
			manifestName: 'manifest.json',
			// Custom manifest URL
			manifestHref: ''
		};
	},

	/**
	 * Returns parameters for `image-webpack-loader`
	 * @returns {object}
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
	 * Returns parameters for `typograf`
	 * @returns {object}
	 */
	typograf() {
		return {
			// Typograf dont support en locale
			locale: this.locale === 'en' ? 'en-US' : this.locale
		};
	},

	i18n: {
		/**
		 * A strategy for loading localization files into the application:
		 *
		 *  1. `inlineSingleHTML` - all localization files found will be included in the application HTML files themselves;
		 *  2. `inlineMultipleHTML` - based on the original HTML files of the application, new ones will be generated for
		 *      each supported locale;
		 *  3. `externalMultipleJSON` - all found localization files will be combined into several JSON files
		 *      for each locale.
		 *
		 * @cli i18n-strategy
		 * @env I18N_STRATEGY
		 * @param {string} [def]
		 *
		 * @returns {string}
		 */
		strategy(def = 'inlineSingleHTML') {
			return o('i18n-strategy', {
				env: true,
				default: def
			});
		},

		/**
		 * A list of supported languages for application internationalization.
		 * JS files with names that match the name of the locale and located in folders named i18n will be
		 * loaded into the application.
		 *
		 * @cli supported-locales
		 * @env SUPPORTED_LOCALES
		 *
		 * @param {string} [def] - default value
		 * @returns {Array<import('@v4fire/core').Language>}
		 *
		 * @example
		 * ```bash
		 * npx webpack --env supported-locales=en,ru
		 * ```
		 */
		supportedLocales(def = 'en,ru') {
			return o('supported-locales', {
				env: true,
				coerce: (str) => str.split(/\s*,\s*/),
				default: def
			});
		},

		/**
		 * The name of the generated global variable where the language packs are stored
		 */
		langPacksStore: 'LANG_PACKS'
	},

	/** @override */
	runtime() {
		return {
			...super.runtime(),

			engine: this.engine(),
			ssr: this.webpack.ssr,

			debug: false,
			dynamicPublicPath: this.webpack.dynamicPublicPath(),

			svgSprite: true,
			'ds/use-css-vars': false,

			blockNames: false,
			passDesignSystem: false,

			'prelude/test-env': this.build.isTestEnv(),
			storybook: this.webpack.storybook(),

			dummyComponents: this.build.loadDummyComponents(),

			theme: this.theme.default(),
			includeThemes: this.theme.include()
		};
	},

	/** @override */
	monic() {
		const defFlags = {
			mode: this.build.mode(),
			runtime: this.runtime(),
			demo: Boolean(this.build.components && this.build.components.length)
		};

		const runtimeFlags = {
			...defFlags,

			// eslint-disable-next-line camelcase
			node_js: this.webpack.target() === 'node',
			es: this.es()
		};

		return {
			stylus: {
				flags: {
					...defFlags,
					'+:*': true
				}
			},

			typescript: {
				flags: runtimeFlags
			},

			javascript: {
				flags: runtimeFlags
			}
		};
	}
});
