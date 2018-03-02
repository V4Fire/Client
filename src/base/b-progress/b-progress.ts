/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iBlock, { field, component, PARENT, ModsDecl } from 'super/i-block/i-block';

export * from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

@component()
export default class bProgress extends iBlock {
	/** @inheritDoc */
	static mods: ModsDecl = {
		progress: [
			PARENT
		]
	};

	/**
	 * Progress value store
	 */
	@field()
	protected valueStore: number = 0;

	/**
	 * Progress value
	 */
	protected get value(): number {
		return this.valueStore;
	}

	/**
	 * Sets a new progress value
	 *
	 * @param value
	 * @emits complete()
	 */
	protected set value(value: number) {
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

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.bindModTo('progress', 'valueStore');
	}
}
