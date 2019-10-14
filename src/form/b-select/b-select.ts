/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import iOpenToggle, { CloseHelperEvents } from 'traits/i-open-toggle/i-open-toggle';
import bScrollInline from 'base/b-scroll/b-scroll-inline/b-scroll-inline';

import bInput, {

	component,
	prop,
	field,
	system,
	hook,
	watch,
	mod,
	wait,

	Value,
	ModEvent,
	SetModEvent,
	ModsDecl,
	InitLoadParams

} from 'form/b-input/b-input';

import { FormValue, Option, NOption } from 'form/b-select/modules/interface';

export * from 'form/b-input/b-input';
export * from 'traits/i-open-toggle/i-open-toggle';
export * from 'form/b-select/modules/interface';

export { FormValue };

export const
	$$ = symbolGenerator();

let
	openedSelect;

@component({
	model: {
		prop: 'selectedProp',
		event: 'onChange'
	}
})

export default class bSelect<
	V extends Value = Value,
	FV extends FormValue = FormValue,
	D extends object = Dictionary
// @ts-ignore
> extends bInput<V, FV, D> implements iOpenToggle {
	/**
	 * Initial select options
	 */
	@prop(Array)
	readonly optionsProp: Option[] = [];

	/**
	 * Initial selected value
	 */
	@prop({required: false})
	readonly selectedProp?: unknown;

	/**
	 * Option component
	 */
	@prop({type: String, required: false})
	readonly option?: string;

	/**
	 * Exterior of bScroll component
	 */
	@prop({type: String, required: false})
	readonly scrollExterior?: string;

	/**
	 * If true, then .initLoad will be executed after .mods.opened === 'true'
	 */
	@prop(Boolean)
	readonly initAfterOpen: boolean = false;

	/**
	 * Selected value store
	 */
	@field<bSelect>((o) => o.sync.link((val) => {
		val = o.initDefaultValue(val);
		return val !== undefined ? String(val) : undefined;
	}))

	selected?: FV;

	/**
	 * Select options
	 */
	get options(): NOption[] {
		return (<NOption[]>this.field.get('optionsStore')).slice();
	}

	/**
	 * Sets new select options
	 * @param value
	 */
	set options(value: NOption[]) {
		this.field.set('optionsStore', value);
	}

	/** @override */
	get default(): unknown {
		return this.defaultProp !== undefined ? String(this.defaultProp) : undefined;
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		opened: [
			...iOpenToggle.mods.opened,
			['false']
		]
	};

	/** @override */
	@field()
	protected readonly blockValueField: string = 'selected';

	/**
	 * Select options store
	 */
	@field<bSelect>({
		watch: (o) => {
			o.initComponentValues().catch(stderr);
		},

		init: (o) => o.sync.link<Option[]>((val) => o.dataProvider ? o.optionsStore || [] : o.normalizeOptions(val))
	})

	protected optionsStore!: NOption[];

	/**
	 * Temporary labels table
	 */
	@system()
	protected labels!: Dictionary<Option>;

	/**
	 * Temporary values table
	 */
	@system()
	protected values!: Dictionary<Option>;

	/** @override */
	protected readonly $refs!: bInput['$refs'] & {
		scroll?: bScrollInline;
		select?: HTMLSelectElement;
	};

	/** @override */
	initLoad(data?: unknown, params?: InitLoadParams): CanPromise<void> {
		/// FIXME
		if (this.initAfterOpen && !this.browser.is.mobile) {
			const
				{mods} = this;

			return this.async
				.wait(() => mods.opened !== 'false' || mods.focused === 'true')
				.then(() => super.initLoad(data, params));
		}

		return super.initLoad(data, params);
	}

	/** @override */
	async clear(): Promise<boolean> {
		await this.close();

		if (this.value || this.selected) {
			this.value = <V>'';
			await super.clear();
			return true;
		}

		return false;
	}

	/** @see iOpenToggle.open */
	@mod('focused', true)
	@wait('ready')
	async open(): Promise<boolean> {
		const
			{select} = this.$refs;

		if (this.browser.is.mobile) {
			select && select.focus();
			this.emit('open');
			return true;
		}

		if (await this.setMod('opened', true)) {
			if (!this.options.length) {
				return true;
			}

			if (this.opt.ifOnce('opened') < 2) {
				// @ts-ignore
				await Promise.all([this.nextTick(), this.waitRef('scroll')]);
			}

			const
				selected = this.block.element<HTMLElement>('option', {selected: true});

			if (this.mods.opened === 'true') {
				const
					{scroll} = this.$refs;

				if (scroll) {
					await scroll.calcScroll();
					await scroll.setScrollOffset({top: selected ? selected.offsetTop : 0});
				}

				this.emit('open');
				return true;
			}

			return false;
		}

		return false;
	}

	/** @see iOpenToggle.close */
	async close(): Promise<boolean> {
		if (await iOpenToggle.close(this)) {
			if (this.selected) {
				await this.onOptionSelected(this.selected);
			}

			return true;
		}

		return false;
	}

	/** @see iOpenToggle.toggle */
	toggle(): Promise<boolean> {
		return iOpenToggle.toggle(this);
	}

	/** @override */
	@wait('ready')
	async focus(): Promise<boolean> {
		if (this.browser.is.mobile) {
			const
				{select} = this.$refs;

			if (select && document.activeElement !== select) {
				select.focus();
				return true;
			}

			return false;
		}

		return super.focus();
	}

	/** @override */
	@wait('ready')
	async blur(): Promise<boolean> {
		if (this.browser.is.mobile) {
			const
				{select} = this.$refs;

			if (select && document.activeElement === select) {
				select.blur();
				return true;
			}

			return false;
		}

		return super.blur();
	}

	/** @see iOpenToggle.onOpenedChange */
	onOpenedChange(e: ModEvent | SetModEvent): void {
		const
			{async: $a} = this;

		// opened == false or opened == null
		if (e.type === 'set' && e.value === 'false' || e.type === 'remove') {
			if (openedSelect === this) {
				openedSelect = null;
			}

			if (this.mods.focused !== 'true') {
				$a.off({
					group: 'navigation'
				});
			}

			return;
		}

		$a.off({
			group: 'navigation'
		});

		if (openedSelect) {
			openedSelect.close().catch(() => undefined);
		}

		openedSelect = this;

		$a.on(document, 'keydown', async (e) => {
			if (!{ArrowUp: true, ArrowDown: true, Enter: true}[e.key]) {
				return;
			}

			e.preventDefault();

			const
				{block: $b} = this,
				selected = getSelected();

			function getSelected(): CanUndef<HTMLElement> {
				return $b.element('option', {selected: true});
			}

			switch (e.key) {
				case 'Enter':
					if (selected) {
						await this.onOptionSelected();
					}

					break;

				case 'ArrowUp':
					if (this.selected) {
						if (selected) {
							if (selected.previousElementSibling) {
								this.selected = <FV>(<HTMLElement>selected.previousElementSibling).dataset.value;
								break;
							}

							await this.close();
						}
					}

					break;

				case 'ArrowDown': {
					const
						that = this;

					// Use "that" instead of "this" because of TS generates invalid code
					const select = async (el) => {
						if (that.mods.opened !== 'true') {
							await that.open();
							el = getSelected();
							if (that.selected) {
								return;
							}
						}

						if (el) {
							if (!that.selected) {
								that.selected = el.dataset.value;
								return;
							}

							if (el.nextElementSibling) {
								that.selected = el.nextElementSibling.dataset.value;
								return;
							}

							that.selected = <FV>(<HTMLElement>$b.element('option')).dataset.value;
						}
					};

					if (this.selected) {
						if (selected) {
							await select(selected);
							break;
						}
					}

					await select($b.element('option'));
				}
			}
		}, {
			group: 'navigation'
		});
	}

	/** @see iOpenToggle.onKeyClose */
	onKeyClose(e: KeyboardEvent): Promise<void> {
		return iOpenToggle.onKeyClose(this, e);
	}

	/** @see iOpenToggle.onTouchClose */
	onTouchClose(e: MouseEvent): Promise<void> {
		return iOpenToggle.onTouchClose(this, e);
	}

	/** @override */
	protected initRemoteData(): CanUndef<NOption[]> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent<Option[]>(this.db);

		if (Object.isArray(val)) {
			return this.options = this.normalizeOptions(val);
		}

		return this.options;
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		this.normalizeOptions = this.instance.normalizeOptions.bind(this);
	}

	/**
	 * Normalizes the specified options and returns it
	 * @param options
	 */
	protected normalizeOptions(options?: Option[]): NOption[] {
		const
			res = <NOption[]>[];

		if (options) {
			for (let i = 0; i < options.length; i++) {
				const
					el = options[i];

				res.push({
					label: String(el.label),
					value: el.value !== undefined ? String(el.value) : el.label
				});
			}
		}

		return res;
	}

	/**
	 * Initializes component values
	 */
	@hook('beforeDataCreate')
	protected async initComponentValues(): Promise<void> {
		const
			data = this.$$data,
			labels = {},
			values = {};

		for (let o = <NOption[]>data.optionsStore, i = 0; i < o.length; i++) {
			const
				el = o[i],
				val = el.value;

			if (el.selected && !this.selected && !this.value) {
				if (this.mods.focused !== 'true') {
					this.sync.syncLinks('valueProp', this.getOptionLabel(el));
				}

				data.selected = val;
			}

			values[val] = el;
			labels[el.label] = el;
		}

		this.labels = labels;
		this.values = values;

		const
			{valueStore: value, selected} = data;

		if (selected === undefined) {
			if (value) {
				const
					option = labels[String(value)];

				if (option) {
					data.selected = option.value;
				}
			}

		} else if (!value) {
			const val = values[String(selected)];
			data.valueStore = data.valueBufferStore = val ? this.getOptionLabel(val) : '';
		}

		const
			{scroll} = this.$refs;

		if (scroll) {
			await scroll.initScroll();
		}
	}

	/**
	 * Synchronization for the selected field
	 * @param selected
	 */
	@watch('selected')
	@wait('ready')
	protected async syncSelectedStoreWatcher(selected: FV): Promise<void> {
		const
			{block: $b} = this,
			prevSelected = $b.element('option', {selected: true});

		if (prevSelected) {
			$b.setElMod(prevSelected, 'option', 'selected', false);
		}

		if (selected === undefined) {
			this.value = <V>'';
			return;
		}

		const
			option = this.values[String(selected)];

		if (!option) {
			return;
		}

		const
			{mobile} = this.browser.is;

		if (this.mods.focused !== 'true' || mobile) {
			this.value = <V>this.getOptionLabel(option);
		}

		if (mobile) {
			return;
		}

		try {
			// @ts-ignore
			const [scroll] = await Promise.all([
				this.waitRef<bScrollInline>('scroll', {label: $$.$$selectedWait}),
				this.nextTick({label: $$.$$selected})
			]);

			const
				node = $b.element<HTMLElement>(`option[data-value="${option.value}"]`);

			if (node) {
				$b.setElMod(node, 'option', 'selected', true);

				const
					selTop = node.offsetTop,
					selHeight = node.offsetHeight,
					selOffset = selTop + selHeight;

				const
					scrollHeight = await scroll.height,
					scrollTop = (await scroll.scrollOffset).top;

				if (selOffset > scrollHeight) {
					if (selOffset > scrollTop + scrollHeight) {
						await scroll.setScrollOffset({top: selTop - scrollHeight + selHeight});

					} else if (selOffset < scrollTop + node.offsetHeight) {
						await scroll.setScrollOffset({top: selTop});
					}

				} else if (selOffset < scrollTop) {
					await scroll.setScrollOffset({top: selTop});
				}
			}

		} catch {}
	}

	/**
	 * Returns a label of the specified option
	 * @param option
	 */
	protected getOptionLabel(option: Option): string {
		return String(option.inputLabel != null ? option.inputLabel : option.label);
	}

	/**
	 * Synchronizes :selected and :value
	 * @param [selected]
	 */
	protected syncValue(selected?: string): void {
		if (selected) {
			this.selected = <FV>selected;
		}

		if (!this.selected) {
			return;
		}

		const
			label = this.values[String(this.selected)];

		if (label) {
			this.value = <V>this.getOptionLabel(label);
		}
	}

	/**
	 * Returns true if the specified option is selected
	 * @param option
	 */
	protected isSelected(option: NOption): boolean {
		return this.selected || this.value ? option.value === this.selected : Boolean(option.selected);
	}

	/** @see iOpenToggle.initCloseHelpers */
	@hook('beforeDataCreate')
	protected initCloseHelpers(events?: CloseHelperEvents): void {
		if (this.browser.is.mobile) {
			return;
		}

		iOpenToggle.initCloseHelpers(this, events);
	}

	/**
	 * Handler: option select
	 *
	 * @param [value]
	 * @emits actionChange(selected: FV)
	 */
	@watch({
		field: '?$el:click',
		wrapper: (o, cb) => o.dom.delegateElement('option', (e) => cb(e.delegateTarget.dataset.value))
	})

	protected async onOptionSelected(value?: string): Promise<void> {
		const
			v = this.values && this.values[String(this.selected)];

		if (value !== this.selected || v && this.value !== this.getOptionLabel(v)) {
			this.syncValue(value);
			this.emit('actionChange', this[this.blockValueField]);
		}

		await this.close();
	}

	/** @override */
	protected async onEdit(e: Event): Promise<void> {
		this.valueBufferStore =
			(<HTMLInputElement>e.target).value || '';

		this.async.setTimeout(() => {
			const
				rgxp = new RegExp(`^${RegExp.escape(this.value)}`, 'i');

			let
				some = false;

			for (let keys = Object.keys(this.labels), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = this.labels[key];

				if (el && rgxp.test(key)) {
					this.selected = <FV>el.value;
					some = true;
					break;
				}
			}

			if (some) {
				return this.open();
			}

			this.selected = undefined;
			return this.close();

		}, 0.2.second(), {
			label: $$.quickSearch
		});
	}

	/** @override */
	protected async onBlockValueChange(newValue: V, oldValue?: V): Promise<void> {
		try {
			await this.async.wait(() => this.mods.opened !== 'true', {label: $$.onBlockValueChange});
			super.onBlockValueChange(newValue, oldValue);
		} catch {}
	}

	/** @override */
	protected created(): void {
		if (!this.browser.is.mobile) {
			this.on('asyncRender', async () => {
				try {
					await (await this.waitRef<bScrollInline>('scroll')).initScroll();
				} catch {}
			});
		}
	}
}
