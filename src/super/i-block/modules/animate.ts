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
export type StyleDictionary = Dictionary<StyleValue>;
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
};

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
	 * Base styles for hide element
	 */
	protected get hideStyles(): StyleDictionary {
		return {
			visibility: 'hidden',
			pointerEvents: 'none',
			display: 'none'
		};
	}

	/**
	 * Base styles for show element
	 */
	protected get visibleStyles(): StyleDictionary {
		return {
			visibility: 'visible',
			pointerEvents: 'auto',
			display: ''
		};
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
	 * @param el - reference to element or element name
	 * @param props
	 *   *) duration - transition duration in ms
	 * @param [asyncOpts]
	 *
	 * @example Run animation
	 * animate.run('root-wrapper', {
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
	 * const a = animate.run('root-wrapper', {opacity: 1, duration: (2).seconds()});
	 * a.cancel();
	 *
	 * @example Delay some props
	 * animate.run('root-wrapper', {
	 * 	opacity: [1, undefined, (2).seconds()],
	 * 	duration: (1).second()
	 * })
	 *
	 * animate.run('root-wrapper', {
	 * 	opacity: [1, (1).second(), (2).seconds()]
	 * })
	 *
	 * animate.run('root-wrapper', {
	 * 	opacity: [1, (1).second()],
	 * 	delay: (1).second()
	 * })
	 */
	run(el: HTMLElement | string, props: Properties, asyncOpts: AsyncOpts = {}): Promise<Animate> {
		asyncOpts = this.getAsyncOpts(asyncOpts);

		const
			node = this.getEl(el);

		if (!this.isHTMLElement(node)) {
			return this.getLoopback(asyncOpts);
		}

		if (!node.style.transition && !props.transition && !props.time) {
			return this.getLoopback(asyncOpts);
		}

		this.setStyles(node, props);
		return this.awaiter(node, props, asyncOpts);
	}

	/**
	 * Shows an element
	 *
	 * @param el
	 * @param [asyncOpts]
	 */
	visible(el: HTMLElement | string, styles: StyleDictionary = {}, asyncOpts: AsyncOpts = {}): Promise<Animate> {
		const
			{async: $a} = this,
			node = this.getEl(el);

		if (!this.isHTMLElement(node)) {
			return this.getLoopback(asyncOpts);
		}

		return $a.promise<Animate>(new Promise((res) => {
			Object.assign(node.style, this.visibleStyles, styles);

			$a.requestAnimationFrame(() => {
				res(this.animate);
			});

		})).catch((err) => {
			stderr(err);
			return this.animate;
		});
	}

	/**
	 * Hides an element
	 *
	 * @param el
	 * @param [asyncOpts]
	 */
	hide(el: HTMLElement | string, styles: StyleDictionary = {}, asyncOpts: AsyncOpts = {}): Promise<Animate> {
		const
			{async: $a} = this,
			node = this.getEl(el);

		if (!this.isHTMLElement(node)) {
			return this.getLoopback(asyncOpts);
		}

		return $a.promise<Animate>(new Promise((res) => {
			Object.assign(node.style, this.hideStyles, styles);
			res(this.animate);
		}), asyncOpts).catch((err) => {
			stderr(err);
			return this.animate;
		});
	}

	/**
	 * Returns default async options merged with custom options
	 * @param asyncOpts
	 */
	protected getAsyncOpts(asyncOpts: AsyncOpts = {}): AsyncOpts {
		return {
			group: '[[ANIMATE]]',
			label: String(Math.random()),
			...asyncOpts
		};
	}

	/**
	 * Returns a DOM element by specified element name
	 * @param el
	 */
	protected getEl(el: HTMLElement | string): CanUndef<HTMLElement> {
		return el instanceof HTMLElement ? el : this.block.element(el);
	}

	/**
	 * Creates a new loopback promise
	 */
	protected getLoopback(asyncOpts: AsyncOpts = {}): Promise<Animate> {
		return this.async.promise<Animate>(new Promise((r) => r(this.animate)), this.getAsyncOpts(asyncOpts));
	}

	/**
	 * True if an element are instance of HTMLElement
	 * @param el
	 */
	protected isHTMLElement(el: unknown): el is HTMLElement {
		return el instanceof HTMLElement;
	}

	/**
	 * Generates a promise which waiting for all transitions ends
	 */
	protected awaiter(el: HTMLElement, props: Properties, asyncOpts: AsyncOpts = {}): Promise<Animate> {
		const
			{async: $a} = this,
			keys = Object.reject(props, nonAnimatedProperties);

		return $a.promise<Animate>(new Promise<Animate>((r) => {
			let
				animateCounter = 0;

			$a.on(<HTMLElement>el, 'transitionend', (e: TransitionEvent) => {
				if (!e.target || e.target !== el || !props[e.propertyName]) {
					return;
				}

				animateCounter++;

				if (animateCounter === keys.length) {
					r(this.animate);
				}

			}, this.getAsyncOpts(asyncOpts));

		}).catch((err) => {
			stderr(err);
			return this.animate;
		}));
	}

	/**
	 * Sets a specified styles to an element
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
