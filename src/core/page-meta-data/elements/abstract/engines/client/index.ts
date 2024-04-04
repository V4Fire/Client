/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Engine } from 'core/page-meta-data/elements/abstract/engines/interface';

export class CSREngine<T extends HTMLElement> implements Engine {
	/** {@link Engine.create} */
	create(tag: string, attrs: Dictionary<string>): T {
		return Object.assign(<T>document.createElement(tag), attrs);
	}

	/** {@link Engine.render} */
	render(el: T): T {
		return document.head.appendChild(el);
	}

	/** {@link Engine.remove} */
	remove(el: T): T {
		return document.head.removeChild(el);
	}

	/** {@link Engine.update} */
	update(el: T, attrs: Dictionary<string>): T {
		return Object.assign(el, attrs);
	}
}

export const csrEngine = new CSREngine();
