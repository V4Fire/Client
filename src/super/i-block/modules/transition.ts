/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import Block from 'super/i-block/modules/block';

import symbolGenerator from 'core/symbol';
import Async, { AsyncOpts } from 'core/async';

export type StyleValue = string | number;
export type StyleDictionary = Dictionary<StyleValue>;
export type PropertyValue = StyleValue | [StyleValue, number] | [StyleValue, number, number];

export const nonAnimatedProperties = {
	transition: true,
	display: true,
	duration: true,
	pointerEvents: true
};

export const
	$$ = symbolGenerator();

export interface Properties extends Dictionary<PropertyValue> {
	duration?: number;
	delay?: number;
}

export interface TransitionOptions {
	timingFn?: string;
	delay?: string;
}

export type Target = HTMLElement | string;
export type AsyncLabel = AsyncOpts['label'];
export type NonAnimatedProperties = typeof nonAnimatedProperties;

/**
 * Base class from Animation API
 */
export default class Transition {
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
	protected get self(): Transition {
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

	protected get asyncOpts(): AsyncOpts {
		return {
			group: '[[ANIMATE]]'
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
	 * @param label
	 */
	create(label: AsyncLabel): Transition {

	}

	/**
	 * Starts an animation
	 *
	 * @param props
	 * @param duration
	 * @param [opts]
	 */
	run(el: Target, props: StyleDictionary, duration: number, opts?: TransitionOptions): Promise<Transition> {

	}

	/**
	 * Shows an element
	 *
	 * @param props
	 * @param [duration]
	 * @param [opts]
	 */
	visible(el: Target, styles: StyleDictionary = {}, duration?: number, opts?: TransitionOptions): Promise<Transition> {

	}

	/**
	 * Hides an element
	 *
	 * @param props
	 * @param [duration]
	 * @param [opts]
	 */
	hide(el: Target, styles: StyleDictionary = {}, duration?: number, opts?: TransitionOptions): Promise<Transition> {

	}

	/**
	 * Returns a DOM element by specified element name
	 * @param el
	 */
	protected getEl(el: Target): CanUndef<HTMLElement> {
		return el instanceof HTMLElement ? el : this.block.element(el);
	}

	/**
	 * Creates a new loopback promise
	 * @param label
	 */
	protected getLoopback(label: AsyncLabel): Promise<Transition> {
		return this.async.promise<Transition>(new Promise((r) => r(this.self)), this.getAsyncOpts(label));
	}

	/**
	 * Creates a transition string
	 *
	 * @param props
	 * @param duration
	 * @param [opts]
	 */
	protected getTransitionString(props: StyleDictionary, duration: number, opts?: TransitionOptions): string {
		return '';
	}

	/**
	 * Generates a promise which waiting for all transitions ends
	 */
	protected awaiter(el: HTMLElement, props: Properties, label: AsyncOpts = {}): Promise<Transition> {
		const
			{async: $a} = this,
			keys = Object.keys(Object.reject(props, nonAnimatedProperties));

		return $a.promise<Transition>(new Promise<Transition>((r) => {
			let
				animateCounter = 0;

			$a.on(<HTMLElement>el, 'transitionend', (e: TransitionEvent) => {
				if (!e.target || e.target !== el || !props[e.propertyName]) {
					return;
				}

				animateCounter++;

				if (animateCounter === keys.length) {
					r(this.self);
				}

			// FIXME: Добавить опции асинка
			}, {});

		}).catch((err) => {
			stderr(err);
			return this.self;
		}));
	}

	/**
	 * Sets a specified styles to an element
	 */
	protected setStyles(el: HTMLElement, props: Properties, duration?: number, delay?: number): void {
		const
			{async: $a} = this,
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

			transitionString = `${transitionString}${i > 0 ? ',' : ''}${propName} ${duration}s ${delay}s`;
			resultStyles[propName] = value;
		}

		el.style.transition = transitionString;

		// tslint:disable-next-line: prefer-object-spread
		$a.requestAnimationFrame(() => Object.assign(el.style, resultStyles));
	}
}

/*
	this.animate($$.label)
		.visible('root-wrapper', {opacity: 1}?, 800?, 500?) -> instanceof Animate; (creates a new Promise, puts it in stack)
		.run('overlay', {opacity: 1, transform: 'translate3d(0, 0, 0)'}, 800, 0?) -> instanceof Animate; (
			create a new Promise, pop last from stack, subscribe to end, run on last promise is done
		)

	this.animate.reverse($$.label) -> Promise; (reverse a stack?)
	this.animate.cancel($$.label, {gracefully: boolean}) -> Promise; ()
	this.animate.remove($$.label) -> boolean;
	this.animate.stop($$.label); -> boolean; // How to implement with transition?
*/
