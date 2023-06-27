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
import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { SlotsStateObj } from 'components/base/b-scrolly/modules/slots/interface';

export * from 'components/base/b-scrolly/modules/slots/interface';

export const
	$$ = symbolGenerator(),
	slotsStateControllerAsyncGroup = 'slotsStateController';

/**
 * A class that manages the visibility of slots based on different states.
 */
export class SlotsStateController extends Friend {

	override readonly C!: bScrolly;

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
	 * Displays the slots that should be shown when the data state is empty.
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
	 * Displays the slots that should be shown when the lifecycle is done.
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
	 * Displays the slots that should be shown during data loading progress.
	 */
	loadingProgressState(): void {
		this.setSlotsVisibility({
			container: true,
			loader: true,
			tombstones: true,
			done: false,
			empty: false,
			renderNext: false,
			retry: false
		});
	}

	/**
	 * Displays the slots that should be shown when data loading fails.
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
	 * Displays the slots that should be shown when data loading is successful.
	 */
	loadingSuccessState(): void {
		this.setSlotsVisibility({
			container: true,
			done: false,
			empty: false,
			loader: false,
			renderNext: true,
			retry: false,
			tombstones: false
		});
	}

	/**
	 * Resets the state of the module.
	 */
	reset(): void {
		this.async.clearAll({group: new RegExp(slotsStateControllerAsyncGroup)});
		this.lastState = undefined;
	}

	/**
	 * Sets the visibility state of the slots.
	 *
	 * @param stateObj - An object specifying the visibility state of each slot.
	 */
	protected setSlotsVisibility(stateObj: Required<SlotsStateObj>): void {
		this.lastState = stateObj;

		this.async.cancelAnimationFrame(this.asyncUpdateLabel);

		this.async.requestAnimationFrame(() => {
			for (const [name, state] of Object.entries(stateObj)) {
				this.setDisplayState(<keyof SlotsStateObj>name, state);
			}
		}, this.asyncUpdateLabel);
	}

	/**
	 * Sets the display state of a slot.
	 *
	 * @param name - The name of the slot.
	 * @param state - The visibility state of the slot.
	 */
	protected setDisplayState(name: keyof SlotsStateObj, state: boolean): void {
		const ref = this.ctx.$refs[name];

		if (ref) {
			ref.style.display = state ? '' : 'none';
		}
	}
}
