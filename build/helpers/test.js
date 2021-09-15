'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	arg = require('arg');

/**
 * Returns a browser instance by the specified parameters
 *
 * @param {string} browserType
 * @param {!Object} params
 * @param {!Object} options
 * @returns {!Promise<?>}
 */
exports.getBrowserInstance = function getBrowserInstance(browserType, params, options = {}) {
	const
		playwright = require('playwright');

	const args = {
		'--firefoxWsEndpoint': '',
		'--webkitWsEndpoint': '',
		'--chromiumWsEndpoint': ''
	};

	Object.keys(args).forEach((key) => {
		try {
			args[key] = arg({[key]: String}, {permissive: true})[key];

		} catch {}
	});

	const endpointMap = {
		firefox: '--firefoxWsEndpoint',
		webkit: '--webkitWsEndpoint',
		chromium: '--chromiumWsEndpoint'
	};

	if (args[endpointMap[browserType]] && !options.reInit) {
		return playwright[browserType].connect({wsEndpoint: args[endpointMap[browserType]], ...params});
	}

	return playwright[browserType].launch({args: getBrowserArgs(), ...params});
};

/**
 * Returns a list of selected browsers
 * @returns {!Array<string>}
 */
exports.getSelectedBrowsers = function getSelectedBrowsers() {
	const
		args = arg({'--browsers': String}, {permissive: true}),
		browsers = ['chromium', 'firefox', 'webkit'];

	const aliases = {
		ff: 'firefox',
		firefox: 'firefox',
		chr: 'chromium',
		chrome: 'chromium',
		chromium: 'chromium',
		wk: 'webkit',
		webkit: 'webkit'
	};

	if (args['--browsers']) {
		const customBrowsers = args['--browsers']
			.split(',')
			.map((name) => aliases[name] || null)
			.filter((name) => name);

		if (customBrowsers.length) {
			return customBrowsers;
		}
	}

	return browsers;
};

exports.getBrowserArgs = getBrowserArgs();

/**
 * Returns a list of arguments that will be provided to a browser
 * @returns {!Array<string>}
 */
function getBrowserArgs() {
	try {
		const
			args = arg({'--browser-args': String}, {permissive: true});

		if (!args['--browser-args']) {
			return [];
		}

		return args['--browser-args'].split(',').map((v) => `--${v.trim()}`);

	} catch {
		return [];
	}
}

/**
 * Generates a `--client-name` using the specified parameters
 *
 * @param {string=} name
 * @param {string=} suit
 * @returns {string}
 */
exports.getTestClientName = function getTestClientName(name, suit) {
	return `${name || 'b-dummy'}_${suit || 'demo'}`;
};
