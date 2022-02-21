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
	 * Builds and runs tests for the specified component
	 *
	 * @see test:component:build
	 * @see test:component:run
	 *
	 * @example
	 * ```bash
	 * npx gulp test:component --browsers ff,chrome
	 * ```
	 */
	gulp.task('test:component', async () => {
		// ....
	});
}
