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

config.babel = {
	client: $C.extend(
		{
			deep: true,
			concatArray: true
		},

		{},

		defConfig.babel,

		{
			plugins: [
				'transform-exponentiation-operator',
				'check-es2015-constants',
				'transform-es2015-destructuring',
				'transform-remove-strict-mode',
				'transform-es2015-arrow-functions',
				'transform-es2015-block-scoping',
				'transform-es2015-computed-properties',
				['transform-es2015-classes', {loose: true}],
				['transform-es2015-for-of', {loose: true}],
				'transform-es2015-function-name',
				'transform-es2015-literals',
				'transform-es2015-parameters',
				'transform-es2015-shorthand-properties',
				['transform-es2015-template-literals', {loose: true}],
				'transform-es2015-spread',
				'transform-regenerator'
			]
		}
	),

	clientWithRuntime() {
		const
			config = $C.extend(true, {}, this.client),
			pl = config.plugins,
			pos = $C(pl).search((el) => (Array.isArray(el) ? el[0] : el) === 'transform-runtime');

		pl[pos === -1 ? pl.length : pos] = ['transform-runtime', {
			helpers: true,
			polyfill: false,
			regenerator: false
		}];

		return pl;
	}
};
