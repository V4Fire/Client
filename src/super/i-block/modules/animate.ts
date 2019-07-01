/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
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
	 */
	start(el: HTMLElement, props: Dictionary<string | number>, asyncOpts: AsyncOpts = {}): Promise<Animate> {
		asyncOpts = {
			group: '[[ANIMATE]]',
			label: String(Math.random()),
			...asyncOpts
		};

		const
			{async: $a} = this;

		if (!el && !props.transition) {
			return $a.promise(new Promise((r) => r(this.animate)), asyncOpts);
		}

		Object.assign(el.style, props);
		return $a.promisifyOnce(el, 'transitionend', asyncOpts).then(() => this.animate);
	}
}
