'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('upath'),
	config = require('@v4fire/core/config/default'),
	o = require('uniconf/options').option;

module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
	__proto__: config,

	build: {
		entries: o('entries', {
			env: true,
			coerce: (v) => v ? v.split(',') : []
		}),

		fast() {
			const v = o('fast-build', {
				env: true,
				type: 'boolean'
			});

			return v != null ? v : isProd;
		},

		buildGraphFromCache: o('build-graph-from-cache', {
			env: true,
			type: 'boolean'
		})
	},

	webpack: {
		devtool: false,
		hashLength: 8,

		hashFunction() {
			return !isProd || this.fatHTML() ? undefined : 'md5';
		},

		fatHTML() {
			return false;
		},

		dataURILimit() {
			return this.fatHTML() ? undefined : 4096;
		},

		externals: {
			'vue': 'Vue',
			'eventemitter2': 'EventEmitter2',
			'ion-sound': 'ion',
			'socket.io-client': 'io',
			'setimmediate': 'setImmediate'
		},

		longCache() {
			return o('long-cache', {
				default: !isProd,
				type: 'boolean'
			});
		},

		cacheDir() {
			return '[confighash]';
		},

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

		dllOutput(params) {
			return this.output(params);
		},

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

		assetsJSON() {
			return 'assets.json';
		},

		assetsJS() {
			return path.changeExt(this.assetsJSON(), '.js');
		}
	},

	imageOpts() {
		return {
			svgo: {
				removeUnknownsAndDefaults: false
			}
		};
	},

	html() {
		return {
			useShortDoctype: true,
			conservativeCollapse: true,
			removeAttributeQuotes: true,
			removeComments: isProd,
			collapseWhitespace: isProd
		};
	},

	postcss() {
		return {};
	},

	autoprefixer() {
		return {remove: false};
	},

	uglify() {
		return {};
	},

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

	runtime() {
		return {
			'engine': this.engine(),

			'socket': false,
			'noGlobals': false,
			'svgSprite': true,

			'ds-diff': false,
			'ds-vars': false,

			'blockNames': false,
			'passDesignSystem': false,

			'core/helpers': true,
			'core/browser': true,

			'core/analytics': true,
			'core/log': true,

			'core/kv-storage': true,
			'core/session': true,
			'core/net': false,

			'range/extended': false,
			'helpers/string/pluralize': true,

			'prelude/dependencies': true,
			'prelude/object/has': false,
			'prelude/object/getPrototypeChain': false,

			'prelude/date/modify': true,
			'prelude/date/relative': true,
			'prelude/date/format': true,
			'prelude/date/create': true,

			'prelude/number/rounding': true,
			'prelude/number/format': true,

			'prelude/string/underscore': true,
			'prelude/string/capitalize': true,

			'prelude/function/debounce': true,
			'prelude/function/throttle': true,

			'component/async-render': true,
			'component/daemons': true,

			'directives/event': true,
			'directives/in-view': false,

			'iData': true,
			'bRouter': true,

			'iInput/validators': true,
			'bInput/mask': true,
			'bInput/validators': true
		};
	},

	monic() {
		const
			runtime = this.runtime(),
			es = this.es();

		return {
			stylus: {
				flags: {
					runtime,
					'+:*': true
				}
			},

			typescript: {
				flags: {
					runtime,
					es
				}
			},

			javascript: {
				flags: {
					runtime,
					es
				}
			}
		};
	},

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

	snakeskin() {
		const
			{webpack, src} = this,
			snakeskinVars = include('build/snakeskin.vars');

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

					rel: src.rel,
					root: src.cwd(),
					src: src.src(),
					lib: src.lib(),

					assets: src.assets(),
					assetsJS: webpack.assetsJS(),
					favicons: this.favicons().path,

					publicPath: webpack.publicPath,
					output: src.clientOutput(),
					outputPattern: webpack.output,

					fatHTML: webpack.fatHTML(),
					hashFunction: webpack.hashFunction()
				}
			})
		};
	},

	typescript() {
		return {
			client: super.typescript(),
			worker: super.typescript(),
			server: super.typescript()
		};
	},

	css() {
		return {
			minimize: Boolean(isProd || Number(process.env.MINIFY_CSS))
		};
	},

	stylus() {
		return {
			preferPathResolver: 'webpack'
		};
	},

	typograf() {
		return {
			locale: this.locale
		};
	},
});
