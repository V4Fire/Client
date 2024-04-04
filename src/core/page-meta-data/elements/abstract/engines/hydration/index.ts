/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { CSREngine } from 'core/page-meta-data/elements';

export default class HydrationEngine<T extends HTMLElement> extends CSREngine<T> {
	override render(el: T): T {
		return el;
	}
}
