/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { deprecated } from 'core/functools/deprecation';

import iWidth from 'traits/i-width/i-width';
import iSize from 'traits/i-size/i-size';

import iInputText, {

	component,
	prop,
	field,

	watch,
	hook,

	ModsDecl,
	ValidatorsDecl

} from 'super/i-input-text/i-input-text';

import Validators from 'form/b-input/modules/validators';
import type { Value, FormValue } from 'form/b-input/interface';

export * from 'super/i-input/i-input';
export * from 'form/b-input/modules/validators';
export * from 'form/b-input/interface';

export { Value, FormValue };

export const
	$$ = symbolGenerator();

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bInput extends iInputText implements iWidth, iSize {
	/** @override */
	readonly Value!: Value;

	/** @override */
	readonly FormValue!: FormValue;

	/** @override */
	@prop({type: String, required: false})
	readonly valueProp?: this['Value'];

	/** @override */
	@prop({type: String, required: false})
	readonly defaultProp?: this['Value'];

	/**
	 * Icon to show before an input
	 */
	@prop({type: String, required: false})
	readonly preIcon?: string;

	/**
	 * Name of the used component to show `preIcon`
	 * @default `'b-icon'`
	 */
	@prop({type: String, required: false})
	readonly preIconComponent?: string;

	/**
	 * Tooltip text for `preIcon`
	 */
	@prop({type: String, required: false})
	readonly preIconHint?: string;

	/**
	 * Tooltip position for `preIcon`
	 */
	@prop({type: String, required: false})
	readonly preIconHintPos?: string;

	/**
	 * Icon to show after an input
	 */
	@prop({type: String, required: false})
	readonly icon?: string;

	/**
	 * Name of the used component to show `icon`
	 * @default `'b-icon'`
	 */
	@prop({type: String, required: false})
	readonly iconComponent?: string;

	/**
	 * Tooltip text for `icon`
	 */
	@prop({type: String, required: false})
	readonly iconHint?: string;

	/**
	 * Tooltip position for `icon`
	 */
	@prop({type: String, required: false})
	readonly iconHintPos?: string;

	/**
	 * Component to show "in-progress" state or
	 * Boolean, if need to show progress by slot or `b-progress-icon`
	 */
	@prop({type: [String, Boolean], required: false})
	readonly progressIcon?: string | boolean;

	/** @override */
	get value(): this['Value'] {
		return this.field.get<this['Value']>('valueStore')!;
	}

	/** @override */
	set value(value: this['Value']) {
		this.field.set('valueStore', value);
		this.text = value;
	}

	/** @override */
	get default(): unknown {
		return this.defaultProp != null ? String(this.defaultProp) : '';
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iWidth.mods,
		...iSize.mods,

		empty: [
			'true',
			'false'
		]
	};

	/** @override */
	static validators: ValidatorsDecl = {
		...<any>iInputText.validators,
		...Validators
	};

	/** @override */
	@field({
		after: 'valueStore',
		init: (o, data) => o.sync.link((text) => {
			o.sync.link(['textStore', 'valueProp'], link);
			return link(<any>o.valueProp);

			function link(textFromValue: CanUndef<Value>): string {
				text = textFromValue === undefined ? text ?? data.valueStore : textFromValue;
				return text !== undefined ? String(text) : '';
			}
		})
	})

	protected textStore!: string;

	/** @override */
	async clear(): Promise<boolean> {
		await this.clearText();
		return super.clear();
	}

	/**
	 * @deprecated
	 * @see [[bInput.selectText]]
	 */
	@deprecated({renamedTo: 'selectText'})
	async selectAll(): Promise<boolean> {
		return this.selectText();
	}

	/**
	 * Handler: updating of a component text value
	 */
	@watch('text')
	@hook('beforeDataCreate')
	protected onTextUpdate(): void {
		this.value = this.text;
	}

	/**
	 * Handler: manual editing of a component text value
	 * @emits `actionChange(value: V)`
	 */
	protected onEdit(): void {
		if (this.compiledMask != null) {
			return;
		}

		this.emit('actionChange', this.value);
	}

	/**
	 * Handler: clearing of a component value
	 * @emits `actionChange(value: V)`
	 */
	protected async onClear(): Promise<void> {
		if (await this.clear()) {
			this.emit('actionChange', this.value);
		}
	}

	/** @override */
	protected onMaskInput(): Promise<void> {
		return super.onMaskInput().then(() => {
			this.emit('actionChange', this.value);
		});
	}

	/** @override */
	protected onMaskKeyPress(e: KeyboardEvent): void {
		super.onMaskKeyPress(e);
		this.emit('actionChange', this.value);
	}

	/** @override */
	protected onMaskDelete(e: KeyboardEvent): void {
		super.onMaskDelete(e);
		this.emit('actionChange', this.value);
	}
}
