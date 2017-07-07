'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const {env} = process;
require('dotenv').config();

const
	path = require('path'),
	s = JSON.stringify;

function getENVs(s = (s) => s) {
	return {
		env: s(env.NODE_ENV),
		service: s(env.SERVICE_NAME),
		host: {
			guest: s(env.GUEST_HOST),
			api: s(env.API_HOST),
			admin: s(env.ADMIN_HOST)
		}
	};
}

module.exports = {
	clientGlobals: {
		'process.env': {
			NODE_ENV: s(env.NODE_ENV)
		}
	},

	envs: getENVs(),
	externals: {
		'collection.js': '$C',
		'eventemitter2': 'EventEmitter2',
		'localforage': 'localforage',
		'urijs': 'URI',
		'page': 'page',
		'ion-sound': 'ion',
		'deep-diff': 'DeepDiff',
		'jquery': 'jQuery',
		'sugar': 'Sugar',
		'vue': 'Vue',
		'humanize-duration': 'humanizeDuration',
		'chart.js': 'Chart'
	},

	snakeskin: {
		base: {
			pack: false,
			vars: getENVs(),
			filters: {global: ['undef']},
			adapterOptions: {transpiler: true}
		},

		client: {
			adapter: 'ss2vue',
			tagFilter: 'vueComp',
			tagNameFilter: 'vueTag',
			bemFilter: 'bem2vue'
		},

		server: {

		}
	},

	babel: {
		base: {
			plugins: [
				'syntax-flow',
				'transform-flow-strip-types',
				'transform-decorators-legacy',
				'transform-class-properties',
				'transform-es2015-object-super',
				'transform-function-bind',
				['transform-es2015-modules-commonjs', {loose: true}],
				['transform-object-rest-spread', {useBuiltIns: true}],
				['transform-runtime', {
					helpers: true,
					polyfill: false,
					regenerator: false
				}]
			],

			compact: false
		},

		server: {
			resolveModuleSource(source, from) {
				if (path.isAbsolute(source) || /^(\.|babel-runtime)/.test(source)) {
					return source;
				}

				const p = path.posix;
				return p.relative(p.dirname(from.replace(/.*?src\//, '')), p.join('./server', source));
			},

			plugins: [
				'transform-strict-mode'
			]
		},

		client: {
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
			],

			compact: false
		}
	},

	db: {
		autoIndex: true,
		uri: env.MONGOHQ_URL
	},

	redis: {
		scope: /production/.test(env.SERVICE_NAME) ? 'production' : 'staging',
		url: env.REDIS_URL
	}
};
