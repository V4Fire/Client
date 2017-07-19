'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import iInput from 'super/i-input/i-input';
import { bindModTo, PARENT } from 'super/i-block/i-block';
import { component } from 'core/component';

export const
	$$ = new Store();

@component()
export default class bCheckbox extends iInput {
	/** @override */
	dataType: Function = Boolean;

	/**
	 * Checkbox label
	 */
	label: ?string;

	/**
	 * True if the checkbox can be accessed
	 */
	changeable: boolean = true;

	/** @override */
	get $refs(): {input: HTMLInputElement} {}

	/** @inheritDoc */
	static mods = {
		@bindModTo('valueStore')
		checked: [
			'true',
			'false'
		],

		theme: [
			PARENT,
			'menu'
		]
	};

	/**
	 * Checks the box
	 * @emits check()
	 */
	async check(): boolean {
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
	async uncheck(): boolean {
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

	/* eslint-disable no-unused-vars */

	/**
	 * Handler: checkbox trigger
	 *
	 * @param e
	 * @emits actionChange(value: boolean)
	 */
	async onClick(e: Event) {
		this.focus();
		await this.toggle();
		this.emit('actionChange', this.mods.checked === 'true');
	}

	/* eslint-enable no-unused-vars */

	/** @inheritDoc */
	created() {
		this.localEvent.on('block.mod.*.checked.*', (el) => this.value = el.type !== 'remove' && el.value === 'true');
	}

	/** @inheritDoc */
	mounted() {
		const
			{block: $b} = this;

		this.async.on(this.$el, 'click', {
			label: $$.toggle,
			fn: (e) => {
				if (e.target.closest($b.getElSelector('wrapper')) || e.target.closest($b.getElSelector('hidden-input'))) {
					return this.onClick(e);
				}
			}
		});
	}
}
