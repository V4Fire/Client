/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import bInput, { component, prop, field, watch, p } from 'form/b-input/b-input';
export * from 'form/b-input/b-input';

export const
	$$ = symbolGenerator();

@component({
	model: {
		prop: 'pointerProp',
		event: 'onChange'
	}
})

export default class bInputTime<T extends Dictionary = Dictionary> extends bInput<T> {
	/** @override */
	readonly placeholder: string = '__:__';

	/** @override */
	readonly mask: string = '%d%d:%d%d';

	/** @override */
	readonly resetButton: boolean = false;

	/**
	 * Initial time pointer
	 */
	@prop()
	readonly pointerProp!: Date;

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
	readonly timeMargin: number = (5).seconds();

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
		this.pointerStore = this.convertValue(this.value, value, this.pointerStore);
	}

	/** @override */
	protected readonly blockValueField: string = 'pointer';

	/** @override */
	@field((o) => o.link('valueProp', (val) => {
		const ctx: bInputTime = <any>o;
		return ctx.getTimeFormat(ctx.convertValue(val, ctx.pointerStore));
	}))

	protected valueStore!: Date;

	/**
	 * Time pointer store
	 */
	@field((o) => o.link('pointerProp', (val) => {
		const ctx: bInputTime = <any>o;
		val = ctx.convertValue(undefined, val, ctx.pointerStore);

		if (val === undefined) {
			return ctx.initDefaultValue();
			return;
		}

		return val;
	}))

	protected pointerStore!: Date;

	/** @override */
	protected set valueBuffer(value: string) {
		this.pointer = this.convertValue(value, this.pointerStore);
		this.valueBufferStore = this.getTimeFormat(this.pointer);
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		this.convertValue = this.instance.convertValue.bind(this);
	}

	/**
	 * Synchronization for the valueStore field
	 * @param [value]
	 */
	@watch({field: 'valueStore'})
	protected async syncValueStoreWatcher(value: string): Promise<void> {
		try {
			await this.async.wait(() => this.mods.focused !== 'true', {label: $$.$$valueStore});
			this.valueBuffer = value;
		} catch (_) {}
	}

	/**
	 * Synchronization for the pointerStore field
	 */
	@watch({field: 'pointerStore', immediate: true})
	protected async syncPointerStoreWatcher(): Promise<void> {
		this.value = this.getTimeFormat(this.pointer);
	}

	/**
	 * Returns a string time value by the specified date
	 * @param [date]
	 */
	protected getTimeFormat(date: Date): string;
	protected getTimeFormat(date: undefined): undefined;
	protected getTimeFormat(date: Date | undefined): string | undefined {
		return date && date.format('{HH}:{mm}');
	}

	/**
	 * Block value converter
	 *
	 * @param [value] - input value
	 * @param pointer - time pointer
	 * @param buffer - time buffer
	 */
	protected convertValue(value: string | undefined, pointer: Date, buffer?: Date | undefined): Date;

	/**
	 * @param [value] - input value
	 * @param [pointer] - time pointer
	 * @param [buffer] - time buffer
	 */
	protected convertValue(
		value: string | undefined,
		pointer?: Date | undefined,
		buffer?: Date | undefined
	): Date | undefined;

	protected convertValue(
		value: string | undefined,
		pointer: Date | undefined,
		buffer: Date | undefined = pointer
	): Date | undefined {
		if (!pointer || !buffer) {
			return undefined;
		}

		const
			{min, max} = this;

		let d = pointer.clone();
		if (value) {
			const
				chunks = value.split(':');

			let
				hours = Math.abs(parseInt(chunks[0], 10) || 0),
				minutes = Math.abs(parseInt(chunks[1], 10) || 0);

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

		return Math.abs(d.valueOf() - buffer.valueOf()) > this.timeMargin ? d : buffer;
	}

	/** @override */
	protected async onRawDataChange(value: any): Promise<void> {
		try {
			await this.async.wait(() => this.mods.focused !== 'true', {
				label: $$.change
			});

			this.valueBuffer = value;
			this.emit('actionChange', this.pointer);

		} catch (_) {}
	}
}
