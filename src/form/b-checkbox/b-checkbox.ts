/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iInput, { component, prop, watch, ModsDecl } from 'super/i-input/i-input';
export * from 'super/i-input/i-input';

export const
	$$ = symbolGenerator();

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bCheckbox<T extends Dictionary = Dictionary> extends iInput<T> {
	/** @override */
	@prop(Function)
	readonly dataType: Function = Any;

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

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		checked: [
			'true',
			'false'
		],

		theme: [
			bCheckbox.PARENT,
			'menu'
		]
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
	 * @emits actionChange(value: boolean)
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
		this.bindModTo('checked', 'valueStore');
		this.localEvent.on('block.mod.*.checked.*', (e) => {
			this.value = e.type !== 'remove' && e.value === 'true';
			this.emit(this.value ? 'check' : 'uncheck');
		});
	}
}
