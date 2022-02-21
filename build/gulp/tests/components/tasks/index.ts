/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Gulp } from 'gulp';

import componentBuild from 'build/gulp/tests/components/tasks/component.build';
import componentRun from 'build/gulp/tests/components/tasks/component.run';
import component from 'build/gulp/tests/components/tasks/component';
import components from 'build/gulp/tests/components/tasks/components';

/**
 * Registers gulp tasks to test the project
 *
 * @see https://github.com/V4Fire/Client/blob/master/docs/tests/README.md
 *
 * @example
 * ```bash
 * # Builds an application to test the specified component
 * npx gulp test:component:build --name b-button
 *
 * # Runs tests for the specified component
 * npx gulp test:component:run --name b-button --browsers ff
 *
 * # Builds and runs tests for the specified component
 * npx gulp test:component --name b-button
 *
 * # Builds and runs tests for all components
 * npx gulp test:components -p 16
 * ```
 */
export default function init(gulp: Gulp = require('gulp')): void {
	componentBuild(gulp);
	componentRun(gulp);
	component(gulp);
	components(gulp);
}
