/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Engine } from 'core/page-meta-data/elements/abstract/engines';

export * from 'core/page-meta-data/elements/abstract/engines/index';

/**
 * Abstract class for page meta data elements
 */
export abstract class AbstractElement<T extends HTMLElement = HTMLElement> {
	/**
	 * Element's tag
	 */
	protected tag!: string;

	/**
	 * The element instance due to the environment
	 */
	protected el!: T | this;

	/**
	 * Element's attributes
	 */
	protected attrs!: Dictionary<string>;

	/**
	 * Render engine
	 */
	protected engine!: Engine;

	protected constructor(engine: Engine, tag: string, attrs: Dictionary<string> = {}) {
		this.tag = tag;
		this.attrs = attrs;
		this.engine = engine;

		this.el = this.create();
	}

	/**
	 * Creates the element due to the environment
	 */
	create(): T | this {
		return <T>this.engine.create?.(this.tag, this.attrs) ?? this;
	}

	/**
	 * Renders the element due to the environment
	 */
	render(): T | string {
		return <T>this.engine.render(this.el, this.tag, this.attrs);
	}

	/**
	 * Removes the element due to the environment
	 */
	remove() {
		return this.engine.remove?.(this.el);
	}

	/**
	 * Returns the element due to the environment
	 */
	get(): T | this {
		return this.el;
	}

	/**
	 * Returns true, if the element has the same attributes
	 *
	 * @param tag
	 * @param attrs
	 */
	is(tag: string, attrs: Dictionary<string> = {}): boolean {
		return tag === this.tag &&
			Object.keys(attrs).every((key) => attrs[key] === this.attrs[key]);
	}
}
