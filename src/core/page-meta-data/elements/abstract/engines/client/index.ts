/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Engine } from 'core/page-meta-data/elements/abstract/engines/interface';

export default class CSREngine<T extends HTMLElement> implements Engine<T> {
	create(tag: string, attrs: Dictionary<string>): T {
		return  Object.assign(<T>globalThis.document.createElement(tag), attrs);
		// return globalThis.document.head.appendChild(el);
	}

	render(el: T): T {
		return globalThis.document.head.appendChild(el);
	}

	remove(el: T): T {
		return globalThis.document.head.removeChild(el);
	}

	update(el: T, attrs: Dictionary<string>): T {
		return Object.assign(el, attrs);
	}

	// find(tag: string, attrs: Dictionary<string> = {}): NodeListOf<T> {
	// 	const selector = Object.entries(attrs).map(
	// 		([attr, value]) => `[${attr}=${value}]`
	// 	);
	//
	// 	return globalThis.document.querySelectorAll<T>(tag + selector.join(''));
	// }
}
