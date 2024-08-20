/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/form/b-textarea/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import SyncPromise from 'core/promise/sync';

import DOM, { renderTemporarily } from 'components/friends/dom';
import Block, { getElementSelector, setElementMod } from 'components/friends/block';

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

} from 'components/super/i-input-text/i-input-text';

import type { Value, FormValue } from 'components/form/b-textarea/interface';

export * from 'components/super/i-input-text/i-input-text';
export * from 'components/form/b-textarea/interface';

export { Value, FormValue };

DOM.addToPrototype({renderTemporarily});
Block.addToPrototype({getElementSelector, setElementMod});

const
	$$ = symbolGenerator();

@component({
	functional: {
		wait: undefined,
		dataProvider: undefined
	}
})

export default class bTextarea extends iInputText {
	/** @inheritDoc */
	declare readonly Value: Value;

	/** @inheritDoc */
	declare readonly FormValue: FormValue;

	@prop({type: String, required: false})
	// @ts-ignore (override)
	override readonly valueProp?: this['Value'];

	@prop({type: String, required: false})
	// @ts-ignore (override)
	override readonly defaultProp?: this['Value'];

	/**
	 * How many rows to add to expand the textarea height when it can't fit the entire content without
	 * showing a scrollbar. The value of one row is equal to the `line-height` of the textarea, or `font-size`.
	 */
	@prop(Number)
	readonly rowsToExpand: number = 1;

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
	 * The textarea height
	 */
	get height(): CanPromise<number> {
		return this.waitComponentStatus('ready', () => {
			const {input} = this.$refs;
			return input.scrollHeight + <number>this.borderHeight - <number>this.paddingHeight;
		});
	}

	/**
	 * The maximum textarea height
	 */
	get maxHeight(): CanPromise<number> {
		return this.waitComponentStatus('ready', () => {
			const s = getComputedStyle(this.$refs.input);
			return this.parse(s.maxHeight) + <number>this.borderHeight - <number>this.paddingHeight;
		});
	}

	/**
	 * The height of the new line.
	 * It depends on `line-height/font-size` of the textarea.
	 */
	get newlineHeight(): CanPromise<number> {
		return this.waitComponentStatus('ready', () => {
			const
				s = getComputedStyle(this.$refs.input),
				lineHeight = parseFloat(s.lineHeight);

			return isNaN(lineHeight) ? parseFloat(s.fontSize) : lineHeight;
		});
	}

	/**
	 * The number of remaining characters the component can contain
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
	// @ts-ignore (override)
	protected override valueStore!: this['Value'];

	@system<bTextarea>({
		after: 'valueStore',
		init: (o) => o.sync.link((text) => {
			o.watch('valueProp', {label: $$.textStoreValueProp}, watcher);
			o.watch('modelValue', {label: $$.textStoreModelValue}, watcher);

			return link(Object.cast(o.modelValue ?? o.valueProp));

			function link(textFromValue: CanUndef<string>): string {
				const
					resolvedText = textFromValue === undefined ? text ?? o.field.get('valueStore') : textFromValue,
					str = resolvedText !== undefined ? String(resolvedText) : '';

				if (o.isFunctional) {
					o.waitComponentStatus('ready', {label: $$.textStoreSync}).then(() => o.text = str).catch(stderr);

				} else if (o.hook === 'updated') {
					o.text = str;
				}

				return str;
			}

			function watcher() {
				const label = {
					label: $$.textStoreToValueStore
				};

				o.watch('valueStore', label, (v) => {
					o.async.clearAll(label);
					return link(v);
				});
			}
		})
	})

	// @ts-ignore (override)
	protected override textStore!: string;

	/**
	 * The minimum textarea height
	 */
	@system()
	protected minHeight: number = 0;

	/** @inheritDoc */
	declare protected readonly $refs: iInputText['$refs'] & {
		input: HTMLTextAreaElement;
	};

	/**
	 * Sum of the textarea `border-top-width` and `border-bottom-width`
	 */
	protected get borderHeight(): CanPromise<number> {
		return this.waitComponentStatus('ready', () => {
			const s = getComputedStyle(this.$refs.input);
			return this.parse(s.borderBottomWidth) + this.parse(s.borderTopWidth);
		});
	}

	/**
	 * Sum of the textarea `padding-top` and `padding-bottom`
	 */
	protected get paddingHeight(): CanPromise<number> {
		return this.waitComponentStatus('ready', () => {
			const s = getComputedStyle(this.$refs.input);
			return this.parse(s.paddingTop) + this.parse(s.paddingBottom);
		});
	}

	@wait('ready', {label: $$.clear})
	override clear(): Promise<boolean> {
		const {value} = this;
		void this.clearText();

		if (value !== '') {
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
			newHeight = height + (this.rowsToExpand - 1) * newlineHeight,
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
		await this.dom.renderTemporarily(async () => {
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
	 * Returns the height of the textarea text content
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
			tmpInput = <HTMLTextAreaElement>tmp.querySelector(this.block.getElementSelector('input'));

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
	 * Parses the specified value as a number and returns it or `0` (if parsing fails)
	 * @param value
	 */
	protected parse(value: string): number {
		const v = parseFloat(value);
		return isNaN(v) ? 0 : v;
	}

	/**
	 * Synchronization for the `text` field
	 */
	@watch({
		path: 'valueStore',
		immediate: true,
		flush: 'sync'
	})

	protected async syncValueStoreWatcher(): Promise<void> {
		await this.fitHeight();
	}

	/**
	 * Synchronization of the `limit` slot
	 */
	@watch('value')
	protected syncLimitSlotWatcher(): void {
		if (this.isFunctional) {
			return;
		}

		if (this.$slots['limit'] != null) {
			void this.forceUpdate();
		}
	}

	protected override initValueListeners(): void {
		super.initValueListeners();

		this.localEmitter.on('maskedText.change', () => {
			this.emit('actionChange', this.value);
		});
	}

	/**
	 * Handler: updating of the limit warning
	 * @param el
	 */
	protected onLimitUpdate(el: Element): void {
		const {
			maskAPI,

			block,
			messageHelpers,

			limit,
			maxLength
		} = this;

		const canIgnore =
			block == null ||
			!messageHelpers ||

			limit == null ||
			maxLength == null ||

			maskAPI.compiledMask != null;

		if (canIgnore) {
			return;
		}

		if (limit > maxLength / 1.5) {
			block.setElementMod(el, 'limit', 'hidden', true);

		} else {
			block.setElementMod(el, 'limit', 'hidden', false);
			block.setElementMod(el, 'limit', 'warning', limit < maxLength / 3);
			el.innerHTML = this.t('Characters left: {limit}', {limit});
		}
	}

	/**
	 * Handler: the component text value has updated
	 */
	@watch({
		path: 'textStore',
		immediate: true,
		flush: 'sync'
	})

	@hook('beforeDataCreate')
	protected onTextUpdate(): void {
		this.field.set('valueStore', this.text);
	}

	/**
	 * Handler: manual editing of the component text value
	 * @emits `actionChange(value: this['Value'])`
	 */
	protected onEdit(): void {
		if (this.maskAPI.compiledMask != null) {
			return;
		}

		this.value = this.$refs.input.value;
		this.field.set('textStore', this.value);
		this.emit('actionChange', this.value);
	}
}
