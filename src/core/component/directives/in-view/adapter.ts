/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { deprecate } from 'core/functools/deprecation';

import MutationObserverStrategy from 'core/component/directives/in-view/mutation';
import IntersectionObserverStrategy from 'core/component/directives/in-view/intersection';

import {

	InViewGroup,
	InitOptions,
	ObservableElement,
	ObservableThresholdMap

} from 'core/component/directives/in-view/interface';

import { valueValidator } from 'core/component/directives/in-view/helpers';

export type ObserveStrategy =
	IntersectionObserverStrategy |
	MutationObserverStrategy;

export default class InViewAdapter {
	/**
	 * Observer adaptee
	 */
	protected adaptee?: ObserveStrategy;

	/**
	 * True if an adapter instance has an adaptee
	 */
	get hasAdaptee(): boolean {
		return this.adaptee !== undefined;
	}

	/**
	 * Sets an adaptee
	 * @param instance
	 */
	setInstance(instance: ObserveStrategy): void {
		this.adaptee = instance;
	}

	/**
	 * Returns true if an adaptee type is 'mutation'
	 * @param adaptee
	 */
	isMutation(adaptee: ObserveStrategy): adaptee is MutationObserverStrategy {
		return adaptee.type === 'mutation';
	}

	/**
	 * Returns true if an adaptee type is 'observer'
	 * @param adaptee
	 */
	isIntersection(adaptee: ObserveStrategy): adaptee is IntersectionObserverStrategy {
		return adaptee.type === 'observer';
	}

	/**
	 * Starts observing the specified element
	 *
	 * @param el
	 * @param params
	 */
	observe(el: Element, params: CanArray<InitOptions>): false | undefined {
		if (!this.adaptee) {
			return false;
		}

		params = Array.concat([], params);

		for (let i = 0; i < params.length; i++) {
			if (valueValidator(params[i])) {
				this.adaptee.observe(el, params[i]);
			}
		}
	}

	/**
	 * Suspends elements by the specified group.
	 *
	 * Calling this method will temporarily (until `unsuspend` will be called)
	 * stop observing elements that match the specified group
	 *
	 * @param group
	 */
	suspend(group: InViewGroup): void;

	/**
	 * Suspends the specified element
	 *
	 * @param el
	 * @param threshold
	 */
	suspend(el: Element, threshold: number): void;

	suspend(groupOrElement: InViewGroup | Element, threshold?: number): void {
		return this.adaptee?.suspend(groupOrElement, threshold);
	}

	/**
	 * Unsuspends the specified element
	 *
	 * @param el
	 * @param threshold
	 */
	unsuspend(el: Element, threshold: number): void;

	/**
	 * Unsuspends the specified group of elements
	 * @param group
	 */
	unsuspend(group: InViewGroup): void;

	unsuspend(groupOrElement: InViewGroup | Element, threshold?: number): void {
		return this.adaptee?.unsuspend(groupOrElement, threshold);
	}

	/**
	 * Re-initialize observation of the specified element
	 *
	 * @param el
	 * @param threshold
	 */
	reObserve(el: Element, threshold: number): void;

	/**
	 * Re-initialize observation of the specified group
	 * @param group
	 */
	reObserve(group: InViewGroup): void;

	reObserve(groupOrElement: InViewGroup | Element, threshold?: number): void {
		return this.adaptee?.reObserve(groupOrElement, threshold);
	}

	/**
	 * @see [[InViewAdapter.prototype.remove]]
	 * @deprecated
	 */
	stopObserve(el: Element, threshold?: number): boolean {
		deprecate({
			type: 'function',
			alternative: 'inViewAdapter.remove',
			name: 'inViewAdapter.stopObserve'
		});

		return this.remove(el, threshold);
	}

	/**
	 * Removes an element from observable elements
	 *
	 * @param el
	 * @param [threshold]
	 */
	remove(el: Element, threshold?: number): boolean {
		if (!this.adaptee) {
			return false;
		}

		return this.adaptee.unobserve(el, threshold);
	}

	/**
	 * Checks if elements is in view
	 */
	check(): void {
		if (!this.adaptee || this.isIntersection(this.adaptee)) {
			return;
		}

		this.adaptee.check();
	}

	/**
	 * Recalculates the elements position map
	 * @param deffer
	 */
	recalculate(deffer: boolean): void {
		if (!this.adaptee || this.isIntersection(this.adaptee)) {
			return;
		}

		if (deffer) {
			return this.adaptee.recalculateDeffer();
		}

		this.adaptee.recalculate();
	}

	/**
	 * Calls an observable callback
	 * @param observable
	 */
	call(observable: ObservableElement): void {
		if (!this.adaptee) {
			return;
		}

		this.adaptee.call(observable);
	}

	/**
	 * Returns a threshold map of the specified element
	 * @param el
	 */
	getThresholdMap(el: Element): CanUndef<ObservableThresholdMap> {
		if (!this.adaptee) {
			return;
		}

		return this.adaptee.getThresholdMap(el);
	}

	/**
	 * Returns an observable element
	 *
	 * @param el
	 * @param threshold
	 */
	get(el: Element, threshold: number): CanUndef<ObservableElement> {
		if (!this.adaptee) {
			return;
		}

		return this.adaptee.getEl(el, threshold);
	}

	/**
	 * Normalizes the specified directive options
	 * @param opts
	 */
	protected normalizeOptions(opts: InitOptions): InitOptions {
		return opts;
	}
}
