/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/form/b-select-date/README.md]]
 * @packageDocumentation
 */

import { is } from 'core/browser';

import type bSelect from 'components/form/b-select/b-select';
import type { Item } from 'components/form/b-select/b-select';

import iWidth from 'components/traits/i-width/i-width';
import iInput, { component, prop, computed, ModsDecl } from 'components/super/i-input/i-input';

import type { Value, FormValue } from 'components/form/b-select-date/interface';

export * from 'components/super/i-input/i-input';
export * from 'components/form/b-select-date/interface';

export { Value, FormValue };

@component({
	functional: {
		wait: undefined,
		dataProvider: undefined
	}
})

export default class bSelectDate extends iInput implements iWidth {
	/** @inheritDoc */
	declare readonly Value: Value;

	/** @inheritDoc */
	declare readonly FormValue: FormValue;

	@prop({type: Date, required: false})
	override readonly valueProp?: this['Value'];

	@prop({type: Date, required: false})
	override readonly defaultProp?: this['Value'];

	/**
	 * If true, the select components will use a native tag to show the select
	 */
	@prop(Boolean)
	readonly native: boolean = Object.isTruly(is.mobile);

	override get value(): this['Value'] {
		return Object.fastClone(super['valueGetter']());
	}

	override set value(value: this['Value']) {
		super['valueSetter'](value);
	}

	override get default(): this['Value'] {
		return this.defaultProp ?? new Date().beginningOfYear();
	}

	static override readonly mods: ModsDecl = {
		...iWidth.mods
	};

	/** @inheritDoc */
	declare protected readonly $refs: iInput['$refs'] & {
		input: HTMLInputElement;
		month: bSelect;
		day: bSelect;
		year: bSelect;
	};

	/**
	 * A list of months to render
	 */
	@computed({cache: true})
	protected get months(): readonly Item[] {
		const {t} = this;

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

		return Object.freeze(months).map((label, value) => ({value, label}));
	}

	/**
	 * A list of days to render
	 */
	@computed({cache: true})
	protected get days(): readonly Item[] {
		const
			days: Item[] = [],
			daysInMonth = this.value.daysInMonth();

		for (let i = 1; i <= daysInMonth; i++) {
			days.push({
				value: i,
				label: String(i)
			});
		}

		return Object.freeze(days);
	}

	/**
	 * A list of years to render
	 */
	@computed({cache: true})
	protected get years(): readonly Item[] {
		const
			years: Item[] = [],
			currentYear = new Date().getFullYear();

		for (let i = 0; i < 125; i++) {
			const
				value = currentYear - i;

			years.push({
				value,
				label: String(value)
			});
		}

		return Object.freeze(years);
	}

	/**
	 * A list of child selects
	 */
	protected get elements(): CanPromise<readonly bSelect[]> {
		return this.waitComponentStatus('ready', () => {
			const r = this.$refs;
			return Object.freeze([r.month, r.day, r.year]);
		});
	}

	override async clear(): Promise<boolean> {
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

	override async reset(): Promise<boolean> {
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
