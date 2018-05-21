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
	config = require('@v4fire/core/config/default');

module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
	__proto__: config,

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

		devtool: false
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

	dataURI: {
		limit: 4096
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
			appName: this.appName(),
			path: path.join(this.src.assets(), 'favicons'),
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
