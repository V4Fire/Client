'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

exports.getVersion = function () {
	return require('../package.json').version;
};

exports.getHead = function (version) {
	/* eslint-disable prefer-template */
	return (
		'/*!\n' +
		' * V4Fire Client Core' + (version ? ' v' + getVersion() : '') + '\n' +
		' * https://github.com/V4Fire/Client\n' +
		' *\n' +
		' * Released under the MIT license\n' +
		' * https://github.com/V4Fire/Client/blob/master/LICENSE\n'
	);
	/* eslint-enable prefer-template */
};
