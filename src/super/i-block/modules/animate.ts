/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import Block from 'super/i-block/modules/block';
import Async, { AsyncOpts } from 'core/async';

/**
 * Base class from Animation API
 */
export default class Animate {
	/**
	 * Link to component async module
	 */
	protected get async(): Async {
		// @ts-ignore
		return this.component.async;
	}

	/**
	 * Link to component animate module
	 */
	protected get animate(): Animate {
		// @ts-ignore
		return this.component.animate;
	}

	/**
	 * Link to component block module
	 */
	protected get block(): Block {
		// @ts-ignore
		return this.component.block;
	}

	/**
	 * Link to component root element
	 */
	protected get $el(): HTMLElement {
		// @ts-ignore
		return this.component.$el;
	}

	/**
	 * Component instance
	 */
	protected readonly component: iBlock;

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
	}

	/**
	 * Start an animation
	 *
	 * @param props
	 * @param [el] - reference to element or element name
	 * @param [asyncOpts]
	 */
	run(
		props: Dictionary<string | number>,
		el: HTMLElement | string = this.$el,
		asyncOpts: AsyncOpts = {}
	): Promise<Animate> {
		const
			{block: $b} = this;

		asyncOpts = {
			group: '[[ANIMATE]]',
			label: String(Math.random()),
			...asyncOpts
		};

		el = el instanceof HTMLElement ? el : <HTMLElement>$b.element(el) || this.$el;

		const
			{async: $a} = this;

		if (!el || (!el.style.transition && !props.transition)) {
			return $a.promise(new Promise((r) => r(this.animate)), asyncOpts);
		}

		Object.assign(el.style, props);
		return $a.promisifyOnce(el, 'transitionend', asyncOpts).then(() => this.animate);
	}
}
