/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import iInput, { component, prop, field } from 'super/i-input/i-input';
export * from 'super/i-input/i-input';

@component()
export default class bInputBirthday extends iInput {
	/** @override */
	@prop({default: () => new Date().beginningOfYear()})
	valueProp!: Date;

	/** @override */
	@field((o) => o.link('valueProp', (val) => {
		const
			ctx: bInputBirthday = <any>o;

		if (String(val) !== String(ctx.valueStore)) {
			return val;
		}

		return ctx.valueStore;
	}))

	valueStore: Date;

	/**
	 * If true, then the block value will be marked as UTC
	 */
	utc: boolean = false;

	/** @override */
	get $refs(): {input: HTMLInputElement, month: bSelect, day: bSelect, year: bSelect} {}

	/** @override */
	@params({cache: false})
	get value(): Date {
		return Object.fastClone(this.valueStore);
	}

	/**
	 * List of accepted months
	 */
	@params({cache: false})
	get months(): Array<Object> {
		return $C([
			t`January`,
			t`February`,
			t`March`,
			t`April`,
			t`May`,
			t`June`,
			t`July`,
			t`August`,
			t`September`,
			t`October`,
			t`November`,
			t`December`
		]).map((label, value) => ({value, label}));
	}

	/**
	 * List of accepted days
	 */
	get days(): Array<Object> {
		const
			days = this.value.daysInMonth(),
			res = [];

		for (let i = 1; i <= days; i++) {
			res.push({
				value: i,
				label: i
			});
		}

		return res;
	}

	/**
	 * List of accepted years
	 */
	get years(): Array<Object> {
		const
			current = new Date().getFullYear(),
			res = [];

		for (let i = 0; i < 125; i++) {
			const
				value = current - i;

			res.push({
				value,
				label: value
			});
		}

		return res;
	}

	/**
	 * Array of child selects
	 */
	get elements(): Array<bSelect> {
		return this.waitState('ready', () => {
			const r = this.$refs;
			return [r.month, r.day, r.year];
		});
	}

	/** @override */
	async clear(): boolean {
		const res = [];
		for (const el of await this.elements) {
			try {
				res.push(await el.clear());
			} catch (_) {}
		}

		if ($C(res).some((el) => el)) {
			this.emit('clear');
			return true;
		}

		return false;
	}

	/** @override */
	async reset(): boolean {
		const res = [];
		for (const el of await this.elements) {
			try {
				res.push(await el.reset());
			} catch (_) {}
		}

		if ($C(res).some((el) => el)) {
			this.emit('reset');
			return true;
		}

		return false;
	}

	/**
	 * Handler: value update
	 */
	onValueUpdate() {
		const
			{month, day, year} = this.$refs;

		const
			d = new Date(year.selected || new Date().getFullYear(), month.selected || 0, 1),
			max = d.daysInMonth();

		if (max < day.selected) {
			day.selected = max;
		}

		d.set({
			day: day.selected,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		if (String(d) !== String(this.value)) {
			this.value = d;
		}
	}

	/**
	 * Handler: action change
	 * @emits actionChange(value: Date)
	 */
	async onActionChange() {
		await this.nextTick();
		this.emit('actionChange', this.value);
	}
}
