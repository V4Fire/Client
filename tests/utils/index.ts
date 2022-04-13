/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import arg from 'arg';
import path from 'upath';

import pzlr from '@pzlr/build-core';

import type { GetCurrentTestOptions } from 'tests/utils/interface';

export * from 'tests/utils/interface';

/**
 * Class provides API to work with launching / configuring / receiving tests
 */
class TestUtils {
	/**
	 * @param {Object=} [options]
	 */
	getCurrentTest(options?: GetCurrentTestOptions) {
		const
			args = arg({'--name': String, '--test-entry': String}, {permissive: true}),
			{runner} = globalThis.V4FIRE_TEST_ENV;

		options = {
			// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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

const instance = new TestUtils();

export default instance;
