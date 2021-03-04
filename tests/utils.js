/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	arg = require('arg'),
	path = require('upath');

const
	pzlr = require('@pzlr/build-core');

/**
 * Class provides API to work with launching / configuring / receiving tests
 */
class TestUtils {
	/**
	 * @param {Object=} [options]
	 * @returns {Function}
	 */
	getCurrentTest(options) {
		const
			args = arg({'--name': String, '--test-entry': String}, {permissive: true}),
			{runner} = globalThis.V4FIRE_TEST_ENV;

		options = {
			testDirPath: args['--test-entry'] || `${args['--name']}/test`,
			runnerPath: runner,
			...options
		};

		const
			testDirPath = pzlr.resolve.blockSync(options.testDirPath),
			testPath = path.join(options.runnerPath ?? testDirPath);

		return require(testPath);
	}
}

module.exports = new TestUtils();
