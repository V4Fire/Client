/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bSelect, { Option } from 'form/b-select/b-select';
import iInput, { component, prop, p, Cache } from 'super/i-input/i-input';
export * from 'super/i-input/i-input';

export type Value = Date;
export type FormValue = Value;

export const selectCache = new Cache<'months' | 'days' | 'years', ReadonlyArray<Option>>([
	'months',
	'days',
	'years'
]);

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bInputBirthday<
	V extends Value = Value,
	FV extends FormValue = FormValue,
	D extends Dictionary = Dictionary
> extends iInput<V, FV, D> {
	/** @override */
	@prop({type: Date, required: false})
	readonly valueProp?: V;

	/** @override */
	@prop({type: Date, required: false})
	readonly defaultProp?: V;

	/** @override */
	@p({cache: false})
	get value(): V {
		return Object.fastClone(<NonNullable<V>>this.field.get('valueProp'));
	}

	/** @override */
	set value(value: V) {
		this.field.set('valueProp', value);
	}

	/** @override */
	get default(): unknown {
		return this.defaultProp || new Date().beginningOfYear();
	}

	/**
	 * List of accepted months
	 */
	@p({cache: false})
	get months(): ReadonlyArray<Option> {
		const months = [
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
		];

		const
			key = JSON.stringify(months),
			cache = selectCache.create('months'),
			val = cache[key];

		if (val) {
			return val;
		}

		return cache[key] = Object.freeze(months).map((label, value) => ({value, label}));
	}

	/**
	 * List of accepted days
	 */
	get days(): ReadonlyArray<Option> {
		const
			key = this.value.daysInMonth(),
			cache = selectCache.create('days'),
			val = cache[key];

		if (val) {
			return val;
		}

		const
			res = cache[key] = <Option[]>[];

		for (let i = 1; i <= key; i++) {
			res.push({
				value: i,
				label: String(i)
			});
		}

		return Object.freeze(res);
	}

	/**
	 * List of accepted years
	 */
	get years(): ReadonlyArray<Option> {
		const
			key = new Date().getFullYear(),
			cache = selectCache.create('years'),
			val = cache[key];

		if (val) {
			return val;
		}

		const
			res = cache[key] = <Option[]>[];

		for (let i = 0; i < 125; i++) {
			const
				value = key - i;

			res.push({
				value,
				label: String(value)
			});
		}

		return Object.freeze(res);
	}

	/**
	 * Array of child selects
	 */
	get elements(): CanPromise<ReadonlyArray<bSelect>> {
		return this.waitStatus('ready', () => {
			const r = this.$refs;
			return Object.freeze([r.month, r.day, r.year]);
		});
	}

	/** @override */
	protected readonly $refs!: {
		input: HTMLInputElement;
		month: bSelect;
		day: bSelect;
		year: bSelect;
	};

	/** @override */
	protected valueStore!: V;

	/** @override */
	async clear(): Promise<boolean> {
		const
			res = <boolean[]>[];

		for (const el of await this.elements) {
			try {
				res.push(await el.clear());
			} catch {}
		}

		let
			some = false;

		for (let i = 0; i < res.length; i++) {
			if (res[i]) {
				some = true;
				break;
			}
		}

		if (some) {
			this.emit('clear');
			return true;
		}

		return false;
	}

	/** @override */
	async reset(): Promise<boolean> {
		const
			res = <boolean[]>[];

		for (const el of await this.elements) {
			try {
				res.push(await el.reset());
			} catch {}
		}

		let
			some = false;

		for (let i = 0; i < res.length; i++) {
			if (res[i]) {
				some = true;
				break;
			}
		}

		if (some) {
			this.emit('reset');
			return true;
		}

		return false;
	}

	/**
	 * Handler: value update
	 */
	onValueUpdate(): void {
		const
			{month, day, year} = this.$refs;

		const
			d = new Date(Number(year.selected) || new Date().getFullYear(), Number(month.selected) || 0, 1),
			max = d.daysInMonth();

		if (max < Number(day.selected)) {
			day.selected = String(max);
		}

		d.set({
			day: day.selected ? Number(day.selected) : 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		if (String(d) !== String(this.value)) {
			this.value = <V>d;
		}
	}

	/**
	 * Handler: action change
	 * @emits actionChange(value: V)
	 */
	async onActionChange(): Promise<void> {
		await this.nextTick();
		this.emit('actionChange', this.value);
	}
}
