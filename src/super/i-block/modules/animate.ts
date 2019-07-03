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

export type StyleValue = string | number;
export type StyleDictionary = Dictionary<StyleValue>
export type PropertyValue = StyleValue | [StyleValue, number] | [StyleValue, number, number];

export interface Properties extends Dictionary<PropertyValue> {
	duration?: number;
	delay?: number;
}

export const nonAnimatedProperties = {
	transition: true,
	display: true,
	duration: true,
	pointerEvents: true
}

export type NonAnimatedProperties = typeof nonAnimatedProperties;

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
	 *   *) time - transition duration in ms
	 * @param [el] - reference to element or element name
	 * @param [asyncOpts]
	 * 
	 * @example Run animation
	 * animate.run({
	 * 	opacity: [1, (2).seconds()],
	 * 	width: '100px',
	 * 	height: '400px',
	 * 	duration: (4).seconds()
	 * }).then((a: Animate) => {
	 * 	// Will be resolved after all transitions ended
	 * 	// opacity will be animating for 2 seconds
	 * 	// other properties will be animating for 4 seconds
	 * })
	 * 
	 * @example Cancel animation
	 * const a = animate.run({opacity: 1, duration: (2).seconds()});
	 * a.cancel();
	 * 
	 * @example Delay some props
	 * animate.run({
	 * 	opacity: [1, undefined, (2).seconds()],
	 * 	duration: (1).second()
	 * })
	 * 
	 * animate.run({
	 * 	opacity: [1, (1).second(), (2).seconds()]
	 * })
	 * 
	 * animate.run({
	 * 	opacity: [1, (1).second()],
	 * 	delay: (1).second()
	 * })
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

		// Object.assign(el.style, keys);
		this.setStyles(el, props);
		return this.awaiter(el, props);
	}

	/**
	 * Generates a promise which waiting for all transitions ends
	 */
	protected awaiter(el: HTMLElement, props: Properties): Promise<Animate> {
		const
			{async: $a} = this;

		return $a.promise<Animate>(new Promise<Animate>((r, rej) => {
			let
				animateCounter = 0;

			$a.on(<HTMLElement>el, 'transitionend', (e: TransitionEvent) => {
				if (!e.target || e.target !== el || !props[e.propertyName]) {
					return;
				}

				animateCounter++;

				if (animateCounter === props.length) {
					r(this.animate);
				}

			}, this.async);

		}).catch((err) => {
			stderr(err);
			return this.animate;
		}));
	}

	/**
	 * Generates a styles object
	 */
	protected setStyles(el: HTMLElement, props: Properties): void {
		const
			{duration: baseDuration, delay: baseDelay} = props,
			resultStyles: StyleDictionary = {};

		props = Object.reject(props, {duration: true, transition: true});

		let
			transitionString = '';

		for (let keys = Object.keys(props), i = 0; i < keys.length; i++) {
			const
				prop = keys[i],
				v = props[prop];

			const
				[value, a, b] = Object.isArray(v) ? v : [v, baseDuration, baseDelay],
				duration = a ? a / 1000 : 0,
				delay = b ? b / 1000 : 0,
				propName = prop.dasherize();

			if (!value || !duration) {
				continue;
			}

			transitionString = `${transitionString}${i > 0 ? ',' : ''}${propName} ${delay}s ${duration}s`;
			resultStyles[propName] = value;
		}

		resultStyles.transition = transitionString;
		Object.assign(el.style, resultStyles);
	}
}
