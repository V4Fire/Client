/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import MutationObserverStrategy from 'core/component/directives/in-view/modules/mutation';
import IntersectionObserverStrategy from 'core/component/directives/in-view/modules/intersection';

import {

	IntersectionObserverOptions,
	ObserveOptions,
	ObservableElement

} from 'core/component/directives/in-view/modules/meta';

export type Observers =
	IntersectionObserverStrategy |
	MutationObserverStrategy;

export default class InViewAdapter {
	/**
	 * Observer adaptee
	 */
	protected adaptee?: Observers;

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
	setInstance(instance: Observers): void {
		this.adaptee = instance;
	}

	/**
	 * Checks an adaptee type for the 'mutation' value
	 * @param adaptee
	 */
	isMutation(adaptee: Observers): adaptee is MutationObserverStrategy {
		return adaptee.type === 'mutation';
	}

	/**
	 * Checks an adaptee type for the 'observer' value
	 * @param adaptee
	 */
	isIntersection(adaptee: Observers): adaptee is IntersectionObserverStrategy {
		return adaptee.type === 'observer';
	}

	/**
	 * Starts observe an element
	 *
	 * @param el
	 * @param options
	 */
	observe(el: HTMLElement, options: IntersectionObserverOptions & ObserveOptions): ObservableElement | false {
		if (!this.adaptee) {
			return false;
		}

		return this.adaptee.observe(el, this.normalizeOptions(options));
	}

	/**
	 * Activates deactivated elements by specified group
	 * @param [group]
	 */
	activate(group?: string): void {
		if (!this.adaptee) {
			return;
		}

		return this.adaptee.setGroupState(false, group);
	}

	/**
	 * Deactivates elements by specified group
	 * @param [group]
	 */
	deactivate(group?: string): void {
		if (!this.adaptee) {
			return;
		}

		return this.adaptee.setGroupState(true, group);
	}

	/**
	 * Removes an element from observable elements
	 * @param el
	 */
	remove(el: HTMLElement): boolean {
		if (!this.adaptee) {
			return false;
		}

		return this.adaptee.remove(el);
	}

	/**
	 * Stops observe an element
	 * @param el
	 */
	stopObserve(el: HTMLElement): boolean {
		if (!this.adaptee) {
			return false;
		}

		return this.adaptee.stopObserve(el);
	}

	/**
	 * Checks is elements in view
	 */
	check(): void {
		if (!this.adaptee || this.isIntersection(this.adaptee)) {
			return;
		}

		this.adaptee.check();
	}

	/**
	 * Recalculates elements position map
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
	 * Returns an observable element
	 * @param el
	 */
	get(el: HTMLElement): CanUndef<ObservableElement> {
		if (!this.adaptee) {
			return;
		}

		return this.adaptee.get(el);
	}

	/**
	 * Normalize directive options
	 * @param options
	 */
	protected normalizeOptions(
		options: IntersectionObserverOptions & ObserveOptions
	): IntersectionObserverOptions & ObserveOptions {
		// tslint:disable: deprecation
		if (options.timeout) {
			options.delay = options.timeout;
		}
		// tslint:enable: deprecation

		return options;
	}
}
