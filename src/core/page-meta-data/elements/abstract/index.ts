/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Engine } from 'core/page-meta-data/elements/abstract/engines';

export * from 'core/page-meta-data/elements/abstract/engines/index';

export abstract class AbstractElement<T extends HTMLElement = HTMLElement> {
	protected tag!: string;

	protected el!: T | this;

	protected attrsStore!: Dictionary<string>;

	protected engine!: Engine<T>;

	get(): T | this {
		return this.el;
	}

	get attrs(): Dictionary<string> {
		return {...this.attrsStore};
	}

	set attrs(attrs: Dictionary<string>) {
		this.attrsStore = attrs;
	}

	protected constructor(engine: Engine<T>, tag: string, attrs: Dictionary<string> = {}) {
		this.tag = tag;
		this.attrs = attrs;
		this.engine = engine;

		this.el = this.create();
	}

	/**
	 * Creates the element due to the environment
	 */
	create(): T | this {
		return this.engine.create?.(this.tag, this.attrs) ?? this;
	}

	render() {
		return this.engine.render(this.el, this.tag, this.attrs);
	}

	remove() {
		return this.engine.remove?.(this.el);
	}

	update(attrs: Dictionary<string>) {
		Object.assign(this.attrs, attrs);
		return this.engine.update(this.el, this.attrs);
	}

	// find() {
	// 	return this.engine.find?.(this.tag, this.attrs);
	// }

	is(tag: string, attrs: Dictionary<string> = {}): boolean {
		return tag === this.tag &&
			Object.keys(attrs).every((key) => attrs[key] === this.attrs[key]);
	}

	getAttr(attr: string): string {
		return this.attrs[attr] ?? '';
	}

	equals(element: AbstractElement) {
		// this.tag === element.tag &&
		// 	Object
	}
}
