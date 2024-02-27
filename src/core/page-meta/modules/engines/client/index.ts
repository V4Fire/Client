/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-static-page/modules/page-meta-data/README.md]]
 * @packageDocumentation
 */

export default class CSREngine<T extends HTMLElement> {
	create(tag: string, attrs: Dictionary<string>): T {
		// const
		// 	elements = this.find(tag, attrs);
		//
		// if (Object.isEmpty(elements)) {
			const el = Object.assign(<T>globalThis.document.createElement(tag), attrs);
			return globalThis.document.head.appendChild(el);
		// }
		//
		// return elements.item(0);
	}

	remove(tag: string, attrs: Dictionary<string>): NodeListOf<T> {
		const elements = this.find(tag, attrs);
		elements.forEach((element) => globalThis.document.head.removeChild(element));

		return elements;
	}

	update(tag, attrs, newAttrs): T {
		const elements = this.find(tag, attrs);
		return Object.assign(elements.item(0), newAttrs);
	}

	find(tag: string, attrs: Dictionary<string> = {}): NodeListOf<T> {
		const selector = Object.entries(attrs).map(
			([attr, value]) => `[${attr}=${value}]`
		);

		return globalThis.document.querySelectorAll<T>(tag + selector.join(''));
	}
}
