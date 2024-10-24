/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/form/b-button/README.md]]
 * @packageDocumentation
 */

import { derive } from 'components/traits';
import DataProvider, { getDefaultRequestParams, base, get } from 'components/friends/data-provider';

import type bForm from 'components/form/b-form/b-form';

import iProgress from 'components/traits/i-progress/i-progress';
import iAccess from 'components/traits/i-access/i-access';

import iVisible from 'components/traits/i-visible/i-visible';
import iWidth from 'components/traits/i-width/i-width';
import iSize from 'components/traits/i-size/i-size';

import iOpenToggle, { CloseHelperEvents } from 'components/traits/i-open-toggle/i-open-toggle';

import {

	component,
	computed,
	wait,
	hook,

	ModsDecl,
	ModEvent

} from 'components/super/i-data/i-data';

import iButtonProps from 'components/form/b-button/props';

export * from 'components/super/i-data/i-data';
export * from 'components/traits/i-open-toggle/i-open-toggle';
export * from 'components/form/b-button/interface';

DataProvider.addToPrototype({getDefaultRequestParams, base, get});

interface bButton extends Trait<typeof iAccess>, Trait<typeof iOpenToggle> {}

@component({
	functional: {
		wait: undefined,
		dataProvider: undefined,
		href: undefined
	}
})

@derive(iAccess, iOpenToggle)
class bButton extends iButtonProps implements iOpenToggle, iVisible, iWidth, iSize {
	/**
	 * Additional attributes that are provided to the native button
	 *
	 * {@link bButton.attrsProp}
	 * {@link bButton.$refs.button}
	 */
	@computed({dependencies: ['type', 'form', 'href', 'hasDropdown']})
	get attrs(): Dictionary {
		const attrs = {...this.attrsProp};

		if (this.type === 'link') {
			attrs.href = this.href;

		} else {
			attrs.type = this.type;
			attrs.form = this.form;
		}

		if (this.hasDropdown) {
			attrs['aria-controls'] = this.dom.getId('dropdown');
			attrs['aria-expanded'] = this.mods.opened;
		}

		return attrs;
	}

	/** {@link iAccess.prototype.isFocused} */
	@computed({dependencies: ['mods.focused']})
	get isFocused(): boolean {
		const {button} = this.$refs;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (button != null) {
			return document.activeElement === button;
		}

		return iAccess.isFocused(this);
	}

	/**
	 * True if the component has a dropdown
	 */
	get hasDropdown(): boolean {
		return Boolean(this.$slots['dropdown']);
	}

	/**
	 * A list of selected files (only works with the `file` type)
	 */
	get files(): CanNull<FileList> {
		return this.$refs.file?.files ?? null;
	}

	static override readonly mods: ModsDecl = {
		...iAccess.mods,
		...iVisible.mods,
		...iWidth.mods,
		...iSize.mods,

		opened: [
			...iOpenToggle.mods.opened ?? [],
			['false']
		],

		upper: [
			'true',
			'false'
		]
	};

	/** @inheritDoc */
	declare protected readonly $refs: iButtonProps['$refs'] & {
		button: HTMLButtonElement;
		file?: HTMLInputElement;
		dropdown?: Element;
	};

	/**
	 * If the `type` prop is passed to `file`, resets the file input
	 */
	@wait('ready')
	reset(): CanPromise<void> {
		const {file} = this.$refs;

		if (file != null) {
			file.value = '';
		}
	}

	/** {@link iOpenToggle.initCloseHelpers} */
	@hook('beforeDataCreate')
	protected initCloseHelpers(events?: CloseHelperEvents): void {
		iOpenToggle.initCloseHelpers(this, events);
	}

	protected override syncDataProviderWatcher(initLoad: boolean = true): void {
		if (
			this.href != null ||
			this.request != null ||
			this.dataProviderProp !== 'Provider' ||
			this.dataProviderOptions != null
		) {
			super.syncDataProviderWatcher(initLoad);
		}
	}

	protected override initModEvents(): void {
		const {localEmitter: $e} = this;

		super.initModEvents();

		iProgress.initModEvents(this);
		iProgress.initDisableBehavior(this);

		iAccess.initModEvents(this);
		iOpenToggle.initModEvents(this);

		iVisible.initModEvents(this);

		$e.on('block.mod.*.opened.*', (e: ModEvent) => this.waitComponentStatus('ready', () => {
			const expanded = e.value !== 'false' && e.type !== 'remove';
			this.$refs.button.setAttribute('aria-expanded', String(expanded));
		}));

		$e.on('block.mod.*.disabled.*', (e: ModEvent) => this.waitComponentStatus('ready', () => {
			const {button, file} = this.$refs;

			const disabled = e.value !== 'false' && e.type !== 'remove';
			button.disabled = disabled;

			if (file != null) {
				file.disabled = disabled;
			}
		}));

		$e.on('block.mod.*.focused.*', (e: ModEvent) => this.waitComponentStatus('ready', () => {
			const {button} = this.$refs;

			if (e.value !== 'false' && e.type !== 'remove') {
				button.focus();

			} else {
				button.blur();
			}
		}));
	}

	/**
	 * Handler: there was a click on the component
	 *
	 * @param e
	 * @emits `click(e: Event)`
	 */
	protected async onClick(e: Event): Promise<void> {
		switch (this.type) {
			case 'link':
				break;

			case 'file':
				this.$refs.file?.click();
				break;

			default: {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (this.dataProviderProp != null && (this.dataProviderProp !== 'Provider' || this.href != null)) {
					let
						{dataProvider} = this;

					if (dataProvider == null) {
						throw new ReferenceError('Missing data provider to send data');
					}

					if (!Object.isFunction(dataProvider[this.method])) {
						throw new ReferenceError(`The specified request method "${this.method}" does not exist in the data provider`);
					}

					if (this.href != null) {
						dataProvider = dataProvider.base(this.href);
					}

					await dataProvider[this.method](undefined);

				// Form attribute fix for MS Edge && IE
				} else if (this.form != null && this.type === 'submit') {
					e.preventDefault();
					const form = this.dom.getComponent<bForm>(`#${this.form}`);
					form && await form.submit();
				}

				await this.toggle();
			}
		}

		this.emit('click', e);
	}

	/**
	 * Handler: the file input value has changed
	 *
	 * @param e
	 * @emits `change(result: InputEvent)`
	 */
	protected onFileChange(e: Event): void {
		this.emit('change', e);
	}
}

export default bButton;
