/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:max-file-line-count

import $C = require('collection.js');
import symbolGenerator from 'core/symbol';
import keyCodes from 'core/key-codes';
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
	ComponentConverter,
	Value

} from 'form/b-input/b-input';

export * from 'form/b-input/b-input';
export type FormValue = CanUndef<string>;

export interface Option {
	label: string;
	inputLabel?: string;
	value?: unknown;
	selected?: boolean;
	marked?: boolean;
}

export interface NOption extends Option {
	value: string;
}

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
	D extends Dictionary = Dictionary
// @ts-ignore
> extends bInput<V, FV, D> {
	/** @override */
	@prop({default: (obj) => $C(obj).get('data') || obj || []})
	readonly componentConverter?: ComponentConverter<Option[]>;

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
	 * If true, then .initLoad will be executed after .mods.opened === 'true'
	 */
	@prop(Boolean)
	readonly initAfterOpen: boolean = false;

	/**
	 * Selected value store
	 */
	@field<bSelect>((o) => o.link((val) => {
		val = o.initDefaultValue(val);
		return val !== undefined ? String(val) : undefined;
	}))

	selected?: FV;

	/**
	 * Select options
	 */
	get options(): NOption[] {
		return (<NOption[]>this.getField('optionsStore')).slice();
	}

	/**
	 * Sets new select options
	 * @param value
	 */
	set options(value: NOption[]) {
		this.setField('optionsStore', value);
	}

	/** @override */
	get default(): unknown {
		return this.defaultProp !== undefined ? String(this.defaultProp) : undefined;
	}

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

		init: (o) => o.link<Option[]>((val) => o.dataProvider ? o.optionsStore || [] : o.normalizeOptions(val))
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
	async initLoad(data?: unknown, silent?: boolean): Promise<void> {
		try {
			/// FIXME
			if (this.initAfterOpen && !this.b.is.mobile) {
				await this.async.wait(() => this.mods.opened !== 'false' || this.mods.focused === 'true');
			}

			return super.initLoad(data, silent);
		} catch {}
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

	/** @override */
	@mod('focused', true)
	@wait('ready')
	async open(): Promise<boolean> {
		const
			{select} = this.$refs;

		if (this.b.is.mobile) {
			select && select.focus();
			this.emit('open');
			return true;
		}

		if (await this.setMod('opened', true)) {
			if (!this.options.length) {
				return true;
			}

			if (this.ifOnce('opened') < 2) {
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

	/** @override */
	@wait('ready')
	async focus(): Promise<boolean> {
		if (this.b.is.mobile) {
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
		if (this.b.is.mobile) {
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
		return $C(options).to([]).map((el) => {
			el.label = String(el.label);
			el.value = el.value !== undefined ? String(el.value) : el.label;
			return el;
		});
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

		$C(data.optionsStore).forEach((el) => {
			const
				val = el.value;

			if (el.selected && !this.selected && !this.value) {
				if (this.mods.focused !== 'true') {
					this.syncLinks('valueProp', this.getOptionLabel(el));
				}

				data.selected = val;
			}

			values[val] = el;
			labels[el.label] = el;
		});

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
			{mobile} = this.b.is;

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

	/** @override */
	protected initCloseHelpers(): void {
		const
			{async: $a, localEvent: $e} = this;

		$e.on('block.mod.set.opened.true', () => {
			$a.off({group: 'navigation'});

			if (openedSelect) {
				openedSelect.close().catch(() => undefined);
			}

			openedSelect = this;

			const
				{selected} = this;

			const reset = async () => {
				if (selected) {
					await this.onOptionSelected(selected);
				}

				await this.close();
			};

			$a.on(document, 'click', (e) => {
				if (!e.target.closest(`.${this.componentId}`)) {
					return reset();
				}
			}, {
				group: 'global'
			});

			$a.on(document, 'keyup', (e) => {
				if (e.keyCode === keyCodes.ESC) {
					e.preventDefault();
					return reset();
				}
			}, {
				group: 'global'
			});

			$a.on(document, 'keydown', async (e) => {
				if (!{[keyCodes.UP]: true, [keyCodes.DOWN]: true, [keyCodes.ENTER]: true}[e.keyCode]) {
					return;
				}

				e.preventDefault();

				const
					{block: $b} = this,
					selected = getSelected();

				function getSelected(): CanUndef<HTMLElement> {
					return $b.element('option', {selected: true});
				}

				switch (e.keyCode) {
					case keyCodes.ENTER:
						if (selected) {
							await this.onOptionSelected();
						}

						break;

					case keyCodes.UP:
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

					case keyCodes.DOWN: {
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
		});

		$e.on('block.mod.set.opened.false', () => {
			if (openedSelect === this) {
				openedSelect = null;
			}

			$a.off({group: 'global'});
			if (this.mods.focused !== 'true') {
				$a.off({group: 'navigation'});
			}
		});

		$e.on('block.mod.set.focused.false', () => {
			if (this.mods.opened !== 'true') {
				$a.off({group: 'navigation'});
			}
		});
	}

	/** @override */
	protected async onEdit(e: Event): Promise<void> {
		this.valueBufferStore =
			(<HTMLInputElement>e.target).value || '';

		this.async.setTimeout(() => {
			const
				rgxp = new RegExp(`^${RegExp.escape(this.value)}`, 'i');

			if (
				$C(this.labels).some((el, key) => {
					if (rgxp.test(key)) {
						this.selected = <FV>(<NonNullable<Option>>el).value;
						return true;
					}
				})

			) {
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

	/* eslint-enable no-unused-vars */

	/**
	 * Handler: option select
	 *
	 * @param [value]
	 * @emits actionChange(selected: FV)
	 */
	@watch({
		field: '?$el:click',
		wrapper: (o, cb) => o.delegateElement('option', (e) => cb(e.delegateTarget.dataset.value))
	})

	protected async onOptionSelected(value?: string): Promise<void> {
		const
			v = this.values && this.values[String(this.selected)];

		if (value !== this.selected || v && this.value !== this.getOptionLabel(v)) {
			this.syncValue(value);
			this.emit('actionChange', this.selected);
		}

		await this.close();
	}

	/** @override */
	protected created(): void {
		super.created();

		if (!this.b.is.mobile) {
			this.on('asyncRender', async () => {
				try {
					await (await this.waitRef<bScrollInline>('scroll')).initScroll();
				} catch {}
			});

			this.initCloseHelpers();
		}
	}
}
