/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import iTheme from 'traits/i-theme/i-theme';
import iProgress from 'traits/i-progress/i-progress';
import iVisible from 'traits/i-visible/i-visible';

import iBlock, { component, prop, field, ModsDecl } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

@component()
export default class bProgress extends iBlock implements iTheme, iProgress, iVisible {
	/**
	 * Initial progress value store
	 */
	@prop({type: Number, required: false})
	readonly valueProp?: number;

	/**
	 * Progress value
	 */
	get value(): CanUndef<number> {
		return this.field.get('valueStore');
	}

	/**
	 * Sets a new progress value
	 *
	 * @param value
	 * @emits complete()
	 */
	set value(value: CanUndef<number>) {
		const
			label = {label: $$.complete};

		(async () => {
			this.field.set('valueStore', value);

			if (value === 100) {
				try {
					await this.async.sleep(0.8.second(), label);
					this.field.set('valueStore', 0);
					this.emit('complete');

				} catch {}

			} else {
				this.async.clearTimeout(label);
			}
		})();
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iTheme.mods,
		...iProgress.mods,
		...iVisible.mods
	};

	/**
	 * Progress value store
	 */
	@field((o) => o.sync.link())
	protected valueStore?: number;

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
		this.sync.mod('progress', 'valueStore', Object.isNumber);
	}
}
