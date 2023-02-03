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

import { derive } from 'core/functools/trait';
import DataProvider, { getDefaultRequestParams, base, get } from 'components/friends/data-provider';

import type bForm from 'components/form/b-form/b-form';
import type { HintPosition } from 'components/global/g-hint';

import iProgress from 'components/traits/i-progress/i-progress';
import iAccess from 'components/traits/i-access/i-access';
import iVisible from 'components/traits/i-visible/i-visible';
import iWidth from 'components/traits/i-width/i-width';
import iSize from 'components/traits/i-size/i-size';
import iOpenToggle, { CloseHelperEvents } from 'components/traits/i-open-toggle/i-open-toggle';

import iData, {

	component,
	prop,
	computed,
	wait,
	hook,

	ModsDecl,
	ModEvent,

	ModelMethod,
	DataProviderProp,
	RequestFilter

} from 'components/super/i-data/i-data';

import type { ButtonType } from 'components/form/b-button/interface';

export * from 'components/super/i-data/i-data';
export * from 'components/traits/i-open-toggle/i-open-toggle';
export * from 'components/form/b-button/interface';

DataProvider.addToPrototype(getDefaultRequestParams, base, get);

interface bButton extends Trait<typeof iAccess>, Trait<typeof iOpenToggle> {}

@component({
	functional: {
		dataProvider: undefined,
		href: undefined
	}
})

@derive(iAccess, iOpenToggle)
class bButton extends iData implements iOpenToggle, iVisible, iWidth, iSize {
	override readonly rootTag: string = 'span';
	override readonly dataProviderProp: DataProviderProp = 'Provider';
	override readonly defaultRequestFilter: RequestFilter = true;

	/** @see [[iVisible.hideIfOffline]] */
	@prop(Boolean)
	readonly hideIfOffline: boolean = false;

	/**
	 * The type of button to create. There may be values:
	 *
	 * 1. `button` - a simple button control;
	 * 2. `submit` - a button to submit data of the tied form;
	 * 3. `file` - a button to open the file chooser dialog;
	 * 4. `link` - a hyperlink to the specified URL (to specify a URL, use the `href` prop).
	 *
	 * @example
	 * ```
	 * < b-button @click = console.log('boom!')
	 *   Make boom!
	 *
	 * < b-button :type = 'file' | @onChange = console.log($event)
	 *   Upload a file
	 *
	 * < b-button :type = 'link' | :href = 'https://google.com'
	 *   Go to Google
	 *
	 * < b-form
	 *   < b-input :name = 'name'
	 *   < b-button :type = 'submit'
	 *     Send
	 * ```
	 */
	@prop(String)
	readonly type: ButtonType = 'button';

	/**
	 * If the `type` prop is passed to `file`, this prop specifies which file types can be selected in
	 * the file chooser dialog
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefaccept
	 * @example
	 * ```
	 * < b-button :type = 'file' | :accept = '.txt' | @onChange = console.log($event)
	 *   Upload a file
	 * ```
	 */
	@prop({type: String, required: false})
	readonly accept?: string;

	/**
	 * If the `type` prop is passed to `link`, this prop contains a value for `<a href>`.
	 * Otherwise, the prop includes a base URL for the component data provider.
	 *
	 * @example
	 * ```
	 * < b-button :type = 'link' | :href = 'https://google.com'
	 *   Go to Google
	 *
	 * < b-button :href = '/generate/user'
	 *   Generate a new user
	 * ```
	 */
	@prop({type: String, required: false})
	readonly href?: string;

	/**
	 * A data provider method used if `dataProvider` or `href` props are passed
	 *
	 * @example
	 * ```
	 * < b-button :href = '/generate/user' | :method = 'put'
	 *   Generate a new user
	 *
	 * < b-button :dataProvider = 'Cities' | :method = 'peek'
	 *   Fetch cities
	 * ```
	 */
	@prop(String)
	readonly method: ModelMethod = 'get';

	/**
	 * A string specifying the `<form>` element with which the component is associated (that is, its form owner).
	 * This string value, if present, must match the id of a `<form>` element in the same document.
	 * If this prop isn't specified, the component is associated with the nearest containing form, if any.
	 *
	 * This prop lets you place a component anywhere in the document but have it included with a form elsewhere
	 * in the document.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefform
	 *
	 * @example
	 * ```
	 * < b-input :name = 'fname' | :form = 'my-form'
	 *
	 * < b-button type = 'submit' | :form = 'my-form'
	 *   Submit
	 *
	 * < form id = my-form
	 * ```
	 */
	@prop({type: String, required: false})
	readonly form?: string;

	/** @see [[iAccess.autofocus]] */
	@prop({type: Boolean, required: false})
	readonly autofocus?: boolean;

	/** @see [[iAccess.tabIndex]] */
	@prop({type: Number, required: false})
	readonly tabIndex?: number;

	/**
	 * An icon to show before the button text
	 *
	 * @example
	 * ```
	 * < b-button :preIcon = 'dropdown'
	 *   Submit
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIcon?: string;

	/**
	 * The name of the used component to display `preIcon`
	 *
	 * @default `'b-icon'`
	 * @example
	 * ```
	 * < b-button :preIconComponent = 'b-my-icon'
	 *   Submit
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconComponent?: string;

	/**
	 * An icon to show after the button text
	 *
	 * @example
	 * ```
	 * < b-button :icon = 'dropdown'
	 *   Submit
	 * ```
	 */
	@prop({type: String, required: false})
	readonly icon?: string;

	/**
	 * The name of the used component to display `icon`
	 *
	 * @default `'b-icon'`
	 * @example
	 * ```
	 * < b-button :iconComponent = 'b-my-icon'
	 *   Submit
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconComponent?: string;

	/**
	 * A component to show "in-progress" state or
	 * Boolean, if needed to show progress by slot or `b-progress-icon`
	 *
	 * @default `'b-progress-icon'`
	 * @example
	 * ```
	 * < b-button :progressIcon = 'b-my-progress-icon'
	 *   Submit
	 * ```
	 */
	@prop({type: [String, Boolean], required: false})
	readonly progressIcon?: string | boolean;

	/**
	 * Tooltip text to show on hover
	 *
	 * @example
	 * ```
	 * < b-button :hint = 'Click on me!!!'
	 *   Submit
	 * ```
	 */
	@prop({type: String, required: false})
	readonly hint?: string;

	/**
	 * Tooltip position to show on hover
	 *
	 * @see [[gHint]]
	 * @example
	 * ```
	 * < b-button :hint = 'Click on me!!!' | :hintPos = 'bottom-right'
	 *   Submit
	 * ```
	 */
	@prop({type: String, required: false})
	readonly hintPos?: HintPosition;

	/**
	 * A way to show a dropdown if the 'dropdown' slot is provided
	 * @see [[gHint]]
	 *
	 * @example
	 * ```
	 * < b-button :dropdown = 'bottom-right'
	 *   < template #default
	 *     Submit
	 *
	 *   < template #dropdown
	 *     Additional information...
	 * ```
	 */
	@prop(String)
	readonly dropdown: string = 'bottom';

	/**
	 * Additional attributes that are provided to the native button
	 * @see [[bButton.$refs.button]]
	 */
	@prop({type: Object, required: false})
	readonly attrsProp?: Dictionary;

	/**
	 * Additional attributes that are provided to the native button
	 *
	 * @see [[bButton.attrsProp]]
	 * @see [[bButton.$refs.button]]
	 */
	@computed({dependencies: ['type', 'form', 'href', 'hasDropdown']})
	get attrs(): Dictionary {
		const
			attrs = {...this.attrsProp};

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

	/** @see [[iAccess.isFocused]] */
	@computed({dependencies: ['mods.focused']})
	get isFocused(): boolean {
		const
			{button} = this.$refs;

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
		return Boolean(
			this.$slots['dropdown'] && (
				this.isFunctional ||
				this.opt.ifOnce('opened', this.m.opened !== 'false') > 0 && delete this.reactiveModsStore.opened
			)
		);
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

	protected override readonly $refs!: iData['$refs'] & {
		button: HTMLButtonElement;
		file?: HTMLInputElement;
		dropdown?: Element;
	};

	/**
	 * If the `type` prop is passed to `file`, resets the file input
	 */
	@wait('ready')
	reset(): CanPromise<void> {
		const
			{file} = this.$refs;

		if (file != null) {
			file.value = '';
		}
	}

	/** @see [[iOpenToggle.initCloseHelpers]] */
	@hook('beforeDataCreate')
	protected initCloseHelpers(events?: CloseHelperEvents): void {
		iOpenToggle.initCloseHelpers(this, events);
	}

	protected override initModEvents(): void {
		const
			{localEmitter: $e} = this;

		super.initModEvents();

		iProgress.initModEvents(this);
		iAccess.initModEvents(this);
		iOpenToggle.initModEvents(this);
		iVisible.initModEvents(this);

		$e.on('block.mod.*.opened.*', (e: ModEvent) => this.waitComponentStatus('ready', () => {
			const expanded = e.value !== 'false' && e.type !== 'remove';
			this.$refs.button.setAttribute('aria-expanded', String(expanded));
		}));

		$e.on('block.mod.*.disabled.*', (e: ModEvent) => this.waitComponentStatus('ready', () => {
			const {
				button,
				file
			} = this.$refs;

			const disabled = e.value !== 'false' && e.type !== 'remove';
			button.disabled = disabled;

			if (file != null) {
				file.disabled = disabled;
			}
		}));

		$e.on('block.mod.*.focused.*', (e: ModEvent) => this.waitComponentStatus('ready', () => {
			const
				{button} = this.$refs;

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
