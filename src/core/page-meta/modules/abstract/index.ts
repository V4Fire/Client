/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import SSREngine from 'core/page-meta/modules/engines/ssr';
import CSREngine from 'core/page-meta/modules/engines/client';

export default abstract class AbstractElement<T extends HTMLElement = HTMLElement> {
	protected tag!: string;

	protected attrs!: Dictionary<string>;

	protected engine!: SSREngine | CSREngine<T>;

	protected constructor(tag: string, attrs: Dictionary<string> = {}) {
		this.tag = tag;
		this.attrs = attrs;

		this.engine = SSR ? new SSREngine() : new CSREngine<T>();
	}

	/**
	 * Creates the element due to the environment
	 */
	create() {
		return this.engine.create(this.tag, this.attrs);
	}

	remove() {
		return this.engine.remove(this.tag, this.attrs);
	}

	update(newAttrs) {
		return this.engine.update(this.tag, this.attrs, newAttrs);
	}

	find() {
		return this.engine.find(this.tag, this.attrs);
	}

	is(tag: string, attrs: Dictionary<string> = {}): boolean {
		return tag === this.tag &&
			Object.keys(attrs).every((key) => attrs[key] === this.attrs[key]);
	}

	getAttr(attr: string): string {
		return this.attrs[attr] ?? '';
	}
}
