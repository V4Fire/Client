/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:form/b-input/README.md]]
 * @packageDocumentation
 */

//#if demo
import 'models/demo/input';
//#endif

import symbolGenerator from 'core/symbol';
import { deprecated } from 'core/functools/deprecation';

import iInputText, {

	component,
	prop,
	system,

	watch,
	hook,

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

/**
 * Component to create a form input
 */
@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bInput extends iInputText {
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
	 * Icon to show before the input
	 *
	 * @example
	 * ```
	 * < b-input :preIcon = 'dropdown'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIcon?: string;

	/**
	 * Name of the used component to show `preIcon`
	 *
	 * @default `'b-icon'`
	 * @example
	 * ```
	 * < b-input :preIconComponent = 'b-my-icon'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconComponent?: string;

	/**
	 * Tooltip text to show during hover the cursor on `preIcon`
	 *
	 * @example
	 * ```
	 * < b-input :preIcon = 'dropdown' | :preIconHint = 'Show variants'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconHint?: string;

	/**
	 * Tooltip position to show during hover the cursor on `preIcon`
	 *
	 * @see [[gHint]]
	 * @example
	 * ```
	 * < b-input &
	 *   :preIcon = 'dropdown' |
	 *   :preIconHint = 'Show variants' |
	 *   :preIconHintPos = 'bottom-right'
	 * .
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconHintPos?: string;

	/**
	 * Icon to show after the input
	 *
	 * @example
	 * ```
	 * < b-input :icon = 'dropdown'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly icon?: string;

	/**
	 * Name of the used component to show `icon`
	 *
	 * @default `'b-icon'`
	 * @example
	 * ```
	 * < b-input :iconComponent = 'b-my-icon'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconComponent?: string;

	/**
	 * Tooltip text to show during hover the cursor on `icon`
	 *
	 * @example
	 * ```
	 * < b-input :icon = 'dropdown' | :iconHint = 'Show variants'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconHint?: string;

	/**
	 * Tooltip position to show during hover the cursor on `icon`
	 *
	 * @see [[gHint]]
	 * @example
	 * ```
	 * < b-input :icon = 'dropdown' | :preIconHint = 'Show variants' | :iconHintPos = 'bottom-right'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconHintPos?: string;

	/**
	 * A component to show "in-progress" state or
	 * Boolean, if need to show progress by slot or `b-progress-icon`
	 *
	 * @default `'b-progress-icon'`
	 * @example
	 * ```
	 * < b-input :progressIcon = 'b-my-progress-icon'
	 * ```
	 */
	@prop({type: [String, Boolean], required: false})
	readonly progressIcon?: string | boolean;

	/** @override */
	get value(): this['Value'] {
		return this.field.get<this['Value']>('valueStore')!;
	}

	/** @override */
	set value(value: this['Value']) {
		this.text = value;
		this.field.set('valueStore', this.text);
	}

	/** @override */
	get default(): unknown {
		return this.defaultProp != null ? String(this.defaultProp) : '';
	}

	/** @override */
	static validators: ValidatorsDecl = {
		...<any>iInputText.validators,
		...Validators
	};

	/** @override */
	@system()
	protected valueStore!: this['Value'];

	/** @override */
	@system({
		after: 'valueStore',
		init: (o) => o.sync.link((text) => {
			o.watch('valueProp', {label: $$.textStore}, () => {
				const label = {
					label: $$.textStoreToValueStore
				};

				o.watch('valueStore', label, (v) => {
					o.async.clearAll(label);
					return link(v);
				});
			});

			return link(<any>o.valueProp);

			function link(textFromValue: CanUndef<string>): string {
				const
					resolvedText = textFromValue === undefined ? text ?? o.field.get('valueStore') : textFromValue,
					str = resolvedText !== undefined ? String(resolvedText) : '';

				if (o.isNotRegular) {
					o.waitStatus('ready', {label: $$.textStoreSync}).then(() => o.text = str, stderr);

				} else if (o.hook === 'updated') {
					o.text = str;
				}

				return str;
			}
		})
	})

	protected textStore!: string;

	/** @override */
	async clear(): Promise<boolean> {
		const v = this.value;
		await this.clearText();

		if (v !== '') {
			return super.clear();
		}

		return false;
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
	@watch('textStore')
	@hook('beforeDataCreate')
	protected onTextUpdate(): void {
		this.field.set('valueStore', this.text);
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
