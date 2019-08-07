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

	InitOptions,
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
	 * Returns true if an adaptee type is 'mutation'
	 * @param adaptee
	 */
	isMutation(adaptee: Observers): adaptee is MutationObserverStrategy {
		return adaptee.type === 'mutation';
	}

	/**
	 * Returns true if an adaptee type is 'observer'
	 * @param adaptee
	 */
	isIntersection(adaptee: Observers): adaptee is IntersectionObserverStrategy {
		return adaptee.type === 'observer';
	}

	/**
	 * Starts observing the specified element
	 *
	 * @param el
	 * @param opts
	 */
	observe(el: HTMLElement, opts: InitOptions): ObservableElement | false {
		if (!this.adaptee) {
			return false;
		}

		return this.adaptee.observe(el, this.normalizeOptions(opts));
	}

	/**
	 * Activates deactivated elements by the specified group
	 * @param [group]
	 */
	activate(group?: string): void {
		if (!this.adaptee) {
			return;
		}

		return this.adaptee.setGroupState(false, group);
	}

	/**
	 * Deactivates elements by the specified group
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
	 * Stops observing the specified element
	 * @param el
	 */
	stopObserve(el: HTMLElement): boolean {
		if (!this.adaptee) {
			return false;
		}

		return this.adaptee.stopObserve(el);
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
	 * Normalizes the specified directive options
	 * @param opts
	 */
	protected normalizeOptions(opts: InitOptions): InitOptions {
		// tslint:disable: deprecation

		if (opts.timeout) {
			opts.delay = opts.timeout;
		}

		// tslint:enable: deprecation

		return opts;
	}
}
