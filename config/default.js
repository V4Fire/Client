'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	path = require('path'),
	defConfig = require('@v4fire/core/config/default');

const config = module.exports = $C.extend(defConfig.extend, Object.create(defConfig), {
	src: {
		client: [path.join(__dirname, '../src')].concat(defConfig.src.client)
	},

	globals: {
		'process.env': {
			NODE_ENV: JSON.stringify(process.env.NODE_ENV)
		}
	},

	externals: {
		'collection.js': '$C',
		'eventemitter2': 'EventEmitter2',
		'localforage': 'localforage',
		'urijs': 'URI',
		'sugar': 'Sugar',
		'vue': 'Vue',
		'chart.js': 'Chart',
		'ion-sound': 'ion'
	},

	monic: {
		styl: {
			flags: {
				'+:*': true
			}
		}
	}
});

config.favicons = {
	appName: config.appName,
	background: '#3D7D73',
	path: '../../assets/favicons/',
	display: 'standalone',
	orientation: 'portrait',
	version: 1.0,
	logging: false
};

config.snakeskin = {
	client: $C.extend(true, {}, defConfig.snakeskin, {
		adapter: 'ss2vue',
		tagFilter: 'vueComp',
		tagNameFilter: 'vueTag',
		bemFilter: 'bem2vue'
	}),

	server: $C.extend(true, {}, defConfig.snakeskin)
};
