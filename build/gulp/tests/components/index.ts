/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Gulp } from 'gulp';
import initTasks from 'build/gulp/tests/components/tasks';

export default function init(gulp: Gulp = require('gulp')): void {
	initTasks(gulp);
}
