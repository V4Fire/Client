'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	url = require('url'),
	config = require('@v4fire/core/config/default'),
	concatUrls = require('urlconcat').concat,
	o = require('uniconf/options').option;

module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
	__proto__: config,

	apiURL() {
		return this.api.proxy ? concatUrls(this.pathname(), 'api') : this.api.url;
	},

	api: {
		proxy: true,

		url: o('api-url', {
			env: true
		}),

		schema: {

		}
	},

	port: o('port', {
		env: true,
		type: 'number',
		default: 3333,
		validate(value) {
			return Number.isFinite(value) && (value > 0) && (value < 65536);
		}
	}),

	host() {
		return o('host-url', {
			env: true,
			default: `http://localhost:${this.port}/`
		});
	},

	pathname() {
		return o('base-path', {
			env: true,
			default: url.parse(this.host()).pathname || '/'
		});
	},

	build: {
		single: o('single-build', {
			env: true
		}),

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
		externals: {
			'collection.js': '$C',
			'eventemitter2': 'EventEmitter2',
			'localforage': 'localforage',
			'sugar': 'Sugar',
			'vue': 'Vue',
			'chart.js': 'Chart',
			'ion-sound': 'ion',
			'socket.io-client': 'io',
			'setimmediate': 'setImmediate'
		},

		fatHTML: false,
		devtool: false,

		hashLength() {
			return !isProd || this.fatHTML ? false : 15;
		},

		dataURILimit() {
			return this.fatHTML ? false : 4096;
		},

		output() {
			return this.fatHTML ? '[name]' : '[hash]_[name]';
		},

		assetsJSON() {
			return 'assets.json';
		}
	},

	imageOpts: {
		mozjpeg: {
			progressive: true,
			quality: 65
		},

		optipng: {
			enabled: false,
		},

		pngquant: {
			quality: '65-90',
			speed: 4
		},

		gifsicle: {
			interlaced: false,
		},

		webp: {
			quality: 75
		},

		svgo: {

		}
	},

	html: {
		useShortDoctype: true,
		conservativeCollapse: true,
		removeAttributeQuotes: true,
		removeComments: isProd,
		collapseWhitespace: isProd
	},

	postcss: {

	},

	autoprefixer: {

	},

	uglify: {

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
		return {
			client: this.extend(super.snakeskin(), {
				adapter: 'ss2vue',
				adapterOptions: {transpiler: true},
				tagFilter: 'vueComp',
				tagNameFilter: 'vueTag',
				bemFilter: 'bem2vue'
			}),

			server: super.snakeskin()
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
	}
});
