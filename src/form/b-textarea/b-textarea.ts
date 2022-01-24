/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:form/b-textarea/README.md]]
 * @packageDocumentation
 */

//#if demo
import '@src/models/demo/input';
//#endif

import symbolGenerator from '@src/core/symbol';
import SyncPromise from '@src/core/promise/sync';

import iInputText, {

	component,
	prop,
	system,
	computed,

	hook,
	wait,
	watch,

	TextValidators,
	ValidatorsDecl

} from '@src/super/i-input-text/i-input-text';

import type { Value, FormValue } from '@src/form/b-textarea/interface';

export * from '@src/super/i-input-text/i-input-text';
export * from '@src/form/b-textarea/interface';

export { Value, FormValue };

export const
	$$ = symbolGenerator();

/**
 * Component to create a form textarea
 */
@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bTextarea extends iInputText {
	override readonly Value!: Value;
	override readonly FormValue!: FormValue;
	override readonly rootTag: string = 'span';

	@prop({type: String, required: false})
	override readonly valueProp?: this['Value'];

	@prop({type: String, required: false})
	override readonly defaultProp?: this['Value'];

	/**
	 * How many rows need to add to extend the textarea height when it can't fit the entire content without
	 * showing a scrollbar. The value of one row is equal to `line-height` of the textarea or `font-size`.
	 */
	@prop(Number)
	readonly extRowCount: number = 1;

	override get value(): this['Value'] {
		return this.field.get<this['Value']>('valueStore')!;
	}

	override set value(value: this['Value']) {
		this.text = value;
		this.field.set('valueStore', this.text);
	}

	override get default(): this['Value'] {
		return this.defaultProp != null ? String(this.defaultProp) : '';
	}

	/**
	 * Textarea height
	 */
	get height(): CanPromise<number> {
		return this.waitStatus('ready', () => {
			const {input} = this.$refs;
			return input.scrollHeight + <number>this.borderHeight - <number>this.paddingHeight;
		});
	}

	/**
	 * The maximum textarea height
	 */
	get maxHeight(): CanPromise<number> {
		return this.waitStatus('ready', () => {
			const s = getComputedStyle(this.$refs.input);
			return this.parse(s.maxHeight) + <number>this.borderHeight - <number>this.paddingHeight;
		});
	}

	/**
	 * Height of a newline.
	 * It depends on `line-height/font-size` of the textarea.
	 */
	get newlineHeight(): CanPromise<number> {
		return this.waitStatus('ready', () => {
			const
				s = getComputedStyle(this.$refs.input),
				lineHeight = parseFloat(s.lineHeight);

			return isNaN(lineHeight) ? parseFloat(s.fontSize) : lineHeight;
		});
	}

	/**
	 * Number of remaining characters that the component can contain
	 */
	@computed({dependencies: ['value']})
	get limit(): CanUndef<number> {
		if (this.maxLength === undefined) {
			return undefined;
		}

		const val = this.maxLength - this.value.length;
		return val >= 0 ? val : 0;
	}

	static override validators: ValidatorsDecl = {
		...iInputText.validators,
		...TextValidators
	};

	@system()
	protected override valueStore!: this['Value'];

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
					o.waitStatus('ready', {label: $$.textStoreSync}).then(() => o.text = str).catch(stderr);

				} else if (o.hook === 'updated') {
					o.text = str;
				}

				return str;
			}
		})
	})

	protected override textStore!: string;

	/**
	 * The minimum textarea height
	 */
	@system()
	protected minHeight: number = 0;

	protected override readonly $refs!: iInputText['$refs'] & {
		input: HTMLTextAreaElement;
	};

	/**
	 * Sum of the textarea `border-top-width` and `border-bottom-width`
	 */
	protected get borderHeight(): CanPromise<number> {
		return this.waitStatus('ready', () => {
			const s = getComputedStyle(this.$refs.input);
			return this.parse(s.borderBottomWidth) + this.parse(s.borderTopWidth);
		});
	}

	/**
	 * Sum of the textarea `padding-top` and `padding-bottom`
	 */
	protected get paddingHeight(): CanPromise<number> {
		return this.waitStatus('ready', () => {
			const s = getComputedStyle(this.$refs.input);
			return this.parse(s.paddingTop) + this.parse(s.paddingBottom);
		});
	}

	override clear(): Promise<boolean> {
		const v = this.value;
		void this.clearText();

		if (v !== '') {
			this.async.clearAll({group: 'validation'});
			void this.removeMod('valid');
			this.emit('clear', this.value);
			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
	}

	/**
	 * Updates the textarea height to show its content without showing a scrollbar.
	 * The method returns a new height value.
	 */
	@wait('ready', {defer: true, label: $$.calcHeight})
	fitHeight(): Promise<CanUndef<number>> {
		const {
			$refs: {input},
			value: {length}
		} = this;

		if (input.scrollHeight <= input.clientHeight) {
			if (input.clientHeight > this.minHeight && (this.prevValue ?? '').length > length) {
				return Promise.resolve(this.minimizeHeight());
			}

			return Promise.resolve(undefined);
		}

		const
			height = <number>this.height,
			maxHeight = <number>this.maxHeight,
			newlineHeight = <number>this.newlineHeight;

		const
			newHeight = height + (this.extRowCount - 1) * newlineHeight,
			fixedNewHeight = newHeight < maxHeight ? newHeight : maxHeight;

		input.style.height = fixedNewHeight.px;
		return Promise.resolve(fixedNewHeight);
	}

	/**
	 * Initializes the textarea height
	 */
	@hook('mounted')
	protected async initHeight(): Promise<void> {
		await this.nextTick();
		await this.dom.putInStream(async () => {
			this.minHeight = this.$refs.input.clientHeight;
			await this.fitHeight();
		});
	}

	/**
	 * Minimizes the textarea height.
	 * The method returns a new height value.
	 */
	@wait('ready', {defer: true, label: $$.minimize})
	protected minimizeHeight(): Promise<number> {
		const {
			minHeight,
			$refs: {input}
		} = this;

		const
			maxHeight = <number>this.maxHeight;

		let
			newHeight = <number>this.getTextHeight();

		if (newHeight < minHeight) {
			newHeight = minHeight;

		} else if (newHeight > maxHeight) {
			newHeight = maxHeight;
		}

		input.style.height = this.value !== '' ? newHeight.px : '';
		return SyncPromise.resolve(newHeight);
	}

	/**
	 * Returns height of textarea' text content
	 */
	@wait('ready', {label: $$.getTextHeight})
	protected getTextHeight(): CanPromise<number> {
		const
			{input} = this.$refs;

		if (this.$el == null || this.block == null) {
			return 0;
		}

		const
			tmp = <HTMLElement>this.$el.cloneNode(true),
			tmpInput = <HTMLTextAreaElement>tmp.querySelector(this.block.getElSelector('input'));

		tmpInput.value = input.value;

		Object.assign(tmpInput.style, {
			width: input.clientWidth.px,
			height: 'auto'
		});

		Object.assign(tmp.style, {
			position: 'absolute',
			top: 0,
			left: 0,
			'z-index': -1
		});

		document.body.appendChild(tmp);

		const
			height = tmpInput.scrollHeight + <number>this.borderHeight;

		tmp.remove();
		return height;
	}

	/**
	 * Parses the specified value as a number and returns it or `0`
	 * (if the parsing is failed)
	 *
	 * @param value
	 */
	protected parse(value: string): number {
		const v = parseFloat(value);
		return isNaN(v) ? 0 : v;
	}

	/**
	 * Synchronization for the `text` field
	 */
	@watch({path: 'valueStore', immediate: true})
	protected async syncValueStoreWatcher(): Promise<void> {
		await this.fitHeight();
	}

	/**
	 * Synchronization of the `limit` slot
	 */
	@watch('value')
	protected syncLimitSlotWatcher(): void {
		if (this.isNotRegular) {
			return;
		}

		if (this.vdom.getSlot('limit') != null) {
			void this.forceUpdate();
		}
	}

	/**
	 * Handler: updating of a limit warning
	 * @param el
	 */
	protected onLimitUpdate(el: Element): void {
		const {
			block,
			compiledMask,
			messageHelpers,

			limit,
			maxLength
		} = this;

		if (
			block == null ||
			compiledMask != null ||
			messageHelpers !== true ||

			limit == null ||
			maxLength == null
		) {
			return;
		}

		if (limit > maxLength / 1.5) {
			block.setElMod(el, 'limit', 'hidden', true);

		} else {
			block.setElMod(el, 'limit', 'hidden', false);
			block.setElMod(el, 'limit', 'warning', limit < maxLength / 3);
			el.innerHTML = t`Characters left: ${limit}`;
		}
	}

	/**
	 * Handler: updating of a component text value
	 */
	@watch({path: 'textStore', immediate: true})
	@hook('beforeDataCreate')
	protected onTextUpdate(): void {
		this.field.set('valueStore', this.text);
	}

	/**
	 * Handler: manual editing of a component text value
	 * @emits `actionChange(value: this['Value'])`
	 */
	protected onEdit(): void {
		if (this.compiledMask != null) {
			return;
		}

		this.value = this.$refs.input.value;
		this.field.set('textStore', this.value);
		this.emit('actionChange', this.value);
	}

	protected override onMaskInput(): Promise<boolean> {
		return super.onMaskInput().then((res) => {
			if (res) {
				this.emit('actionChange', this.value);
			}

			return res;
		});
	}

	protected override onMaskKeyPress(e: KeyboardEvent): boolean {
		if (super.onMaskKeyPress(e)) {
			this.emit('actionChange', this.value);
			return true;
		}

		return false;
	}

	protected override onMaskDelete(e: KeyboardEvent): boolean {
		if (super.onMaskDelete(e)) {
			this.emit('actionChange', this.value);
			return true;
		}

		return false;
	}
}
