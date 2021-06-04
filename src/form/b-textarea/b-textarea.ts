/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import iInputText, {

	component,
	prop,
	system,
	computed,

	hook,
	wait,
	watch,

	ModsDecl

} from 'super/i-input-text/i-input-text';

import type { Value, FormValue } from 'form/b-textarea/interface';

export * from 'super/i-input-text/i-input-text';
export * from 'form/b-textarea/interface';

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
	 * How many rows need to add to extend the textarea height when it can't fit the whole content without
	 * showing a scrollbar. The value of one row is equal to `line-height` of the textarea or `16`.
	 */
	@prop(Number)
	readonly extRowCount: number = 1;

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

	/**
	 * Textarea height
	 */
	get height(): CanPromise<number> {
		return this.waitStatus('ready', () => {
			const
				{input} = this.$refs;

			const s = getComputedStyle(input);
			return input.scrollHeight - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom);
		});
	}

	/**
	 * The maximum textarea height
	 */
	get maxHeight(): CanPromise<number> {
		return this.waitStatus('ready', () => {
			const s = getComputedStyle(this.$refs.wrapper);
			return parseFloat(s.maxHeight) - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom);
		});
	}

	/**
	 * Height of a newline.
	 * It depends on `line-height` of the textarea.
	 */
	get newlineHeight(): CanPromise<number> {
		return this.waitStatus('ready', () => {
			const lineHeight = parseFloat(getComputedStyle(this.$refs.input).lineHeight);
			return isNaN(lineHeight) ? 16 : lineHeight;
		});
	}

	/**
	 * Number of remaining letters that the component can contain
	 */
	@computed({dependencies: ['value']})
	get limit(): CanUndef<number> {
		if (this.maxLength === undefined) {
			return undefined;
		}

		const val = this.maxLength - this.value.length;
		return val >= 0 ? val : 0;
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		collapsed: [
			'true',
			'false'
		]
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

	/**
	 * The minimum textarea height
	 */
	@system()
	protected minHeight: number = 0;

	/** @override */
	protected readonly $refs!: iInputText['$refs'] & {
		wrapper: HTMLElement;
		input: HTMLTextAreaElement;
	};

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
	 * Updates the textarea height to show its content without showing a scrollbar.
	 * The method returns a new height value.
	 */
	@wait('ready', {defer: true, label: $$.calcHeight})
	async fitHeight(): Promise<CanUndef<number>> {
		const {
			$refs: {input},
			value: {length}
		} = this;

		if (input.scrollHeight <= input.clientHeight) {
			if (input.clientHeight > this.minHeight && (this.prevValue ?? '').length > length) {
				return this.minimizeHeight();
			}

			return;
		}

		const [height, maxHeight, newlineHeight] = await Promise.all([
			this.height,
			this.maxHeight,
			this.newlineHeight
		]);

		const
			newHeight = height + (this.extRowCount - 1) * newlineHeight,
			fixedNewHeight = newHeight < maxHeight ? newHeight : maxHeight;

		input.style.height = fixedNewHeight.px;
		return fixedNewHeight;
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
	protected async minimizeHeight(): Promise<number> {
		const
			{input} = this.$refs;

		const [minHeight, maxHeight] = await Promise.all([
			this.minHeight,
			this.maxHeight
		]);

		let
			newHeight = await this.getTextHeight();

		if (newHeight < minHeight) {
			newHeight = minHeight;

		} else if (newHeight > maxHeight) {
			newHeight = maxHeight;
		}

		input.style.height = this.value !== '' ? newHeight.px : '';
		return newHeight;
	}

	/**
	 * Returns height of textarea' text content
	 */
	@wait('ready')
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

		const height = tmpInput.scrollHeight;
		tmp.remove();

		return height;
	}

	/**
	 * Synchronization for the `text` field
	 */
	@watch('value')
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

		if (this.$scopedSlots.limit != null || this.$slots.limit != null) {
			this.forceUpdate().catch(stderr);
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
			block.setElMod(el, 'limit', 'warning', limit < maxLength / 4);
			el.innerHTML = t`Characters left: ${limit}`;
		}
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
