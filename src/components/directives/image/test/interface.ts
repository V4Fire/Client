/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Locator } from 'playwright';

export interface ImageTestLocators {
	wrapper: Locator;
	container: Locator;
	image: Locator;
	picture: Locator;
}
