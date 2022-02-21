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
	 * Runs tests for the specified component.
	 * Arguments:
	 *
	 * * [--port] - port to launch the test server
	 * * [--start-port] - starting port for `portfinder`
	 * * [--page='p-v4-components-demo'] - demo page to run tests
	 * * [--browsers] - list of browsers to test (firefox (ff), chromium (chrome), webkit (wk))
	 * * [--device] - name of used device, for instance, "iPhone_11" or "Pixel_2"
	 * * [--close=true] - should or not close the running browsers after finishing the tests
	 * * [--headless=true] - should or not run browsers with the headless option
	 * * [--test-entry] - directory with entry points to build the application
	 *
	 * Make sure that that all components you want to test are declared as dependencies
	 * into `index.js` file of the demo page.
	 *
	 * @example
	 * ```bash
	 * npx gulp test:component:run --test-entry base/b-router/test'
	 * ```
	 */
	gulp.task('test:component:run', async () => {
		// ....
	});
}
