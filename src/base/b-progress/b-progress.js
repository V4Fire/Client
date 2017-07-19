'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import iBlock, { field, bindModTo, PARENT } from 'super/i-block/i-block';
import { component } from 'core/component';

export const
	$$ = new Store();

@component()
export default class bProgress extends iBlock {
	/**
	 * Progress value store
	 */
	@field()
	valueStore: number = 0;

	/** @inheritDoc */
	static mods = {
		@bindModTo('valueStore')
		progress: [
			PARENT
		]
	};

	/**
	 * Progress value
	 */
	get value(): number {
		return this.valueStore;
	}

	/**
	 * Sets a new progress value
	 *
	 * @param value
	 * @emits complete()
	 */
	set value(value: number) {
		(async () => {
			this.valueStore = value;

			if (value === 100) {
				try {
					await this.async.sleep(0.8.second(), {label: $$.complete});
					this.valueStore = 0;
					this.emit('complete');

				} catch (_) {}

			} else {
				this.async.clearTimeout({label: $$.complete});
			}
		})();
	}
}
