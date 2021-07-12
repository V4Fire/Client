/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:form/b-select-date/README.md]]
 * @packageDocumentation
 */

import { is } from 'core/browser';

import type bSelect from 'form/b-select/b-select';
import type { Item } from 'form/b-select/b-select';

import iWidth from 'traits/i-width/i-width';
import iInput, { component, prop, ModsDecl } from 'super/i-input/i-input';

import { selectCache, months } from 'form/b-select-date/const';
import type { Value, FormValue } from 'form/b-select-date/interface';

export * from 'super/i-input/i-input';
export * from 'form/b-select-date/const';
export * from 'form/b-select-date/interface';

export { Value, FormValue };

/**
 * Component to create a form component to specify a date by using select-s
 */
@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bSelectDate extends iInput implements iWidth {
	/** @override */
	readonly Value!: Value;

	/** @override */
	readonly FormValue!: FormValue;

	/** @override */
	readonly rootTag: string = 'span';

	/** @override */
	@prop({type: Date, required: false})
	readonly valueProp?: this['Value'];

	/** @override */
	@prop({type: Date, required: false})
	readonly defaultProp?: this['Value'];

	/**
	 * If true, the select components will use a native tag to show the select
	 */
	@prop(Boolean)
	readonly native: boolean = Object.isTruly(is.mobile);

	/** @override */
	get value(): this['Value'] {
		return Object.fastClone(super['valueGetter']());
	}

	/** @override */
	set value(value: this['Value']) {
		super['valueSetter'](value);
	}

	/** @override */
	get default(): this['Value'] {
		return this.defaultProp ?? new Date().beginningOfYear();
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iWidth.mods
	};

	/** @override */
	protected readonly $refs!: {
		input: HTMLInputElement;
		month: bSelect;
		day: bSelect;
		year: bSelect;
	};

	/**
	 * List of months to render
	 */
	protected get months(): readonly Item[] {
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
	 * List of days to render
	 */
	protected get days(): readonly Item[] {
		const
			key = this.value.daysInMonth(),
			cache = selectCache.create('days'),
			val = cache[key];

		if (val) {
			return val;
		}

		const res = <Item[]>[];
		cache[key] = res;

		for (let i = 1; i <= key; i++) {
			res.push({
				value: i,
				label: String(i)
			});
		}

		return Object.freeze(res);
	}

	/**
	 * List of years to render
	 */
	protected get years(): readonly Item[] {
		const
			key = new Date().getFullYear(),
			cache = selectCache.create('years'),
			val = cache[key];

		if (val) {
			return val;
		}

		const res = <Item[]>[];
		cache[key] = res;

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
	 * List of child selects
	 */
	protected get elements(): CanPromise<readonly bSelect[]> {
		return this.waitStatus('ready', () => {
			const r = this.$refs;
			return Object.freeze([r.month, r.day, r.year]);
		});
	}

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
	 * Handler: updating of the component value
	 */
	protected onValueUpdate(): void {
		const
			{month, day, year} = this.$refs;

		const
			d = new Date(Number(year.value ?? new Date().getFullYear()), Number(month.value ?? 0), 1),
			max = d.daysInMonth();

		if (max < Number(day.value)) {
			day.value = max;
		}

		d.set({
			day: day.value != null ? Number(day.value) : 0,
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
	 * Handler: changing the component value via some user actions
	 * @emits `actionChange(value: this['Value'])`
	 */
	protected async onActionChange(): Promise<void> {
		await this.nextTick();
		this.emit('actionChange', this.value);
	}
}
