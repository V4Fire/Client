'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import bInput from 'form/b-input/b-input';
import keyCodes from 'core/keyCodes';
import { abstract, field, params, mod, wait } from 'super/i-block/i-block';
import { component } from 'core/component';

const
	$C = require('collection.js');

export const
	$$ = new Store();

@component()
export default class bSelect extends bInput {
	/** @override */
	model: ?Object = {
		prop: 'selectedProp',
		event: 'onChange'
	};

	/** @override */
	@params({default: (obj) => $C(obj).get('data') || obj || []})
	blockConverter: ?Function;

	/**
	 * Initial select options
	 */
	optionsProp: Array<Object> = [];

	/**
	 * Initial selected value
	 */
	selectedProp: ?any;

	/**
	 * Option component
	 */
	option: ?string;

	/**
	 * If true, then .initLoad will be executed after .mods.opened === 'true'
	 */
	initAfterOpen: boolean = false;

	/** @override */
	@field()
	blockValueField: string = 'selected';

	/**
	 * Select options store
	 */
	@field((o) => o.link('optionsProp', (val) => {
		if (o.dataProvider || Object.fastCompare(val, o.optionsStore)) {
			return o.optionsStore || [];
		}

		return val;
	}))

	optionsStore: Array<Object>;

	/**
	 * Selected value store
	 */
	@field((o) => o.link('selectedProp', (val) => {
		if (val === undefined) {
			o.localEvent.once('component.created', () => o.selectedStore = o.default);
			return;
		}

		return val;
	}))

	selectedStore: any;

	/** @private */
	@abstract
	_labels: ?Object;

	/** @private */
	@abstract
	_values: ?Object;

	/** @override */
	get $refs(): {
		input: HTMLInputElement,
		scroll: ?bScrollInline,
		select: ?HTMLSelectElement
	} {}

	/** @override */
	async initLoad() {
		try {
			/// FIXME
			if (this.initAfterOpen && !this.b.is.mobile) {
				await this.async.wait(() => this.mods.opened !== 'false' || this.mods.focused === 'true');
			}

			return super.initLoad();
		} catch (_) {}
	}

	/** @override */
	initRemoteData(): ?any {
		if (!this.db) {
			return;
		}

		const
			val = this.blockConverter ? this.blockConverter(this.db) : this.db;

		if (Object.isArray(val)) {
			return this.options = val;
		}

		return this.options;
	}

	/**
	 * Options synchronization
	 * @param value
	 */
	@params({immediate: true})
	async $$optionsStore(value: Array<Object>) {
		this._labels = $C(value).reduce((map, el) => {
			el.value = this.getOptionValue(el);
			el.label = this.t(el.label);

			map[el.label] = el;
			return map;
		}, {});

		this._values = $C(value).reduce((map, el) => {
			el.value = this.getOptionValue(el);
			map[el.value] = el;
			return map;
		}, {});

		const
			selected = this._values[this.selected];

		if (selected) {
			this.value = this.getOptionLabel(selected);
		}

		if (value.length && this.$refs.scroll) {
			await this.$refs.scroll.initScroll();
		}
	}

	/**
	 * Selected value synchronization
	 * @param value
	 */
	@params({immediate: true})
	async $$selectedStore(value: any) {
		if (value === undefined) {
			this.value = undefined;
			return;
		}

		value = this._values && this._values[value];
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
				selected = this.block.element('option', {selected: true}),
				{scroll} = this.$refs;

			if (selected) {
				const
					selTop = selected.offsetTop,
					selHeight = selected.offsetHeight,
					selOffset = selTop + selHeight;

				const
					scrollHeight = await scroll.height,
					scrollTop = (await scroll.scrollOffset).top;

				if (selOffset > scrollHeight) {
					if (selOffset > scrollTop + scrollHeight) {
						scroll.scrollOffset = {top: selTop - scrollHeight + selHeight};

					} else if (selOffset < scrollTop + selected.offsetHeight) {
						scroll.scrollOffset = {top: selTop};
					}

				} else if (selOffset < scrollTop) {
					scroll.scrollOffset = {top: selTop};
				}
			}

		} catch (_) {}
	}

	/**
	 * Select options
	 */
	get options(): Array<Object> {
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
	set options(value: Array<Object>) {
		this.optionsStore = value;
	}

	/**
	 * Selected value
	 */
	get selected(): ?string {
		const val = this.selectedStore;
		return val !== undefined ? String(val) : val;
	}

	/**
	 * Sets a new selected value
	 * @param value
	 */
	set selected(value: ?string) {
		this.selectedStore = value;
	}

	/** @override */
	async clear(): boolean {
		await this.close();

		if (this.value || this.selected) {
			this.value = undefined;
			await super.clear();
			return true;
		}

		return false;
	}

	/**
	 * Returns a value of the specified option
	 * @param option
	 */
	getOptionValue(option: Object): string {
		return String(option.value !== undefined ? option.value : option.label);
	}

	/**
	 * Returns a label of the specified option
	 * @param option
	 */
	getOptionLabel(option: Object): string {
		return String(option.inputLabel != null ? option.inputLabel : option.label);
	}

	/**
	 * Synchronizes :selected and :value
	 * @param [selected]
	 */
	syncValue(selected?: string) {
		if (selected) {
			this.selected = selected;
		}

		const
			label = this._values[this.selected];

		if (label) {
			this.value = this.getOptionLabel(label);
		}
	}

	/**
	 * Returns true if the specified option is selected
	 * @param option
	 */
	isSelected(option: Object): boolean {
		const
			val = this.getOptionValue(option);

		if (option.selected && !this.selected && !this.value) {
			if (this.mods.focused !== 'true') {
				this.value = this.getOptionLabel(option);
			}

			this.selected = val;
		}

		return this.selected || this.value ? val === String(this.selected) : option.selected;
	}

	/** @override */
	initCloseHelpers() {
		const
			{async: $a, localEvent: $e} = this;

		$e.on('block.mod.set.opened.true', () => {
			$a.off({group: 'navigation'});

			if (window.openedSelect) {
				window.openedSelect.close().catch(() => {});
			}

			window.openedSelect = this;

			const
				{selected} = this;

			const reset = async () => {
				if (selected) {
					await this.onOptionSelected(selected);
				}

				await this.close();
			};

			$a.on(document, 'click', {
				group: 'global',
				fn: (e) => {
					if (!e.target.closest(`.${this.blockId}`)) {
						return reset();
					}
				}
			});

			$a.on(document, 'keyup', {
				group: 'global',
				fn: (e) => {
					if (e.keyCode === keyCodes.ESC) {
						e.preventDefault();
						return reset();
					}
				}
			});

			$a.on(document, 'keydown', {
				group: 'navigation',
				fn: async (e) => {
					if (!{[keyCodes.UP]: true, [keyCodes.DOWN]: true, [keyCodes.ENTER]: true}[e.keyCode]) {
						return;
					}

					e.preventDefault();

					const
						{block: $b} = this,
						selected = getSelected();

					function getSelected() {
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
										this.selected = selected.previousElementSibling.dataset.value;
										break;
									}

									await this.close();
								}
							}

							break;

						case keyCodes.DOWN: {
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

									this.selected = $b.element('option').dataset.value;
								}
							};

							if (this.selected) {
								if (selected) {
									await select(selected);
									break;
								}
							}

							await select($b.element('option'));
							break;
						}
					}
				}
			});
		});

		$e.once(`block.status.ready`, () => {
			$e.on('block.mod.set.opened.false', () => {
				if (window.openedSelect === this) {
					window.openedSelect = null;
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
	@mod('focused', true)
	@wait('ready')
	async open(): boolean {
		if (this.b.is.mobile) {
			this.$refs.select.focus();
			this.emit('open');
			return true;

		} else if (await this.setMod('opened', true)) {
			if (!this.options.length) {
				return true;
			}

			const
				selected = this.block.element('option', {selected: true});

			if (this.ifOnce('opened') < 2) {
				await Promise.all([this.nextTick(), this.waitRef('scroll')]);
			}

			if (this.mods.opened === 'true') {
				const {scroll} = this.$refs;
				scroll.scrollOffset = {top: selected ? selected.offsetTop : 0};
				await scroll.calcScroll();
				this.emit('open');
				return true;
			}

			return false;
		}

		return false;
	}

	/** @override */
	@wait('ready')
	async focus(): boolean {
		if (this.b.is.mobile) {
			const
				{select} = this.$refs;

			if (document.activeElement !== select) {
				select.focus();
				this.emit('focus');
				return true;
			}

			return false;
		}

		return super.focus();
	}

	/* eslint-disable no-unused-vars */

	/** @override */
	onEdit(e: InputEvent) {
		this.async.setTimeout({
			label: $$.quickSearch,
			fn: () => {
				const
					rgxp = new RegExp(`^${RegExp.escape(this.value)}`, 'i');

				if (
					$C(this._labels).some((el, key) => {
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
			}

		}, 0.2.second());
	}

	/** @override */
	async onBlockValueChange(newValue: any, oldValue: any) {
		try {
			await this.async.wait(() => this.mods.opened !== 'true', {label: $$.onBlockValueChange});
			super.onBlockValueChange(...arguments);
		} catch (_) {}
	}

	/* eslint-enable no-unused-vars */

	/**
	 * Handler: option select
	 *
	 * @param [value]
	 * @emits actionChange(selected: ?string)
	 */
	onOptionSelected(value?: string): Promise {
		const
			v = this._values[this.selected];

		if (value !== this.selected || v && this.value !== this.getOptionLabel(v)) {
			this.syncValue(value);
			this.emit('actionChange', this.selected);
		}

		return this.close();
	}

	/** @inheritDoc */
	created() {
		if (!this.b.is.mobile) {
			this.$watch('asyncCounter', async () => {
				try {
					await this.waitRef('scroll');
					await this.$refs.scroll.initScroll();
				} catch (_) {}
			});

			this.initCloseHelpers();
		}

		if (this.selected === undefined && this.value) {
			const
				option = this._labels[this.value];

			if (option) {
				this.selected = option.value;
			}

		} else if (this.selected !== undefined && !this.value) {
			const val = this._values[this.selected];
			this.value = val ? this.getOptionLabel(val) : '';
		}
	}

	/** @inheritDoc */
	mounted() {
		this.async.on(this.$el, 'click', {
			label: $$.activation,
			fn: this.delegateElement('option', (e) => this.onOptionSelected(e.delegateTarget.dataset.value))
		});
	}
}
