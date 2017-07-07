'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('dotenv').config();

const
	$C = require('collection.js'),
	path = require('path'),
	config = require('@v4fire/core/config/default');

const
	s = JSON.stringify,
	{env} = process;

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

module.exports = $C.extend(true, {}, config, {
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
		'sugar': 'Sugar',
		'vue': 'Vue'
	},

	snakeskin: {
		client: {
			vars: getENVs(),
			adapter: 'ss2vue',
			tagFilter: 'vueComp',
			tagNameFilter: 'vueTag',
			bemFilter: 'bem2vue'
		}
	},

	babel: {
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
	}
});
