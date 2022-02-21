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
	 * Builds an application to test the specified component.
	 * Arguments:
	 *
	 * * [--client-output] - directory to save the generated code
	 * * [--cache-type='memory'] - webpack cache type
	 * * [--public-path] - webpack publicPath value
	 * * [--es='ES2019'] - version of the used ECMAScript specification to generate
	 *
	 * @example
	 * ```bash
	 * npx gulp test:component:build
	 * ```
	 */
	gulp.task('test:component:build', async () => {
		// ....
	});
}
