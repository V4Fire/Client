/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import type { AsyncOptions } from 'core/async';

import Friend from 'components/friends/friend';

import type bVirtualScrollNew from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';
import type { SlotsStateObj } from 'components/base/b-virtual-scroll-new/modules/slots/interface';

export * from 'components/base/b-virtual-scroll-new/modules/slots/interface';

export const
	$$ = symbolGenerator(),
	slotsStateControllerAsyncGroup = 'slotsStateController';

/**
 * A class that manages the visibility of slots based on different states.
 */
export class SlotsStateController extends Friend {

	override readonly C!: bVirtualScrollNew;

	/**
	 * Options for the asynchronous operations.
	 */
	protected readonly asyncUpdateLabel: AsyncOptions = {
		label: $$.updateSlotsVisibility,
		group: slotsStateControllerAsyncGroup
	};

	/**
	 * The last state of the slots.
	 */
	protected lastState?: SlotsStateObj;

	/**
	 * Displays the slots that should be shown when the data state is empty
	 */
	emptyState(): void {
		this.setSlotsVisibility({
			container: true,
			done: true,
			empty: true,
			loader: false,
			renderNext: false,
			retry: false,
			tombstones: false
		});
	}

	/**
	 * Displays the slots that should be shown when the lifecycle is done
	 */
	doneState(): void {
		this.setSlotsVisibility({
			container: true,
			done: true,
			empty: this.lastState?.empty ?? false,
			loader: false,
			renderNext: false,
			retry: false,
			tombstones: false
		});
	}

	/**
	 * Displays the slots that should be shown during data loading progress
	 * @param [immediate] - if set to true, {@link requestAnimationFrame} will not be used to switch the state.
	 */
	loadingProgressState(immediate: boolean = false): void {
		this.setSlotsVisibility({
			container: true,
			loader: true,
			tombstones: true,
			done: false,
			empty: false,
			renderNext: false,
			retry: false
		}, immediate);
	}

	/**
	 * Displays the slots that should be shown when data loading fails
	 */
	loadingFailedState(): void {
		this.setSlotsVisibility({
			container: true,
			retry: true,
			done: false,
			empty: false,
			loader: false,
			renderNext: false,
			tombstones: false
		});
	}

	/**
	 * Displays the slots that should be shown when data loading is successful
	 * @param immediate
	 */
	loadingSuccessState(immediate: boolean = false): void {
		this.setSlotsVisibility({
			container: true,
			done: false,
			empty: false,
			loader: false,
			renderNext: true,
			retry: false,
			tombstones: false
		}, immediate);
	}

	/**
	 * Resets the state of the module
	 */
	reset(): void {
		this.async.clearAll({group: new RegExp(slotsStateControllerAsyncGroup)});
		this.lastState = undefined;
	}

	/**
	 * Sets the visibility state of the slots.
	 *
	 * @param stateObj - an object specifying the visibility state of each slot.
	 * @param [immediate] - if set to true, {@link requestAnimationFrame} will not be used to switch the state.
	 */
	protected setSlotsVisibility(stateObj: Required<SlotsStateObj>, immediate: boolean = false): void {
		this.lastState = stateObj;

		this.async.cancelAnimationFrame(this.asyncUpdateLabel);

		const update = () => {
			for (const [name, state] of Object.entries(stateObj)) {
				this.setDisplayState(<keyof SlotsStateObj>name, state);
			}
		};

		if (immediate) {
			return update();
		}

		this.async.requestAnimationFrame(update, this.asyncUpdateLabel);
	}

	/**
	 * Sets the display state of a slot.
	 *
	 * @param name - the name of the slot.
	 * @param state - the visibility state of the slot.
	 */
	protected setDisplayState(name: keyof SlotsStateObj, state: boolean): void {
		const ref = this.ctx.$refs[name];

		if (!SSR && ref instanceof HTMLElement) {
			ref.style.display = state ? '' : 'none';
		}
	}
}
