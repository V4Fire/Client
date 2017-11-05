'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('path'),
	config = require('@v4fire/core/config/default');

module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
	__proto__: config,

	monic() {
		return {
			styl: {
				flags: {
					'+:*': true
				}
			}
		};
	},

	favicons() {
		const
			config = require('config');

		return {
			appName: config.appName(),
			path: path.join(config.src.assets(), 'favicons'),
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
	}
});
