/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	setComponentLayer = include('build/ts-transformers/set-component-layer'),
	registerComponentParts = include('build/ts-transformers/register-component-parts');

/**
 * Returns a settings object for configuring TypeScript transformers
 * @returns {object}
 */
module.exports = () => ({
	before: [setComponentLayer, registerComponentParts],
	after: {},
	afterDeclarations: {}
});
