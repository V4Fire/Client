/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	setComponentLayer = include('build/ts-transformers/set-component-layer');

/**
 * Returns a settings object for setting up TypeScript transformers
 *
 * @param {import('typescript').Program} program
 * @returns {object}
 */
module.exports = (program) => ({
	before: [setComponentLayer(program)],
	after: {},
	afterDeclarations: {}
});
