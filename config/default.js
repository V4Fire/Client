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
	o = require('uniconf/options').option;

module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
	__proto__: config,

	build: {
		entries: o('entries', {
			env: true,
			coerce: (v) => v ? v.split(',') : []
		}),

		inspectComponents: o('inspect-components', {
			env: true,
			type: 'boolean'
		}),

		components: o('components', {
			env: true,
			coerce: (v) => {
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
							const dir = pzlr.resolve.blockSync(name);
							return [].concat(require(path.join(dir, 'demo.js')) || []).map((p) => ({name, ...p}));

						} catch {}

						return {name};
					});
			}
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
			return this.fatHTML() ? undefined : 2048;
		},

		externals: {
			vue: 'Vue',
			eventemitter2: 'EventEmitter2',
			setimmediate: 'setImmediate'
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
			'prod': IS_PROD,
			'debug': !IS_PROD,
			'env': process.env.NODE_ENV,

			'engine': this.engine(),
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

			'prelude/dependencies': true,
			'prelude/date/relative': true,
			'prelude/date/format': true,

			'prelude/number/rounding': true,
			'prelude/number/format': true,

			'component/async-render': true,
			'component/daemons': true,

			'directives/event': true,
			'directives/resize': false,
			'directives/image': false,
			'directives/in-view': false,
			'directives/update-on': false,

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
