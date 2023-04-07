'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('@v4fire/core/config/default');

const
	fs = require('fs'),
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
	 * @param {string=} [def] - default value
	 * @returns {string}
	 */
	engine(def = 'vue3') {
		return o('engine', {
			env: true,
			default: def,
			validate: (val) => new Set(['vue3']).has(val)
		});
	},

	/** @inheritDoc */
	build: {
		/**
		 * Project build mode
		 *
		 * @cli build-mode
		 * @env BUILD_MODE
		 *
		 * @param {string=} [def] - default value
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
		 * @param {string=} [def] - default value
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
		 * @param {string=} [def] - default value
		 * @returns {string}
		 */
		demoPage(def = 'p-v4-components-demo') {
			return o('demo-page', {
				env: true,
				default: def
			});
		},

		/**
		 * Test server port
		 * @env TEST_PORT
		 */
		testPort: o('test-port', {
			env: true,
			default: 8000
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
		 * @param {string=} [def] - default value
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
		 * @param {string=} [def] - default value
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
		 * @param {string=} [def] - default value
		 * @returns {?string}
		 */
		target(
			def = /ES[35]$/.test(this.config.es()) ?
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
		 * @param {string=} [def] - default value
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
		 * @param {boolean=} [def] - default value
		 * @returns {(boolean|string|Object)}
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
		 * Returns true if the app needs to be built with hydration support
		 *
		 * @cli hydration
		 * @env HYDRATION
		 *
		 * @param {boolean=} [def] - default value
		 * @returns {boolean}
		 */
		hydration(def = this.ssr) {
			return o('hydration', {
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
		 * @param {number=} [def] - default value
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
		 * Returns true if all resources from the initial entry point should be embedded in HTML files
		 *
		 * @cli inline-initial
		 * @env INLINE_INITIAL
		 *
		 * @param {boolean=} [def] - default value
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
			 * @returns {!Object}
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
			 * @param {number=} [def] - default value
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
		 * Returns the `webpack.aliases` value
		 *
		 * @see https://webpack.js.org/configuration/resolve/#resolvealias
		 * @returns {!Object}
		 */
		aliases() {
			return {};
		},

		/**
		 * Returns the `webpack.externals` value
		 * @returns {!Object}
		 */
		externals() {
			return {
				vue: 'root Vue',
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
		 * @param {(boolean|string)=} [def] - default value
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
		 * @default `true`
		 *
		 * @param {boolean=} [def] - default value
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
		 * @param args
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
			const
				{concatURLs} = require('@v4fire/core/lib/core/url');

			let pathVal = o('public-path', {
				env: true,
				default: concatURLs('/', this.config.src.rel('clientOutput'))
			});

			if (!Object.isString(pathVal)) {
				pathVal = '';
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
				return concatURLs(pathVal, '/').replace(/^[/]+/, '/');
			}

			return pathVal;
		},

		/**
		 * Returns the `output.filename` value.
		 * The method can take a dictionary with values to expand macros.
		 *
		 * @param vars
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
				res = this.mode() !== 'production' || this.ssr || this.fatHTML() ? '[name]' : '[hash]_[name]';

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
		 * @param vars
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

			if (this.mode() !== 'production' || this.ssr || this.fatHTML()) {
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
		 * @param [def] - default value
		 * @returns {Object}
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
	 * 1. server - options for compiling the app as a node.js library;
	 * 2. client - options for compiling the app as a client app.
	 *
	 * @override
	 * @returns {{server: !Object, client: !Object}}
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
	 * Returns parameters for `stylus-loader`
	 * @returns {!Object}
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
	 * @returns {!Object}
	 */
	css() {
		return {};
	},

	/**
	 * Returns parameters for `CssMinimizerPlugin`
	 * @returns {!Object}
	 */
	cssMinimizer() {
		return {};
	},

	/**
	 * Returns parameters for `MiniCssExtractPlugin`
	 * @returns {!Object}
	 */
	miniCssExtractPlugin() {
		return {};
	},

	/**
	 * Returns parameters for `Statoscope`
	 *
	 * @see https://github.com/statoscope/statoscope/tree/master/packages/webpack-plugin#usage
	 * @returns {!Object}
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
	 * Returns parameters for `postcss-loader`
	 * @returns {!Object}
	 */
	postcss() {
		return {};
	},

	/**
	 * Returns parameters for `postcss/autoprefixer`
	 * @returns {!Object}
	 */
	autoprefixer() {
		return {remove: false};
	},

	/**
	 * Returns parameters for `style-loader`
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
		 * Returns the default application theme name to use
		 *
		 * @cli t
		 * @env THEME
		 *
		 * @param {string=} [def] - default value
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
		 * or `true` to pass all themes from the design system
		 *
		 * @cli include-themes
		 * @env INCLUDE_THEMES
		 *
		 * @param {string=} [def] - default value
		 * @returns {!Array<string>|boolean}
		 */
		include(def) {
			return o('include-themes', {
				env: true,
				default: def
			});
		},

		/**
		 * Returns the attribute name to set the topic value to the root element
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
	 * Returns parameters for `snakeskin-loader`:
	 *
	 * 1. server - for .ess files;
	 * 2. client - for .ss files.
	 *
	 * @returns {{server: !Object, client: !Object}}
	 */
	snakeskin() {
		const
			snakeskinVars = include('build/snakeskin/vars');

		return {
			client: this.extend(super.snakeskin(), {
				adapter: 'ss2vue3',

				adapterOptions: {
					ssr: this.webpack.ssr,
					ssrCssVars: {}
				},

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
	 * Returns parameters for `html-loader`
	 *
	 * @see https://webpack.js.org/loaders/html-loader/#options
	 * @returns {!Object}
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
				minifyJS: true,
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
	 * @returns {!Object}
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
	 * Returns parameters for `typograf`
	 * @returns {!Object}
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
		 *
		 * @default `inlineSingleHTML`
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
		 * @param {string=} [def] - default value
		 * @returns {!Array<Language>}
		 *
		 * @example
		 * ```bash
		 * npx webpack --env supported-locales=en,ru
		 * ```
		 */
		supportedLocales(def = this.config.locale) {
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

			'prelude/test-env': !isProd
		};
	},

	/**
	 * Returns a component dependency map.
	 * This map can be used to provide dynamic component dependencies in `index.js` files.
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
	 *   .dependencies(...require('@config/config').componentDependencies()['b-dummy'] ?? []);
	 * ```
	 */
	componentDependencies() {
		return {};
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
