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
	defConfig = require('@v4fire/core/config/default');

const {env} = process;
function getENVs(s = (s) => s) {
	return {
		env: s(env.NODE_ENV),
		service: s(env.SERVICE_NAME),
		appName: s(env.APP_NAME)
	};
}

const config = module.exports = $C.extend(true, {}, defConfig, {
	envs: getENVs(),
	globals: {
		'process.env': {
			NODE_ENV: JSON.stringify(env.NODE_ENV)
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
	client: Object.assign({}, defConfig.snakeskin, {
		vars: getENVs(),
		adapter: 'ss2vue',
		tagFilter: 'vueComp',
		tagNameFilter: 'vueTag',
		bemFilter: 'bem2vue'
	}),

	server: Object.assign({}, defConfig.snakeskin, {
		vars: getENVs()
	})
};

config.babel = {
	base: $C.extend(
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

	get withRuntime() {
		const
			config = $C.extend(true, {}, this.base),
			pl = config.plugins,
			pos = $C(pl).search((el) => (Array.isArray(el) ? el[0] : el) === 'transform-runtime');

		pl[pos === -1 ? pl.length : pos] = ['transform-runtime', {
			helpers: false,
			polyfill: false,
			regenerator: false
		}];

		return pl;
	}
};
