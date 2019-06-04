/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import iProgress from 'traits/i-progress/i-progress';
import iVisible from 'traits/i-visible/i-visible';

import iBlock, { component, prop, field, ModsDecl } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

@component()
export default class bProgress extends iBlock implements iProgress, iVisible {
	/**
	 * Initial progress value store
	 */
	@prop({type: Number, required: false})
	readonly valueProp?: number;

	/**
	 * If true, then the component value will be reset after complete
	 */
	@prop(Boolean)
	readonly resetOnComplete: boolean = false;

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
		(async () => {
			this.field.set('valueStore', value);

			if (value === 100) {
				try {
					this.emit('complete');

					if (this.resetOnComplete) {
						this.field.set('valueStore', 0);
					}

				} catch {}
			}
		})();
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
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
