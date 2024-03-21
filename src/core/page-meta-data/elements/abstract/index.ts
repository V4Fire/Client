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
 * Abstract class for page meta data element
 */
export abstract class AbstractElement<T extends HTMLElement = HTMLElement> {
	/**
	 * The element's tag
	 */
	protected tag!: string;

	/**
	 * The element's instance due to the environment
	 */
	protected el!: T | this;

	/**
	 * The element's attributes
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
	remove(): T | this {
		return <T>this.engine.remove(this.el);
	}

	/**
	 * Updates the element due to the environment
	 */
	update(attrs: Dictionary<string>): T | this {
		Object.assign(this.attrs, attrs);
		return <T>this.engine.update(this.el, this.attrs);
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
