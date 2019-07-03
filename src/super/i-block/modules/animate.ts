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

export type PropertyValue = string | number | number[];

export interface Properties extends Dictionary<PropertyValue> {
	time?: number;
}

export type NonAnimatedProperties =
	'time' |
	'transition' |
	'display' |
	'pointerEvents';

export type AnimatedProperties = Omit<Dictionary<PropertyValue>, NonAnimatedProperties>;

/**
 * Base class from Animation API
 */
export default class Animate {
	/**
	 * Properties that cannot be animated
	 */
	static nonAnimatedProps: NonAnimatedProperties[] = [
		'transition',
		'display',
		'time',
		'pointerEvents'
	];

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
	 *   *) time - transition duration in ms
	 * @param [el] - reference to element or element name
	 * @param [asyncOpts]
	 */
	run(props: Properties, el: HTMLElement | string = this.$el, asyncOpts: AsyncOpts = {}): Promise<Animate> {
		asyncOpts = {
			group: '[[ANIMATE]]',
			label: String(Math.random()),
			...asyncOpts
		};

		const
			{async: $a, block: $b} = this,
			loopback = $a.promise<Animate>(new Promise((r) => r(this.animate)), asyncOpts);

		el = el instanceof HTMLElement ? el : <HTMLElement>$b.element(el);

		if (!(el instanceof HTMLElement)) {
			return loopback;
		}

		if (!el.style.transition && !props.transition && !props.time) {
			return loopback;
		}

		const
			rejected = Object.reject(props, Animate.nonAnimatedProps.concat('time')),
			keys = Object.keys(rejected),
			baseTime = props.time && props.time / 1000;

		Object.assign(el.style, rejected);
	}

	/**
	 * Generates a promise which waiting for all transition end
	 */
	protected awaiter(el: HTMLElement, props: string[]): Promise<Animate> {
		const
			{async: $a} = this;

		let
			animatedFields = 0;

		return $a.promise<Animate>(new Promise((r, rej) => {
			$a.on(<HTMLElement>el, 'transitionend', (e) => {
				animatedFields++;

				if (animatedFields === props.length) {
					r(this.animate);
				}

			}, this.async);
		}));
	}
}
