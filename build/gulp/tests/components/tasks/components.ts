/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Gulp } from 'gulp';

export default function build(gulp: Gulp): void {
	/**
	 * Builds and runs tests for all components.
	 * Arguments:
	 *
	 * * [--processes] | [-p] - number of available CPUs to build the application and run tests
	 * * [--test-processes] | [-tp] - number of available CPUs to run tests
	 * * [--build-processes] | [-tb] - number of available CPUs to build the application
	 * * [--only-run] - allows run all test cases without the building stage
	 *
	 * @see test:component:run
	 * @see test:component:build
	 *
	 * @example
	 * ```bash
	 * npx gulp test:components -p 16
	 * ```
	 */
	gulp.task('test:components', async () => {
		// ....
	});
}
