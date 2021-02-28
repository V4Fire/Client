/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { deprecate } from 'core/functools/deprecation';

import MutationObserverStrategy from 'core/dom/in-view/mutation';
import IntersectionObserverStrategy from 'core/dom/in-view/intersection';

import {

	InViewGroup,
	InViewInitOptions,
	InViewObservableElement,
	InViewObservableThresholdMap

} from 'core/dom/in-view/interface';

import { valueValidator } from 'core/dom/in-view/helpers';

export type ObserveStrategy =
	IntersectionObserverStrategy |
	MutationObserverStrategy;

export default class InViewAdapter {
	/**
	 * Observer adaptee
	 */
	protected adaptee?: ObserveStrategy;

	/**
	 * True if the adapter instance has an adaptee
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
	 * Returns true if the passed adaptee type is 'mutation'
	 * @param adaptee
	 */
	isMutation(adaptee: ObserveStrategy): adaptee is MutationObserverStrategy {
		return adaptee.type === 'mutation';
	}

	/**
	 * Returns true if the passed adaptee type is 'observer'
	 * @param adaptee
	 */
	isIntersection(adaptee: ObserveStrategy): adaptee is IntersectionObserverStrategy {
		return adaptee.type === 'observer';
	}

	/**
	 * Starts to observe the specified element
	 *
	 * @param el
	 * @param params
	 */
	observe(el: Element, params: CanArray<InViewInitOptions>): false | undefined {
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
	 * Suspends observing of elements by the specified group.
	 * Calling this method will temporarily stop observing elements that match the specified group.
	 * To cancel the suspending invoke `unsuspend`.
	 *
	 * @param group
	 */
	suspend(group: InViewGroup): void;

	/**
	 * Suspends observing of the specified element
	 *
	 * @param el
	 * @param threshold - `threshold` should be specified because it's used as a unique key for observables
	 */
	suspend(el: Element, threshold: number): void;
	suspend(groupOrElement: InViewGroup | Element, threshold?: number): void {
		return this.adaptee?.suspend(groupOrElement, threshold);
	}

	/**
	 * Unsuspends observing of the specified group of elements
	 * @param group
	 */
	unsuspend(group: InViewGroup): void;

	/**
	 * Unsuspends observing of the specified element
	 *
	 * @param el
	 * @param threshold - `threshold` should be specified because it's used as a unique key for observables
	 */
	unsuspend(el: Element, threshold: number): void;
	unsuspend(groupOrElement: InViewGroup | Element, threshold?: number): void {
		return this.adaptee?.unsuspend(groupOrElement, threshold);
	}

	/**
	 * Re-initializes observing of the specified group
	 * @param group
	 */
	reObserve(group: InViewGroup): void;

	/**
	 * Re-initializes observing of the specified element
	 *
	 * @param el
	 * @param threshold - `threshold` should be specified because it's used as a unique key for observables
	 */
	reObserve(el: Element, threshold: number): void;
	reObserve(groupOrElement: InViewGroup | Element, threshold?: number): void {
		return this.adaptee?.reObserve(groupOrElement, threshold);
	}

	/**
	 * @see [[InViewAdapter.remove]]
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
	 * Removes the passed element from observable elements
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
	call(observable: InViewObservableElement): void {
		if (!this.adaptee) {
			return;
		}

		this.adaptee.call(observable);
	}

	/**
	 * Returns a threshold map of the specified element
	 * @param el
	 */
	getThresholdMap(el: Element): CanUndef<InViewObservableThresholdMap> {
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
	get(el: Element, threshold: number): CanUndef<InViewObservableElement> {
		if (!this.adaptee) {
			return;
		}

		return this.adaptee.getEl(el, threshold);
	}

	/**
	 * Normalizes the specified directive options
	 * @param opts
	 */
	protected normalizeOptions(opts: InViewInitOptions): InViewInitOptions {
		return opts;
	}
}
