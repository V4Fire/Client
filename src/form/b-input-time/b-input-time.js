'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import bInput from 'form/b-input/b-input';
import { field, params } from 'super/i-block/i-block';
import { component } from 'core/component';

export const
	$$ = new Store();

@component()
export default class bInputTime extends bInput {
	/** @override */
	model: ?Object = {
		prop: 'pointerProp',
		event: 'onChange'
	};

	/** @override */
	type: ?string = 'text';

	/** @override */
	placeholder: ?string = '__:__';

	/** @override */
	mask: ?string = '%d%d:%d%d';

	/** @override */
	resetButton: boolean = false;

	/**
	 * If true, then the block value will be marked as UTC
	 */
	utc: boolean = false;

	/**
	 * Initial time pointer
	 */
	@params({default: () => new Date()})
	pointerProp: ?Date;

	/** @override */
	@field()
	blockValueField: string = 'pointer';

	/** @override */
	@field((o) => o.link('valueProp', (val) => timeFormat(converter.call(o, val, o.pointerStore))))
	valueStore: ?Date;

	/**
	 * Time pointer store
	 */
	@field((o) => o.link('pointerProp', (val) => {
		val = converter.call(o, null, val, o.pointerStore);

		if (val === undefined) {
			o.localEvent.once('component.created', () => o.pointerStore = o.default);
			return;
		}

		return val;
	}))

	pointerStore: Date;

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
	timeMargin: number = (5).seconds();

	/**
	 * The minimum date value
	 */
	@params({cache: false})
	get min(): Date {
		return this.minProp != null ? Date.create(this.minProp) : undefined;
	}

	/** @override */
	set valueBuffer(value: string) {
		this.pointer = converter.call(this, value, this.pointerStore);
		this.valueBufferStore = timeFormat(this.pointer);
	}

	/**
	 * The maximum date value
	 */
	@params({cache: false})
	get max(): Date {
		return this.maxProp != null ? Date.create(this.maxProp) : undefined;
	}

	/**
	 * Time pointer
	 */
	get pointer(): Date {
		return Object.fastClone(this.pointerStore);
	}

	/**
	 * Sets a new time pointer
	 * @param value
	 */
	set pointer(value: Date) {
		this.pointerStore = converter.call(this, this.value, value, this.pointerStore);
	}

	/**
	 * Input value synchronization
	 * @param [value]
	 */
	async $$valueStore(value: ?string) {
		try {
			await this.async.wait(() => this.mods.focused !== 'true', {label: $$.$$valueStore});
			this.valueBuffer = value;

		} catch (_) {}
	}

	/** @override */
	async onRawDataChange(value) {
		try {
			await this.async.wait(() => this.mods.focused !== 'true', {label: $$.change});

			this.valueBuffer = value;
			this.emit('actionChange', this.pointer);

		} catch (_) {}
	}

	/**
	 * Pointer synchronization
	 */
	@params({immediate: true})
	async $$pointerStore() {
		this.value = timeFormat(this.pointer);
	}
}

/**
 * Returns a string time value by the specified date
 * @param date
 */
function timeFormat(date: ?Date): ?string {
	return date && date.format('{HH}:{mm}');
}

/**
 * Block value converter
 *
 * @this {bInputTime}
 * @param [value] - input value
 * @param [pointer] - time pointer
 * @param [buffer] - time buffer
 */
function converter(value: ?string, pointer: ?Date, buffer?: Date = pointer): Date {
	if (!pointer) {
		return undefined;
	}

	const
		{min, max} = this;

	let d = pointer.clone();
	if (value) {
		const
			chunks = value.split(':');

		let
			hours = Math.abs(parseInt(chunks[0]) || 0),
			minutes = Math.abs(parseInt(chunks[1]) || 0);

		if (minutes > 59) {
			hours++;
			minutes = 59;
		}

		if (hours > 23) {
			hours = 23;
			minutes = 59;
		}

		d.set({hours, minutes, seconds: 0, milliseconds: 0});
	}

	if (min && min.isAfter(d)) {
		d = min.clone();

	} else if (max && max.isBefore(d)) {
		d = max.clone();
	}

	return Math.abs(d - buffer) > this.timeMargin ? d : buffer;
}
