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
import KeyCodes from 'core/keyCodes';
import bScrollInline from 'base/b-scroll/b-scroll-inline/b-scroll-inline';
import bInput, { component, prop, field, system, watch, mod, wait } from 'form/b-input/b-input';
export * from 'form/b-input/b-input';

export const
	$$ = symbolGenerator();

export interface Option {
	label: string;
	inputLabel?: string;
	value?: any;
	selected?: boolean;
	marked?: boolean;
}

let
	openedSelect;

@component({
	model: {
		prop: 'selectedProp',
		event: 'onChange'
	}
})

export default class bSelect<T extends Dictionary = Dictionary> extends bInput<T> {
	/** @override */
	@prop({default: (obj) => $C(obj).get('data') || obj || []})
	readonly blockConverter?: Function;

	/**
	 * Initial select options
	 */
	@prop(Array)
	readonly optionsProp: Option[] = [];

	/**
	 * Initial selected value
	 */
	@prop({required: false})
	readonly selectedProp?: any;

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
	 * Select options
	 */
	get options(): Option[] {
		return $C(this.optionsStore).map((el) => {
			if (el.value !== undefined) {
				el.value = String(el.value);
			}

			el.label = String(el.label);
			return el;
		});
	}

	/**
	 * Sets new select options
	 * @param value
	 */
	set options(value: Option[]) {
		this.optionsStore = value;
	}

	/**
	 * Selected value
	 */
	get selected(): string | undefined {
		const val = this.selectedStore;
		return val !== undefined ? String(val) : val;
	}

	/**
	 * Sets a new selected value
	 * @param value
	 */
	set selected(value: string | undefined) {
		this.selectedStore = value;
	}

	/** @override */
	@field()
	protected readonly blockValueField: string = 'selected';

	/**
	 * Select options store
	 */
	@field((o) => o.link('optionsProp', (val) => {
		const
			ctx: bSelect = <any>o;

		if (ctx.dataProvider || Object.fastCompare(val, ctx.optionsStore)) {
			return ctx.optionsStore || [];
		}

		return val;
	}))

	protected optionsStore!: Option[];

	/**
	 * Selected value store
	 */
	@field((o) => o.link('selectedProp', (val) => {
		const
			ctx: bSelect = <any>o;

		if (val === undefined) {
			o.localEvent.once('component.created', () => ctx.selectedStore = ctx.default);
			return;
		}

		return val;
	}))

	protected selectedStore?: any;

	/**
	 * Temporary labels table
	 */
	@system()
	protected labels?: Dictionary<Option>;

	/**
	 * Temporary values table
	 */
	@system()
	protected values?: Dictionary<Option>;

	/** @override */
	protected readonly $refs!: {
		input: HTMLInputElement;
		scroll?: bScrollInline;
		select?: HTMLSelectElement;
	};

	/** @override */
	async initLoad(): Promise<void> {
		try {
			/// FIXME
			if (this.initAfterOpen && !this.b.is.mobile) {
				await this.async.wait(() => this.mods.opened !== 'false' || this.mods.focused === 'true');
			}

			return super.initLoad();
		} catch (_) {}
	}

	/** @override */
	async clear(): Promise<boolean> {
		await this.close();

		if (this.value || this.selected) {
			this.value = undefined;
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

			const
				selected = this.block.element<HTMLElement>('option', {selected: true});

			if (this.ifOnce('opened') < 2) {
				await Promise.all([this.nextTick(), this.waitRef('scroll')]);
			}

			if (this.mods.opened === 'true') {
				const
					{scroll} = this.$refs;

				if (scroll) {
					scroll.scrollOffset = <any>{top: selected ? selected.offsetTop : 0};
					await scroll.calcScroll();
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
				this.emit('focus');
				return true;
			}

			return false;
		}

		return super.focus();
	}

	/** @override */
	protected initRemoteData(): any {
		if (!this.db) {
			return;
		}

		const
			val = this.blockConverter ? this.blockConverter(this.db) : this.db;

		if (Object.isArray(val)) {
			return this.options = <Option[]>val;
		}

		return this.options;
	}

	/**
	 * Synchronization for the optionsStore field
	 * @param value
	 */
	@watch({field: 'optionsStore', immediate: true})
	protected async syncOptionsStoreWatcher(value: Option[]): Promise<void> {
		const labels = $C(value).to({}).reduce((map, el) => {
			el.value = this.getOptionValue(el);
			el.label = this.t(el.label);
			map[el.label] = el;
			return map;
		});

		const values = $C(value).to({}).reduce((map, el) => {
			el.value = this.getOptionValue(el);
			map[el.value] = el;
			return map;
		});

		Object.assign(this, {labels, values});

		if (this.selected) {
			const
				selected = (<Dictionary>this.values)[this.selected];

			if (selected) {
				this.value = this.getOptionLabel(selected);
			}
		}

		if (value.length && this.$refs.scroll) {
			await this.$refs.scroll.initScroll();
		}
	}

	/**
	 * Synchronization for the selectedStore field
	 * @param value
	 */
	@watch({field: 'selectedStore', immediate: true})
	protected async syncSelectedStoreWatcher(value: any): Promise<void> {
		if (value === undefined) {
			this.value = undefined;
			return;
		}

		value = this.values && this.values[value];
		if (!value) {
			return;
		}

		const
			{mobile} = this.b.is;

		if (this.mods.focused !== 'true' || mobile) {
			this.value = this.getOptionLabel(value);
		}

		if (mobile) {
			return;
		}

		try {
			await Promise.all([
				this.nextTick({label: $$.$$selectedStore}),
				this.waitRef('scroll', {label: $$.$$selectedStoreWait})
			]);

			const
				selected = this.block.element<HTMLElement>('option', {selected: true}),
				{scroll} = this.$refs;

			if (selected && scroll) {
				const
					selTop = selected.offsetTop,
					selHeight = selected.offsetHeight,
					selOffset = selTop + selHeight;

				const
					scrollHeight = await scroll.height,
					scrollTop = (await scroll.scrollOffset).top;

				if (selOffset > scrollHeight) {
					if (selOffset > scrollTop + scrollHeight) {
						scroll.scrollOffset = <any>{top: selTop - scrollHeight + selHeight};

					} else if (selOffset < scrollTop + selected.offsetHeight) {
						scroll.scrollOffset = <any>{top: selTop};
					}

				} else if (selOffset < scrollTop) {
					scroll.scrollOffset = <any>{top: selTop};
				}
			}

		} catch (_) {}
	}

	/**
	 * Returns a value of the specified option
	 * @param option
	 */
	protected getOptionValue(option: Option): string {
		return String(option.value !== undefined ? option.value : option.label);
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
			this.selected = selected;
		}

		if (!this.values || !this.selected) {
			return;
		}

		const
			label = this.values[this.selected];

		if (label) {
			this.value = this.getOptionLabel(label);
		}
	}

	/**
	 * Returns true if the specified option is selected
	 * @param option
	 */
	protected isSelected(option: Option): boolean {
		const
			val = this.getOptionValue(option);

		if (option.selected && !this.selected && !this.value) {
			if (this.mods.focused !== 'true') {
				this.value = this.getOptionLabel(option);
			}

			this.selected = val;
		}

		return this.selected || this.value ? val === String(this.selected) : Boolean(option.selected);
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
				if (!e.target.closest(`.${this.blockId}`)) {
					return reset();
				}
			}, {
				group: 'global'
			});

			$a.on(document, 'keyup', (e) => {
				if (e.keyCode === KeyCodes.ESC) {
					e.preventDefault();
					return reset();
				}
			}, {
				group: 'global'
			});

			$a.on(document, 'keydown', async (e) => {
				if (!{[KeyCodes.UP]: true, [KeyCodes.DOWN]: true, [KeyCodes.ENTER]: true}[e.keyCode]) {
					return;
				}

				e.preventDefault();

				const
					{block: $b} = this,
					selected = getSelected();

				function getSelected(): HTMLElement | null {
					return $b.element('option', {selected: true});
				}

				switch (e.keyCode) {
					case KeyCodes.ENTER:
						if (selected) {
							await this.onOptionSelected();
						}

						break;

					case KeyCodes.UP:
						if (this.selected) {
							if (selected) {
								if (selected.previousElementSibling) {
									this.selected = (<HTMLElement>selected.previousElementSibling).dataset.value;
									break;
								}

								await this.close();
							}
						}

						break;

					case KeyCodes.DOWN: {
						const select = async (el) => {
							if (this.mods.opened !== 'true') {
								await this.open();
								el = getSelected();
								if (this.selected) {
									return;
								}
							}

							if (el) {
								if (!this.selected) {
									this.selected = el.dataset.value;
									return;
								}

								if (el.nextElementSibling) {
									this.selected = el.nextElementSibling.dataset.value;
									return;
								}

								this.selected = (<HTMLElement>$b.element('option')).dataset.value;
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

		$e.once('block.status.ready', () => {
			$e.on('block.mod.set.opened.false', () => {
				if (openedSelect === this) {
					openedSelect = null;
				}

				$a.off({group: 'global'});
				if (this.mods.focused !== 'true') {
					$a.off({group: 'navigation'});
				}
			});

			$e.on('block.mod.set.focused.false', async () => {
				if (this.mods.opened !== 'true') {
					$a.off({group: 'navigation'});
				}
			});
		});
	}

	/** @override */
	protected async onEdit(e: Event): Promise<void> {
		this.async.setTimeout(() => {
			const
				rgxp = new RegExp(`^${RegExp.escape(this.value)}`, 'i');

			if (
				$C(this.labels).some((el, key) => {
					if (rgxp.test(key)) {
						this.selected = el.value;
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
	protected async onBlockValueChange(newValue: any, oldValue: any): Promise<void> {
		try {
			await this.async.wait(() => this.mods.opened !== 'true', {label: $$.onBlockValueChange});
			super.onBlockValueChange(newValue, oldValue);
		} catch (_) {}
	}

	/* eslint-enable no-unused-vars */

	/**
	 * Handler: option select
	 *
	 * @param [value]
	 * @emits actionChange(selected: ?string)
	 */
	protected async onOptionSelected(value?: string): Promise<void> {
		if (this.values && this.selected) {
			const
				v = this.values[this.selected];

			if (value !== this.selected || v && this.value !== this.getOptionLabel(v)) {
				this.syncValue(value);
				this.emit('actionChange', this.selected);
			}
		}

		await this.close();
	}

	/** @override */
	protected created(): void {
		super.created();

		if (!this.b.is.mobile) {
			this.$watch('asyncCounter', async () => {
				try {
					await this.waitRef('scroll');
					await (<bScrollInline>this.$refs.scroll).initScroll();
				} catch (_) {}
			});

			this.initCloseHelpers();
		}

		if (this.labels && this.selected === undefined && this.value) {
			const
				option = this.labels[this.value];

			if (option) {
				this.selected = option.value;
			}

		} else if (this.values && this.selected !== undefined && !this.value) {
			const val = this.values[this.selected];
			this.value = val ? this.getOptionLabel(val) : '';
		}
	}

	/** @override */
	protected async mounted(): Promise<void> {
		await super.mounted();

		const fn = await this.delegateElement('option', async (e) => {
			await this.onOptionSelected(e.delegateTarget.dataset.value);
		});

		this.async.on(this.$el, 'click', fn, {
			label: $$.activation
		});
	}
}
