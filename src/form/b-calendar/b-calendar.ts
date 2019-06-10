/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import bInputTime from 'form/b-input-time/b-input-time';

import iWidth from 'traits/i-width/i-width';
import iSize, { SizeDictionary } from 'traits/i-size/i-size';
import iIcon from 'traits/i-icon/i-icon';
import iOpenToggle, { CloseHelperEvents } from 'traits/i-open-toggle/i-open-toggle';

import iInput, {

	component,
	prop,
	field,
	system,
	watch,
	hook,
	p,

	ModsDecl,
	ModEvent,
	SetModEvent

} from 'super/i-input/i-input';

import { Value, FormValue, Day, Range, Directions, MonthSwitchDirection } from 'form/b-calendar/modules/interface';
export { SizeDictionary, CloseHelperEvents, Value, FormValue, Day, Range, Directions };
export * from 'super/i-input/i-input';

export const
	$$ = symbolGenerator();

@component()
export default class bCalendar<
	V extends Value = Value,
	FV extends FormValue = FormValue,
	D extends object = Dictionary
> extends iInput<V, FV, D> implements iWidth, iSize, iIcon, iOpenToggle {
	/** @override */
	@prop({type: [Array, Date], required: false})
	// @ts-ignore
	readonly valueProp?: CanArray<Date>;

	/** @override */
	@prop({type: [Array, Date], required: false})
	readonly defaultProp?: V;

	/** @override */
	@prop({default(): FV {
		return this.isSingleValue ? this.value[0] : this.value;
	}})

	readonly dataType!: Function;

	/**
	 * Initial maximum date value
	 */
	@prop({type: [String, Number, Date], required: false})
	readonly maxProp?: Range;

	/**
	 * Initial minimum date value
	 */
	@prop({type: [String, Number, Date], required: false})
	readonly minProp?: Range;

	/**
	 * Time margin for .min and .max
	 */
	@prop(Number)
	readonly timeMargin: number = (1).second();

	/** @override */
	@p({cache: false})
	get value(): V {
		return Object.fastClone(<V>this.field.get('valueStore'));
	}

	/** @override */
	set value(value: V) {
		const
			{min, max} = this;

		const
			store = <V>this.field.get('valueStore');

		for (let i = 0; i < value.length; i++) {
			let
				el = value[i];

			if (min && min.isAfter(el)) {
				el = min.clone();

			} else if (max && max.isBefore(el)) {
				el = max.clone();
			}

			if (!store[i] || (<number>Math.abs(store[i].valueOf() - el.valueOf())).seconds() >= this.timeMargin) {
				this.field.set(`valueStore.${i}`, el);
			}
		}
	}

	/** @override */
	get default(): V {
		return <V>(<any[]>[]).concat(this.defaultProp || new Date());
	}

	/**
	 * Date pointer
	 */
	get pointer(): Date[] {
		return Object.fastClone(<Date[]>this.field.get('pointerStore'));
	}

	/**
	 * Sets a new date pointer
	 * @param value
	 */
	set pointer(value: Date[]) {
		this.field.set('pointerStore', value);
	}

	/**
	 * Minimum date value
	 */
	@p({cache: false})
	get min(): CanUndef<Date> {
		return this.minProp != null ? Date.create(this.minProp) : undefined;
	}

	/**
	 * Maximum date value
	 */
	@p({cache: false})
	get max(): CanUndef<Date> {
		return this.maxProp != null ? Date.create(this.maxProp) : undefined;
	}

	/**
	 * If true, then the component has a day range
	 */
	get hasDayRange(): boolean {
		return this.value.length > 1;
	}

	/**
	 * If true, then the component has a time range
	 */
	get hasTimeRange(): boolean {
		const v = this.value;
		return this.hasDayRange && v[0].short() === v[1].short();
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
		...iWidth.mods,
		...iSize.mods,

		opened: [
			...iOpenToggle.mods.opened,
			['false']
		],

		rounding: [
			'none',
			['small'],
			'normal',
			'big'
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
	 * Available animation directions
	 */
	@field()
	protected directions: Directions[] = ['right', 'left'];

	/**
	 * Direction of smooth switching month animation
	 */
	@field()
	protected monthSwitchDirection: MonthSwitchDirection = 0;

	/**
	 * If true, then the month switch animation was started
	 */
	@field()
	protected monthSwitchAnimation: boolean = false;

	/** @override */
	@field<bCalendar>((o) => o.sync.link<V>((val) => {
		if (Object.isArray(val)) {
			return <V>val;
		}

		return <V>(<any[]>[]).concat(o.initDefaultValue(val) || []);
	}))

	protected valueStore!: V;

	/**
	 * Date pointer store
	 */
	@field<bCalendar>((o) => o.sync.link<CanArray<Date>>('valueProp', (val = new Date()) => {
		const
			prop = Object.isArray(val) ? val : [val];

		const d = prop.map((v: Date, index) =>
			index > 0 ? prop[index - 1].clone().add({month: 1}) : v.clone().beginningOfMonth().set({
				hour: v.getHours(),
				minute: v.getMinutes(),
				second: v.getSeconds(),
				millisecond: v.getMilliseconds()
			})
		);

		if (o.pointerStore && Object.fastCompare(d, o.pointerStore)) {
			return o.pointerStore;
		}

		if (o.shown && o.pointerStore) {
			const
				oldMonth = o.pointerStore[0].getMonth(),
				newMonth = d[0].getMonth();

			if (oldMonth !== newMonth) {
				o.runMonthSwitching(<MonthSwitchDirection>Number(newMonth > oldMonth));
			}
		}

		return d;
	}))

	protected pointerStore!: Date[];

	/**
	 * If true, then the component has a single value instead of a list
	 */
	protected get isSingleValue(): boolean {
		return !Object.isArray(this.valueProp);
	}

	/**
	 * Month animation enter class for switching
	 */
	@p({cache: false})
	protected get animateMonthEnterClass(): string {
		return `animated fadeIn${this.directions[Number(!this.monthSwitchDirection)].capitalize()}`;
	}

	/**
	 * Title for a calendar dropdown
	 */
	@p({cache: false})
	protected get dropdownTitle(): string {
		let
			title = '';

		for (let o = this.pointer, i = 0; i < o.length; i++) {
			title += (i > 0 ? ' - ' : '') + o[i].format('M:long');
		}

		return title;
	}

	/**
	 * Label for a calendar input
	 */
	protected get labelText(): string {
		const
			val = this.value,
			date = 'd;M;Y;';

		let
			label = '';

		if (this.hasTimeRange) {
			let
				from = '';

			for (let i = 0; i < val.length; i++) {
				from += (i > 0 && t` to ` || '') + val[i].format('h;m');
			}

			label = t`${val[0].format(date)} from ${from}`;

		} else {
			for (let i = 0; i < val.length; i++) {
				label += (i > 0 && ' - ' || '') + val[i].format(date);
			}
		}

		return label;
	}

	/** @override */
	protected readonly $refs!: {
		input: HTMLInputElement;
		dropdown?: HTMLElement;
	};

	/**
	 * Index for next date selecting
	 * (range control)
	 */
	@system()
	private _nextSelectDate?: number;

	/** @see iOpenToggle.open */
	async open(): Promise<boolean> {
		const
			res = await iOpenToggle.open(this);

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
			} catch {}
		}

		return res;
	}

	/** @see iOpenToggle.close */
	async close(): Promise<boolean> {
		const
			res = await iOpenToggle.close(this);

		if (res) {
			this.shown = false;
		}

		return res;
	}

	/** @see iOpenToggle.toggle */
	toggle(): Promise<boolean> {
		return iOpenToggle.toggle(this);
	}

	/** @see iIcon.getIconLink */
	getIconLink(iconId: string): string {
		return iIcon.getIconLink(iconId);
	}

	/** @see iOpenToggle.onOpenedChange */
	onOpenedChange(e: ModEvent | SetModEvent): void {
		// ...
	}

	/** @see iOpenToggle.onKeyClose */
	onKeyClose(e: KeyboardEvent): Promise<void> {
		return iOpenToggle.onKeyClose(this, e);
	}

	/** @see iOpenToggle.onTouchClose */
	onTouchClose(e: MouseEvent): Promise<void> {
		return iOpenToggle.onTouchClose(this, e);
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
			range = this.hasDayRange,
			pointer = this.pointer[valueIndex];

		if (!pointer) {
			return [];
		}

		let
			startShort,
			endShort;

		if (range) {
			startShort = val[0].short();
			endShort = val[1].short();
		}

		const
			days = <Day[][]>[];

		for (let o = new Array(pointer.daysInMonth()), i = 0; i < o.length; i++) {
			if (!days.length) {
				days.push([]);
			}

			const
				day = pointer.clone().set({day: i + 1}),
				dayShort = day.short();

			const rangeBounds = range ? {
				isDateStart: startShort === dayShort,
				isDateEnd: endShort === dayShort
			} : false;

			if (!days[0].length) {
				days[0] = days[0].concat(new Array((day.getDay() || 7) - 1).fill({
					active: false,
					text: ''
				}));

				if (days[0].length === 7) {
					days.push([]);
				}
			}

			let
				active = false;

			for (let i = 0; i < val.length; i++) {
				const
					el = val[i];

				if (Boolean(el && el.short() === dayShort)) {
					active = true;
					break;
				}
			}

			const obj = {
				active,
				disabled: Boolean(min && min.isAfter(day) || max && max.isBefore(day)),
				inRange: Boolean(range && day > val[0] && day < val[1]),
				rangeStart: rangeBounds && rangeBounds.isDateStart,
				rangeEnd: rangeBounds && rangeBounds.isDateEnd,
				text: String(i + 1)
			};

			if (days[days.length - 1].push(obj) % 7 === 0) {
				days.push([]);
			}
		}

		return days;
	}

	/**
	 * Executes the month switcher
	 * @param dir - index for directions
	 */
	protected runMonthSwitching(dir: MonthSwitchDirection): void {
		this.monthSwitchDirection = dir;
		this.monthSwitchAnimation = true;
	}

	/**
	 * Sets simple/multiple date(s) to the calendar
	 *
	 * @param date - new date value
	 * @param index - selected item index
	 * @emits actionChange(value: V)
	 */
	protected setDate(date: Date, index?: number): Date[] {
		const
			now = index !== undefined ? index : this._nextSelectDate !== undefined ? this._nextSelectDate : 0,
			next = Number(!now);

		let
			selectedDays = this.value;

		if (selectedDays.length === 2) {
			const
				c = selectedDays[now] = date;

			if (c.short() !== selectedDays[next].short() && now === 0) {
				selectedDays[next] = date.clone().endOfDay();
			}

			this._nextSelectDate = next;
			selectedDays = selectedDays.sort((a, b) => a.isAfter(b) ? 1 : b.isAfter(a) ? -1 : 0);

		} else {
			selectedDays[now] = date;
		}

		this.value = selectedDays;
		this.emit('actionChange', this.isSingleValue ? this.value[0] : this.value);

		return this.value;
	}

	/** @see iOpenToggle.initCloseHelpers */
	@hook('beforeDataCreate')
	protected initCloseHelpers(events?: CloseHelperEvents): void {
		iOpenToggle.initCloseHelpers(this, events);
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		//iOpenToggle.initModEvents(this);
	}

	/**
	 * Handler: day switch
	 *
	 * @param days - number of switching days
	 * @param index - calendar index
	 * @emits actionChange(value: V)
	 */
	protected async onSwitchDay(days: number, index: number = 0): Promise<void> {
		const
			selectedDay = this.value,
			val = selectedDay[index] = (selectedDay[index] || new Date().beginningOfDay()).add({days}),
			pointer = this.pointer[index];

		this.value = selectedDay;
		this.emit('actionChange', this.isSingleValue ? val : this.value);

		if (val.format('M;Y') !== pointer.format('M;Y')) {
			this.field.set(`pointerStore.${index}`, pointer.set({
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
		for (let o = this.pointer, i = 0; i < o.length; i++) {
			this.field.set(`pointerStore.${i}`, o[i].add({months}));
		}

		this.runMonthSwitching(months < 0 ? 0 : 1);
		await this.open();
	}

	/**
	 * Handler: day select
	 *
	 * @param e
	 * @emits actionChange(value: V)
	 */
	@watch({
		field: '?$el:click',
		wrapper: (o, cb) => o.dom.delegateElement('day', cb)
	})

	protected onDaySelect(e: Event): void {
		const
			target = <HTMLElement>e.delegateTarget,
			calendar = Number(target.dataset.calendar);

		if (this.block.getElMod(target, 'day', 'active') !== 'true' || this.value.length > 1) {
			this.setDate(this.pointer[calendar].clone().set({day: Number(target.textContent)}));
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
}
