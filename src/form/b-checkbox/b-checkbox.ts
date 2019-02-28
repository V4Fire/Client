/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iSize, { SizeDictionary } from 'traits/i-size/i-size';
import iInput, { component, prop, watch, ModsDecl } from 'super/i-input/i-input';
export * from 'super/i-input/i-input';

export type Value = boolean;
export type FormValue = Value;

export const
	$$ = symbolGenerator();

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bCheckbox<
	V extends Value = Value,
	FV extends FormValue = FormValue,
	D extends Dictionary = Dictionary
> extends iInput<V, FV, D> implements iSize {
	/** @override */
	@prop({type: Boolean, required: false})
	readonly valueProp?: V;

	/** @override */
	@prop({type: Boolean, required: false})
	readonly defaultProp?: V;

	/**
	 * Checkbox label
	 */
	@prop({type: String, required: false})
	readonly label?: string;

	/**
	 * True if the checkbox can be accessed
	 */
	@prop(Boolean)
	readonly changeable: boolean = true;

	/** @override */
	get default(): unknown {
		return this.defaultProp || false;
	}

	/** @see iSize.lt */
	get lt(): SizeDictionary {
		return iSize.lt;
	}

	/** @see iSize.gt */
	get gt(): SizeDictionary {
		return iSize.gt;
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		checked: [
			'true',
			'false'
		],

		...iSize.mods
	};

	/** @override */
	protected readonly $refs!: {input: HTMLInputElement};

	/**
	 * Checks the box
	 */
	async check(): Promise<boolean> {
		if (!this.changeable) {
			return false;
		}

		return this.setMod('checked', true);
	}

	/**
	 * Unchecks the box
	 */
	async uncheck(): Promise<boolean> {
		if (!this.changeable) {
			return false;
		}

		return this.setMod('checked', false);
	}

	/** @override */
	toggle(): Promise<boolean> {
		return this.mods.checked === 'true' ? this.uncheck() : this.check();
	}

	/**
	 * Handler: checkbox trigger
	 *
	 * @param e
	 * @emits actionChange(value: V)
	 */
	@watch({
		field: '?$el:click',
		wrapper: (o, cb) => (e) => {
			const
				{block: $b} = o;

			if (
				e.target.closest($b.getElSelector('wrapper')) ||
				e.target.closest($b.getElSelector('hidden-input'))
			) {
				return cb(e);
			}
		}
	})

	protected async onClick(e: Event): Promise<void> {
		await this.focus();
		await this.toggle();
		this.emit('actionChange', this.mods.checked === 'true');
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('checked', 'valueStore');
		this.localEvent.on('block.mod.*.checked.*', (e) => {
			this.value = <V>(e.type !== 'remove' && e.value === 'true');
			this.emit(this.value ? 'check' : 'uncheck');
		});
	}
}
