'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iInput from 'super/i-input/i-input';
import Store from 'core/store';
import { field, params, abstract, PARENT } from 'super/i-block/i-block';
import { component } from 'core/component';

const
	$C = require('collection.js');

export const
	$$ = new Store();

@component()
export default class bCalendar extends iInput {
	/** @override */
	@params({default: () => new Date()})
	valueProp: ?Date | Array<Date>;

	/** @override */
	dataType: ?Function = getDataType;

	/**
	 * If true, then the block value will be marked as UTC
	 */
	utc: boolean = false;

	/**
	 * Initial maximum date value
	 */
	maxProp: ?string | number | Date;

	/**
	 * Initial minimum date value
	 */
	minProp: ?string | number | Date;

	/**
	 * Time margin for .min and .max
	 */
	timeMargin: number = (1).second();

	/** @override */
	@field((o) => o.link('valueProp', (val) => {
		if (String(val) !== String(o.valueStore)) {
			return Object.isArray(val) ? val : [val];
		}

		return Object.isArray(o.valueStore) ? o.valueStore : [o.valueStore];
	}))

	valueStore: ?Date | Array<Date>;

	/**
	 * If true, then will be shown the datepicker range
	 */
	@field()
	dayRange: boolean = false;

	/**
	 * If true, then wil be shown the time range
	 */
	@field()
	timeRange: boolean = false;

	/**
	 * Flag for setting a date parameter as Date
	 * (by default data type is Array)
	 */
	@field()
	isStringInput: ?boolean = false;

	/**
	 * Dropdown position modifier
	 */
	@field()
	position: string = 'bottom';

	/**
	 * Direction of smooth switching month animation
	 */
	@field()
	monthSwitchDirection: number = 0;

	/**
	 * Flag for start month switch animation
	 */
	@field()
	isMonthSwitchAnimation: boolean = false;

	/**
	 * Available animation directions
	 */
	@field()
	directions: Array = ['right', 'left'];

	/**
	 * Date pointer store
	 */
	@field((o) => o.link('valueProp', (val = new Date()) => {
		const
			prop = Object.isArray(val) ? val : [val];

		const d = prop.map((v, index) => index > 0 ? prop[index - 1].clone().addMonths(1) : v.clone().beginningOfMonth().set({
			hour: v.getHours(),
			minute: v.getMinutes(),
			second: v.getSeconds(),
			millisecond: v.getMilliseconds()
		}));

		if (o.pointerStore && d.isEqual(o.pointerStore)) {
			return o.pointerStore;
		}

		if (o.isShown && o.pointerStore) {
			const
				oldMonth = o.pointerStore[0].getMonth(),
				newMonth = d[0].getMonth();

			if (oldMonth !== newMonth) {
				o.runMonthSwitching(Number(newMonth > oldMonth));
			}
		}

		return d;
	}))

	pointerStore: ?Date | Array<Date>;

	/**
	 * If true, then dropdown is shown.
	 * Needed to fit dropdown in window (reposition by class name)
	 */
	@field()
	isShown: boolean = false;

	/**
	 * Index for next date selecting (range control)
	 * @private
	 */
	@abstract
	_nextSelectItem: ?number;

	/** @override */
	get $refs(): {input: HTMLInputElement} {}

	/** @inheritDoc */
	static mods = {
		rounding: [
			PARENT,
			['small']
		],

		theme: [
			PARENT,
			['unstyled']
		]
	};

	/** @override */
	@params({cache: false})
	get value(): ?Date | Array<Date> {
		return Object.fastClone(this.valueStore);
	}

	/** @override */
	set value(value: ?Date | Array<Date>) {
		const
			{min, max} = this;

		$C(value).forEach((v, i) => {
			if (min && min.isAfter(v)) {
				v = min.clone();

			} else if (max && max.isBefore(v)) {
				v = max.clone();
			}

			if (Math.abs(this.valueStore[i] - v).seconds() >= this.timeMargin) {
				this.$set(this.valueStore, i, v);
			}
		});
	}

	/**
	 * The minimum date value
	 */
	@params({cache: false})
	get min(): Date {
		return this.minProp != null ? Date.create(this.minProp) : undefined;
	}

	/**
	 * The maximum date value
	 */
	@params({cache: false})
	get max(): Date {
		return this.maxProp != null ? Date.create(this.maxProp) : undefined;
	}

	/**
	 * Title for a calendar dropdown
	 */
	@params({cache: false})
	get dropdownTitle(): string {
		const title = $C(this.pointer).reduce(
			(str, item, i) => str + (i > 0 ? ' - ' : '') + this.t(item.format('{Month}', 'en')), '');

		return title.capitalize();
	}

	/**
	 * Month enter class on switching
	 */
	@params({cache: false})
	get animateMonthEnterClass(): string {
		return `animated fadeIn${this.directions[Number(!this.monthSwitchDirection)].capitalize()}`;
	}

	/**
	 * Date pointer
	 */
	get pointer(): ?Date | Array<Date> {
		return Object.fastClone(this.pointerStore);
	}

	/**
	 * Sets a new date pointer
	 * @param value
	 */
	set pointer(value: ?Date | Array<Date>) {
		this.pointerStore = value;
	}

	/**
	 * List of month days
	 * @param index - calendar index
	 */
	dayInMonth(index: number): Array<Object> {
		const {min, max} = this;

		return $C(new Array(this.pointer[index].daysInMonth())).reduce((arr, el, i) => {
			if (!arr.length) {
				arr.push([]);
			}

			const
				day = this.pointer[index].clone().set({date: i + 1});

			if (!arr[0].length) {
				arr[0] = arr[0].concat(new Array((day.getDay() || 7) - 1).fill({
					active: false,
					text: ''
				}));

				if (arr[0].length === 7) {
					arr.push([]);
				}
			}

			const rangeBorders = (() => {
				if (this.dayRange) {
					const
						isDateStart = Date.create(this.value[0].short()).is(day.short()),
						isDateEnd = Date.create(this.value[1].short()).is(day.short());

					return {isDateStart, isDateEnd};
				}

				return false;
			})();

			const
				active = $C(this.value).some((v) => Boolean(v && Date.create(v.short()).is(day.short())));

			const obj = {
				active,
				disabled: Boolean(min && min.isAfter(day) || max && max.isBefore(day)),
				inRange: Boolean(this.dayRange && day > this.value[0] && day < this.value[1]),
				rangeStart: rangeBorders.isDateStart,
				rangeEnd: rangeBorders.isDateEnd,
				text: String(i + 1)
			};

			if (arr[arr.length - 1].push(obj) % 7 === 0) {
				arr.push([]);
			}

			return arr;
		}, []);
	}

	/**
	 * Label for a calendar input
	 */
	get labelText(): string {
		let label = '';
		if (this.timeRange) {
			const day = this.value[0].format('{dd}.{MM}.{yyyy}');
			label = t`${day} from ${
				$C(this.value).reduce((str, v, ind) => str + (ind > 0 && t` to ` || '') + v.format('{HH}:{mm}'), '')
			}`;

		} else {
			label = $C(this.value).reduce((str, v, ind) => str + (ind > 0 && ' - ' || '') + v.format('{dd}.{MM}.{yyyy}'), '');
		}

		return label;
	}

	/**
	 * Executes the month switcher
	 * @param dir - index for directions (0 || 1)
	 */
	runMonthSwitching(dir: number) {
		this.monthSwitchDirection = dir;
		this.isMonthSwitchAnimation = true;
	}

	/**
	 * Sets simple/multiple date(s) to calendar
	 *
	 * @param date - new date value
	 * @param index - selected item index
	 * @emits actionChange(value: ?Date | Array<Date>)
	 */
	setDates(date: Date, index: ?number): Array<Date> {
		const
			now = index !== undefined ? index : this._nextSelectItem !== undefined ? this._nextSelectItem : 0,
			next = Number(!now);

		let
			selectedDays = Object.isArray(this.value) ? this.value : [this.value];

		if (selectedDays.length === 2) {
			selectedDays[now] = date;

			const
				nowShort = selectedDays[now].short(),
				nextShort = selectedDays[next].short();

			if (nowShort !== nextShort) {
				if (now === 0) {
					selectedDays[next] = date.clone().endOfDay();

				} else {
					this.timeRange = false;
				}
			}

			this._nextSelectItem = next;
			selectedDays = selectedDays.sort(this.sortDates);

		} else {
			selectedDays[now] = date;
			this.timeRange = false;
		}

		this.value = selectedDays;
		this.emit('actionChange', this.isStringInput ? this.value[0] : this.value);

		return this.value;
	}

	/**
	 * Date sort function
	 */
	sortDates(a: Date, b: Date): number {
		return a.isAfter(b) ? 1 : b.isAfter(a) ? -1 : 0;
	}

	/** @override */
	async open(): boolean {
		const
			res = await super.open();

		if (res) {
			try {
				await this.waitRef('dropdown', {label: $$.openedDropdown});

				const
					offset = this.$refs.dropdown.getBoundingClientRect();

				if (offset.left < 0) {
					this.position = 'bottom-right';

				} else if (offset.right > window.outerWidth) {
					this.position = 'bottom-left';
				}

				this.isShown = true;
			} catch (_) {}
		}

		return res;
	}

	/** @override */
	async close(): boolean {
		const
			res = await super.close();

		if (res) {
			this.isShown = false;
		}

		return res;
	}

	/**
	 * Handler: day switch
	 *
	 * @param days - number of switching days
	 * @param index - calendar index
	 * @emits actionChange(value: ?Date | Array<Date>)
	 */
	async onSwitchDay(days: number, index: number = 0) {
		const selectedDay = Object.isArray(this.value) ? this.value : [this.value];
		selectedDay[index] = selectedDay[index].addDays(days);

		this.value = selectedDay;
		this.emit('actionChange', this.isStringInput ? this.value[0] : this.value);

		if (this.value[index].format('{MM}:{yyyy}') !== this.pointer[index].format('{MM}:{yyyy}')) {
			this.$set(this.pointerStore, index, this.pointer[index].set({
				month: this.value[index].getMonth(),
				year: this.value[index].getFullYear()
			}));
		}

		await this.open();
	}

	/**
	 * Handler: month switch
	 * @param months - number of switching months
	 */
	async onSwitchMonth(months: number) {
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
	 * @emits actionChange(value: ?Date | Array<Date>)
	 */
	onDaySelect(e: Event) {
		const
			target = e.delegateTarget,
			calendar = Number(target.dataset.calendar);

		if (this.block.getElMod(target, 'day', 'active') !== 'true' || this.value.length > 1) {
			this.setDates(this.pointer[calendar].clone().set({date: Number(target.textContent)}));
		}
	}

	/**
	 * Handler: time change
	 */
	onTimeChange(el: bInputTime, value: Date) {
		const {index} = el.$el.dataset;
		this.setDates(value, Number(index));
	}

	/**
	 * Handler: month animation transition end
	 */
	async onMonthSwitchEnd() {
		this.isMonthSwitchAnimation = false;
	}

	/** @override */
	created() {
		this.$watch('valueProp', (val) => {
			if (!Object.isArray(val)) {
				this.isStringInput = true;
				this.dayRange = false;

			} else {
				this.dayRange = val.length > 1;
				this.timeRange = this.dayRange && val[0].short() === val[1].short();
			}
		}, {immediate: true});

		this.initCloseHelpers();
	}

	/** @inheritDoc */
	mounted() {
		this.async.on(this.$el, 'click', {
			label: $$.daySelection,
			fn: this.delegateElement('day', this.onDaySelect)
		});
	}
}

function getDataType(): Array | Date {
	return this.isStringInput ? this.value[0] : this.value;
}
