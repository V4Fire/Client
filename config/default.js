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
	o = require('uniconf/options').option;

module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
	__proto__: config,

	build: {
		entries: o('entries', {
			env: true,
			short: 'e',
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
			'collection.js': '$C',
			'eventemitter2': 'EventEmitter2',
			'localforage': 'localforage',
			'sugar': 'Sugar',
			'vue': 'Vue',
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

		publicPath() {
			return this.fatHTML() ? '' : o('public-path', {
				env: true,
				default: ''
			});
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
		}
	},

	imageOpts() {
		return {
			svgo: {

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
		return {};
	},

	uglify() {
		return {};
	},

	monic() {
		return {
			stylus: {
				flags: {
					'+:*': true
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
			{webpack, src} = this;

		const
			snakeskinVars = include('build/snakeskin.vars.js'),
			publicPath = webpack.publicPath();

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
					root: src.cwd(),
					publicPath: (src) => publicPath + src,
					output: src.clientOutput(),
					outputPattern: webpack.output,
					hashFunction: webpack.hashFunction(),
					fatHTML: webpack.fatHTML(),
					favicons: this.favicons().path,
					assets: src.assets(),
					lib: src.lib()
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
			locale: this.lang
		};
	},
});
