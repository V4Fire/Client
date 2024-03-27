/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Engine } from 'core/page-meta-data/elements/abstract/engines/interface';

/**
 * Engine for client-side rendering
 */
export default class CSREngine<T extends HTMLElement> implements Engine {
	/** {@link Engine.create}*/
	create(tag: string, attrs: Dictionary<string>): T {
		return Object.assign(<T>globalThis.document.createElement(tag), attrs);
	}

	/** {@link Engine.render}*/
	render(el: T): T {
		return <T>globalThis.document.head.appendChild(el);
	}

	/** {@link Engine.remove}*/
	remove(el: T): T {
		return globalThis.document.head.removeChild(el);
	}

	/** {@link Engine.update}*/
	update(el: T, attrs): T {
		return Object.assign(el, attrs);
	}
}
