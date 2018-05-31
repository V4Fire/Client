/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:max-file-line-count
import $C = require('collection.js');
import symbolGenerator from 'core/symbol';
import bInputTime from 'form/b-input-time/b-input-time';
import iInput, { component, prop, field, system, p, ModsDecl } from 'super/i-input/i-input';

export * from 'super/i-input/i-input';
export interface Day {
	active: boolean;
	disabled: boolean;
	inRange: boolean;
	rangeStart: boolean;
	rangeEnd: boolean;
	text: string;
}

export type Directions = 'right' | 'left';

export const
	$$ = symbolGenerator();

@component()
export default class bCalendar<T extends Dictionary = Dictionary> extends iInput<T> {
	/** @override */
	@prop({default: () => new Date()})
	readonly valueProp!: Date | Date[];

	/** @override */
	@prop({default(): Date | Date[] {
		return this.stringInput ? this.value[0] : this.value;
	}})

	readonly dataType!: Function;

	/**
	 * Initial maximum date value
	 */
	@prop({type: [String, Number, Date], required: false})
	readonly maxProp?: string | number | Date;

	/**
	 * Initial minimum date value
	 */
	@prop({type: [String, Number, Date], required: false})
	readonly minProp?: string | number | Date;

	/**
	 * Time margin for .min and .max
	 */
	@prop(Number)
	readonly timeMargin: number = (1).second();

	/** @override */
	@p({cache: false})
	get value(): Date[] {
		return Object.fastClone(this.valueStore);
	}

	/** @override */
	set value(value: Date[]) {
		const
			{min, max} = this,
			store = this.valueStore;

		$C(value).forEach((v, i) => {
			if (min && min.isAfter(v)) {
				v = min.clone();

			} else if (max && max.isBefore(v)) {
				v = max.clone();
			}

			if (!store[i] || (<number>Math.abs(store[i].valueOf() - v.valueOf())).seconds() >= this.timeMargin) {
				this.$set(store, i, v);
			}
		});
	}

	/**
	 * Date pointer
	 */
	get pointer(): Date[] {
		return Object.fastClone(this.pointerStore);
	}

	/**
	 * Sets a new date pointer
	 * @param value
	 */
	set pointer(value: Date[]) {
		this.pointerStore = value;
	}

	/**
	 * Minimum date value
	 */
	@p({cache: false})
	get min(): Date | undefined {
		return this.minProp != null ? Date.create(this.minProp) : undefined;
	}

	/**
	 * Maximum date value
	 */
	@p({cache: false})
	get max(): Date | undefined {
		return this.maxProp != null ? Date.create(this.maxProp) : undefined;
	}

	/**
	 * If true, then the component has a datepicker range
	 */
	get dayRange(): boolean {
		const v = this.valueProp;
		return Object.isArray(v) && v.length > 1;
	}

	/**
	 * If true, then the component has a time range
	 */
	get timeRange(): boolean {
		const v = this.valueProp;
		return this.dayRange && v[0].short() === v[1].short();
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		rounding: [
			bCalendar.PARENT,
			['small']
		]
	};

	/**
	 * If true, then dropdown is shown
	 */
	@field()
	protected shown: boolean = false;

	/**
	 * Dropdown position modifier
	 */
	@field()
	protected position: string = 'bottom';

	/**
	 * Direction of smooth switching month animation
	 */
	@field()
	protected monthSwitchDirection: number = 0;

	/**
	 * Flag for start month switch animation
	 */
	@field()
	protected monthSwitchAnimation: boolean = false;

	/**
	 * Available animation directions
	 */
	@field()
	protected directions: Directions[] = ['right', 'left'];

	/** @override */
	@field((o) => o.link((val) => {
		const ctx: bCalendar = <any>o;
		return Object.isArray(val) ? val : [].concat(ctx.initDefaultValue(val) || []);
	}))

	protected valueStore!: Date[];

	/**
	 * Date pointer store
	 */
	@field((o) => o.link('valueProp', (val = new Date()) => {
		const
			ctx: bCalendar = <any>o,
			prop = Object.isArray(val) ? val : [val];

		const d = prop.map((v, index) => index > 0 ? prop[index - 1].clone().addMonths(1) : v.clone().beginningOfMonth().set({
			hour: v.getHours(),
			minute: v.getMinutes(),
			second: v.getSeconds(),
			millisecond: v.getMilliseconds()
		}));

		if (ctx.pointerStore && d.isEqual(ctx.pointerStore)) {
			return ctx.pointerStore;
		}

		if (ctx.shown && ctx.pointerStore) {
			const
				oldMonth = ctx.pointerStore[0].getMonth(),
				newMonth = d[0].getMonth();

			if (oldMonth !== newMonth) {
				ctx.runMonthSwitching(<0 | 1>Number(newMonth > oldMonth));
			}
		}

		return d;
	}))

	protected pointerStore!: Date[];

	/** @override */
	protected readonly $refs!: {
		input: HTMLInputElement;
		dropdown?: HTMLElement;
	};

	/**
	 * If true, then
	 *
	 * Flag for setting a date parameter as Date
	 * (by default data type is Array)
	 */
	protected get stringInput(): boolean {
		return Object.isArray(this.valueProp);
	}

	/**
	 * Title for a calendar dropdown
	 */
	@p({cache: false})
	protected get dropdownTitle(): string {
		const title = $C(this.pointer).reduce(
			(str, item, i) => str + (i > 0 ? ' - ' : '') + this.t(item.format('{Month}', 'en')), '');

		return title.capitalize();
	}

	/**
	 * Month enter class for switching
	 */
	@p({cache: false})
	protected get animateMonthEnterClass(): string {
		return `animated fadeIn${this.directions[Number(!this.monthSwitchDirection)].capitalize()}`;
	}

	/**
	 * Label for a calendar input
	 */
	protected get labelText(): string {
		const
			val = this.value,
			date = '{dd}.{MM}.{yyyy}';

		let res;
		if (this.timeRange) {
			const from = $C(val)
				.to('')
				.reduce((str, v, ind) => str + (ind > 0 && t` to ` || '') + v.format('{HH}:{mm}'));

			res = t`${val[0].format(date)} from ${from}`;

		} else {
			res = $C(val)
				.to('')
				.reduce((str, v, ind) => str + (ind > 0 && ' - ' || '') + v.format(date));
		}

		return res.capitalize();
	}

	/**
	 * Index for next date selecting (range control)
	 */
	@system()
	private nextSelectItem?: number;

	/** @override */
	async open(): Promise<boolean> {
		const
			res = await super.open();

		if (res) {
			try {
				const
					dropdown = await this.waitRef<HTMLElement>('dropdown', {label: $$.openedDropdown}),
					offset = dropdown.getBoundingClientRect();

				if (offset.left < 0) {
					this.position = 'bottom-right';

				} else if (offset.right > window.outerWidth) {
					this.position = 'bottom-left';
				}

				this.shown = true;
			} catch (_) {}
		}

		return res;
	}

	/** @override */
	async close(): Promise<boolean> {
		const
			res = await super.close();

		if (res) {
			this.shown = false;
		}

		return res;
	}

	/**
	 * Returns a list of month days from the specified value date
	 * @param valueIndex
	 */
	protected getMonthDays(valueIndex: number): Day[][] {
		const
			{min, max} = this;

		const
			val = this.value,
			pointer = this.pointer[valueIndex];

		if (!pointer) {
			return [];
		}

		let
			d1,
			d2;

		if (this.dayRange) {
			d1 = Date.create(val[0].short());
			d2 = Date.create(val[1].short());
		}

		return $C(new Array(pointer.daysInMonth())).to([] as Day[][]).reduce((arr, el, i) => {
			if (!arr.length) {
				arr.push([]);
			}

			const
				day = pointer.clone().set({date: i + 1}),
				short = day.short();

			const rangeBorders = this.dayRange ? {
				isDateStart: d1.is(short),
				isDateEnd: d2.is(short)
			} : false;

			if (!arr[0].length) {
				arr[0] = arr[0].concat(new Array((day.getDay() || 7) - 1).fill({
					active: false,
					text: ''
				}));

				if (arr[0].length === 7) {
					arr.push([]);
				}
			}

			const
				active = $C(this.value).some((v) => Boolean(v && Date.create(v.short()).is(short)));

			const obj = {
				active,
				disabled: Boolean(min && min.isAfter(day) || max && max.isBefore(day)),
				inRange: Boolean(this.dayRange && day > this.value[0] && day < this.value[1]),
				rangeStart: rangeBorders && rangeBorders.isDateStart,
				rangeEnd: rangeBorders && rangeBorders.isDateEnd,
				text: String(i + 1)
			};

			if (arr[arr.length - 1].push(obj) % 7 === 0) {
				arr.push([]);
			}

			return arr;
		});
	}

	/**
	 * Executes the month switcher
	 * @param dir - index for directions
	 */
	protected runMonthSwitching(dir: 0 | 1): void {
		this.monthSwitchDirection = dir;
		this.monthSwitchAnimation = true;
	}

	/**
	 * Sets simple/multiple date(s) to calendar
	 *
	 * @param date - new date value
	 * @param index - selected item index
	 * @emits actionChange(value?: Date | Date[])
	 */
	protected setDate(date: Date, index?: number): Date[] {
		const
			now = index !== undefined ? index : this.nextSelectItem !== undefined ? this.nextSelectItem : 0,
			next = Number(!now);

		let
			selectedDays = Object.isArray(this.value) ? this.value : [this.value];

		if (selectedDays.length === 2) {
			selectedDays[now] = date;

			const
				nowShort = selectedDays[now].short(),
				nextShort = selectedDays[next].short();

			if (nowShort !== nextShort && now === 0) {
				selectedDays[next] = date.clone().endOfDay();
			}

			this.nextSelectItem = next;
			selectedDays = selectedDays.sort((a, b) => a.isAfter(b) ? 1 : b.isAfter(a) ? -1 : 0);

		} else {
			selectedDays[now] = date;
		}

		this.value = selectedDays;
		this.emit('actionChange', this.stringInput ? this.value[0] : this.value);

		return this.value;
	}

	/**
	 * Handler: day switch
	 *
	 * @param days - number of switching days
	 * @param index - calendar index
	 * @emits actionChange(value?: Date | Date[])
	 */
	protected async onSwitchDay(days: number, index: number = 0): Promise<void> {
		const selectedDay = Object.isArray(this.value) ? this.value : [this.value];
		selectedDay[index] = selectedDay[index].addDays(days);

		this.value = selectedDay;
		this.emit('actionChange', this.stringInput ? this.value[0] : this.value);

		const
			val = this.value[index],
			pointer = this.pointer[index];

		if (val.format('{MM}:{yyyy}') !== pointer.format('{MM}:{yyyy}')) {
			this.$set(this.pointerStore, index, pointer.set({
				month: val.getMonth(),
				year: val.getFullYear()
			}));
		}

		await this.open();
	}

	/**
	 * Handler: month switch
	 * @param months - number of switching months
	 */
	protected async onSwitchMonth(months: number): Promise<void> {
		$C(this.pointer).forEach((el, i) => {
			this.$set(this.pointerStore, i, el.addMonths(months));
		});

		this.runMonthSwitching(months < 0 ? 0 : 1);
		await this.open();
	}

	/**
	 * Handler: day select
	 *
	 * @param e
	 * @emits actionChange(value?: Date | Date[])
	 */
	protected onDaySelect(e: Event): void {
		const
			target = <HTMLElement>e.delegateTarget,
			calendar = Number(target.dataset.calendar);

		if (this.block.getElMod(target, 'day', 'active') !== 'true' || this.value.length > 1) {
			this.setDate(this.pointer[calendar].clone().set({date: Number(target.textContent)}));
		}
	}

	/**
	 * Handler: time change
	 */
	protected onTimeChange(el: bInputTime, value: Date): void {
		const {index} = (<HTMLElement>el.$el).dataset;
		this.setDate(value, Number(index));
	}

	/**
	 * Handler: month animation transition end
	 */
	protected async onMonthSwitchEnd(): Promise<void> {
		this.monthSwitchAnimation = false;
	}

	/** @override */
	protected created(): void {
		super.created();
		this.initCloseHelpers();
	}

	/** @override */
	protected async mounted(): Promise<void> {
		super.mounted();
		this.async.on(this.$el, 'click', await this.delegateElement('day', this.onDaySelect), {
			label: $$.daySelection
		});
	}
}
