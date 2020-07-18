/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	path = require('upath'),
	arg = require('arg'),
	pzlr = require('@pzlr/build-core'),
	dasherize = require('string-dasherize');

/**
 * Class provides API for working with launching / configuring / receiving tests
 */
class TestUtils {
	/**
	 * @param {Object=} [options]
	 * @returns {Function}
	 */
	getCurrentTest(options) {
		const
			args = arg({'--runner': String, '--name': String, '--test-entry': String}, {permissive: true}),
			runner = args['--runner'];

		options = {
			testDirPath: args['--test-entry'] || `${args['--name']}/test`,
			runnerPath: `/runners/${runner}.js`,
			...options
		};

		const
			testDirPath = pzlr.resolve.blockSync(options.testDirPath),
			testPath = path.join(testDirPath, options.runnerPath);

		return require(testPath);
	}
}

module.exports = new TestUtils();
