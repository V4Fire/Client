/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import bInput, { component, prop, field, watch, p, Value, FormValue } from 'form/b-input/b-input';
export * from 'form/b-input/b-input';

export const
	$$ = symbolGenerator();

@component({
	model: {
		prop: 'pointerProp',
		event: 'onChange'
	}
})

export default class bInputTime<
	V extends Value = Value,
	FV extends FormValue = FormValue,
	D extends Dictionary = Dictionary
> extends bInput<V, FV, D> {
	/** @override */
	readonly placeholder: string = '__:__';

	/** @override */
	readonly mask: string = '%d%d:%d%d';

	/** @override */
	readonly resetButton: boolean = false;

	/**
	 * Initial time pointer
	 */
	@prop({type: Date, required: false})
	readonly pointerProp?: Date;

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
	 * Time pointer
	 */
	get pointer(): CanUndef<Date> {
		return Object.fastClone(this.getField('pointerStore'));
	}

	/**
	 * Sets a new time pointer
	 * @param value
	 */
	set pointer(value: CanUndef<Date>) {
		this.setField('pointerStore', this.getNPointer(this.value, value, this.pointerStore));
	}

	/** @override */
	// @ts-ignore
	get default(): unknown {
		return this.defaultProp !== undefined ? Date.create(this.defaultProp) : undefined;
	}

	/** @override */
	protected readonly blockValueField: string = 'pointer';

	/** @override */
	@field<bInputTime>({
		after: 'pointerStore',
		init: (o, data) => o.link<V>((val) =>
			o.getTimeFormat(o.getNPointer(val, ('pointerStore' in o ? o.pointerStore : <Date>data.pointerStore))))
	})

	protected valueStore!: V;

	/**
	 * Time pointer store
	 */
	@field<bInputTime>((o) => o.link<Date>((val) => {
		val = o.getNPointer(undefined, val, o.pointerStore);

		if (val === undefined) {
			return o.initDefaultValue();
		}

		return val;
	}))

	protected pointerStore?: Date;

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		this.getNPointer = this.instance.getNPointer.bind(this);
	}

	/**
	 * Synchronization for the valueStore field
	 * @param [value]
	 */
	@watch('valueStore')
	protected async syncValueStoreWatcher(value: string): Promise<void> {
		try {
			await this.async.wait(() => this.mods.focused !== 'true', {label: $$.$$valueStore});
			this.pointer = this.getNPointer(value, this.getField('pointerStore'));
		} catch {}
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
	protected getTimeFormat(date?: Date): V {
		return <V>(date ? date.format('{HH}:{mm}') : '');
	}

	/**
	 * Returns normalized date value pointer by the specified parameters
	 *
	 * @param [value] - input value
	 * @param pointer - time pointer
	 * @param buffer - time buffer
	 */
	protected getNPointer(value: CanUndef<string>, pointer: Date, buffer?: CanUndef<Date>): Date;

	/**
	 * @param [value] - input value
	 * @param [pointer] - time pointer
	 * @param [buffer] - time buffer
	 */
	protected getNPointer(value?: string, pointer?: Date, buffer?: Date): CanUndef<Date>;
	protected getNPointer(value?: string, pointer?: Date, buffer: CanUndef<Date> = pointer): CanUndef<Date> {
		if (!pointer || !buffer) {
			if (value === undefined) {
				return undefined;
			}

			pointer = buffer = new Date();
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

			this.pointer = this.getNPointer(value, this.getField('pointerStore'));
			this.emit('actionChange', this.pointer);

		} catch {}
	}
}
