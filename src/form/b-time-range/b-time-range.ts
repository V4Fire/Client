/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import bInputNumber from 'form/b-input-number/b-input-number';
import iInput, { component, ModsDecl } from 'super/i-input/i-input';
export * from 'super/i-input/i-input';

export type Value = CanUndef<{
	from?: number[];
	to?: number[];
}>;

@component()
export default class bTimeRange<
	V extends Value = Value,
	FV extends Value = Value,
	D extends Dictionary = Dictionary
> extends iInput<V, FV, D> {
	/** @override */
	get value(): V {
		const v = <V>this.getField('valueStore');
		return v && Object.fastClone(v);
	}

	/** @override */
	set value(value: V) {
		this.setField('valueStore', value);
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		empty: [
			'true',
			'false'
		]
	};

	/** @override */
	protected readonly $refs!: {input: HTMLInputElement};

	/** @override */
	async clear(): Promise<boolean> {
		if (this.mods.empty !== 'true') {
			return super.clear();
		}

		return false;
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.bindModTo(
			'empty',
			'valueStore',
			(v: any) => !this.getField('from.length', v) && !this.getField('to.length', v)
		);
	}

	/**
	 * Handler: clear
	 *
	 * @param e
	 * @emits actionChange(value: string)
	 */
	protected async onClear(e: MouseEvent): Promise<void> {
		if (await this.clear()) {
			this.emit('actionChange', this.value);
			await this.focus();
		}
	}

	/**
	 * Handler: component value save
	 * @emits actionChange(value: CanUndef<Value>)
	 */
	protected async onSave(): Promise<void> {
		const
			get = (s) => $C(this.block.elements(s)).to([]).map((el) => this.$<bInputNumber>(el).formValue),
			from = <number[]>await Promise.all(get('input-from')),
			to = <number[]>await Promise.all(get('input-to'));

		const f = (arr) => {
			if (arr[0] == null && arr[1] == null) {
				arr.splice(0, 2);
				return;
			}

			arr[0] = arr[0] || 0;
			arr[1] = arr[1] || 0;
		};

		f(from);
		f(to);

		this.value = <V>(from.length || to.length ? {from, to} : undefined);
		this.emit('actionChange', this.value);
		await this.close();
	}

	/* @override */
	protected created(): void {
		super.created();
		this.initCloseHelpers();
	}
}
