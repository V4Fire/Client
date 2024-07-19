/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Engine } from 'core/page-meta-data/elements/abstract/engines';
import type { AbstractElementProperties } from 'core/page-meta-data/elements/abstract/interface';

export * from 'core/page-meta-data/elements/abstract/engines';
export * from 'core/page-meta-data/elements/abstract/interface';

export abstract class AbstractElement<T extends HTMLElement = HTMLElement> {
	/**
	 * The element's tag name
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
	 * The element's render engine
	 */
	protected engine!: Engine;

	/**
	 * @param engine - a rendering engine getter for the created element
	 * @param tag - a tag of the created element
	 * @param [attrs] - additional attributes for the created element
	 */
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
		return <Nullable<T>>this.engine.create?.(this.tag, this.attrs) ?? this;
	}

	/**
	 * Renders the element due to the environment
	 */
	render(): T | string {
		return <T>this.engine.render(this.el, this.tag, this.attrs);
	}

	/**
	 * Updates attributes of the element due to the environment
	 * @param attrs
	 */
	update(attrs: Dictionary<string>): T | this {
		Object.assign(this.attrs, attrs);
		return <T>this.engine.update(this.el, this.attrs);
	}

	/**
	 * Removes the element due to the environment
	 */
	remove(): T | this {
		return <T>this.engine.remove(this.el);
	}

	/**
	 * Returns true, if the given element has the same attributes as the current one
	 *
	 * @param tag
	 * @param [attrs]
	 */
	is(tag: string, attrs: Dictionary<string> = {}): boolean {
		return tag === this.tag && Object.keys(attrs).every((key) => attrs[key] === this.attrs[key]);
	}

	/**
	 * Returns the element due to the environment
	 */
	getElement(): T | this {
		return this.el;
	}

	/**
	 * Returns the element inner properties
	 */
	getProperties(): AbstractElementProperties {
		return {
			tag: this.tag,
			attrs: {...this.attrs}
		};
	}
}
