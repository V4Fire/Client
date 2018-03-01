/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iInput, { component, prop, ModsDecl, PARENT, hook } from 'super/i-input/i-input';

export * from 'super/i-input/i-input';

export const
	$$ = symbolGenerator();

@component()
export default class bCheckbox extends iInput {
	/** @override */
	@prop(Function)
	readonly dataType: Function = Any;

	/**
	 * Checkbox label
	 */
	@prop(String)
	readonly label?: string;

	/**
	 * True if the checkbox can be accessed
	 */
	@prop(Boolean)
	readonly changeable: boolean = true;

	/** @inheritDoc */
	static mods: ModsDecl = {
		checked: [
			'true',
			'false'
		],

		theme: [
			PARENT,
			'menu'
		]
	};

	/** @override */
	protected readonly $refs!: {input: HTMLInputElement};

	/**
	 * Checks the box
	 * @emits check()
	 */
	async check(): Promise<boolean> {
		if (!this.changeable) {
			return false;
		}

		if (await this.setMod('checked', true)) {
			this.emit('check');
			return true;
		}

		return false;
	}

	/**
	 * Unchecks the box
	 * @emits uncheck()
	 */
	async uncheck(): Promise<boolean> {
		if (!this.changeable) {
			return false;
		}

		if (await this.setMod('checked', false)) {
			this.emit('uncheck');
			return true;
		}

		return false;
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
	protected async onClick(e: Event): Promise<void> {
		await this.focus();
		await this.toggle();
		this.emit('actionChange', this.mods.checked === 'true');
	}

	/**
	 * Adds local event handler on checked state change
	 */
	@hook('created')
	protected addCheckedHandler(): void {
		this.localEvent.on('block.mod.*.checked.*', (el) => this.value = el.type !== 'remove' && el.value === 'true');
	}

	/**
	 * Adds handler on checkbox click
	 */
	@hook('mounted')
	protected addOnClickHandler(): void {
		const
			{block: {getElSelector: $g}} = this,
			handler = (e) => {
				if (
					e.target.closest($g('wrapper')) ||
					e.target.closest($g('hidden-input'))
				) {
					return this.onClick(e);
				}
			};

		this.async.on(this.$el, 'click', handler, {label: $$.toggle});
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.bindModTo('checked', 'valueStore');
	}
}
