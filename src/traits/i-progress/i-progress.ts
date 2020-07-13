/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-progress/README.md]]
 * @packageDocumentation
 */

import { ModsDecl } from 'super/i-block/i-block';

export default abstract class iProgress {
	/**
	 * Progress modifiers
	 */
	static readonly mods: ModsDecl = {
		progress: [
			'true',
			'false'
		]
	};
}
