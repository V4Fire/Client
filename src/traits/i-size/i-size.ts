/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-size/README.md]]
 * @packageDocumentation
 */

import type { ModsDecl } from 'super/i-block/i-block';

export * from 'traits/i-size/interface';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default abstract class iSize {
	/**
	 * Trait modifiers
	 */
	static readonly mods: ModsDecl = {
		size: [
			's',
			['m'],
			'l'
		]
	};
}
