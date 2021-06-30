/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:form/b-button/README.md]]
 * @packageDocumentation
 */

import { derive } from 'core/functools/trait';

//#if runtime has core/data
import 'core/data';
//#endif

import type bForm from 'form/b-form/b-form';

import iProgress from 'traits/i-progress/i-progress';
import iAccess from 'traits/i-access/i-access';
import iVisible from 'traits/i-visible/i-visible';
import iWidth from 'traits/i-width/i-width';
import iSize from 'traits/i-size/i-size';

import iOpenToggle, { CloseHelperEvents } from 'traits/i-open-toggle/i-open-toggle';
import type { HintPosition } from 'global/g-hint/interface';

import iData, {

	component,
	prop,
	computed,
	wait,
	p,

	ModsDecl,
	ModelMethod,
	RequestFilter

} from 'super/i-data/i-data';

import type { ButtonType } from 'form/b-button/interface';

export * from 'super/i-data/i-data';
export * from 'traits/i-open-toggle/i-open-toggle';
export * from 'form/b-button/interface';

interface bButton extends Trait<typeof iAccess>, Trait<typeof iOpenToggle> {}

/**
 * Component to create a button
 */
@component({
	flyweight: true,
	functional: {
		dataProvider: undefined,
		href: undefined
	}
})

@derive(iAccess, iOpenToggle)
class bButton extends iData implements iAccess, iOpenToggle, iVisible, iWidth, iSize {
	/** @override */
	readonly dataProvider: string = 'Provider';

	/** @override */
	readonly defaultRequestFilter: RequestFilter = true;

	/**
	 * A button' type to create. There can be values:
	 *
	 * 1. `button` - simple button control;
	 * 2. `submit` - button to send the tied form;
	 * 3. `file` - button to open the file uploading dialog;
	 * 4. `link` - hyperlink to the specified URL (to provide URL, use the `href` prop).
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
	 * If the `type` prop is passed to `file`, this prop defines which file types are selectable in a file upload control
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
	 * Otherwise, the prop includes a base URL for a data provider.
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
	 * A data provider method to use if `dataProvider` or `href` props are passed
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
	 * This string's value, if present, must match the id of a `<form>` element in the same document.
	 * If this attribute isn't specified, the component is associated with the nearest containing form, if any.
	 *
	 * The form prop lets you place a component anywhere in the document but have it included with a form elsewhere
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
	 * Icon to show before the button text
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
	 * Name of the used component to show `preIcon`
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
	 * Icon to show after the button text
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
	 * Name of the used component to show `icon`
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
	 * Boolean, if need to show progress by slot or `b-progress-icon`
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
	 * Tooltip text to show during hover the cursor
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
	 * Tooltip position to show during hover the cursor
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
	 * The way to show dropdown if the `dropdown` slot is provided
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
	 * List of selected files (works with the `file` type)
	 */
	get files(): CanUndef<FileList> {
		return this.$refs.file?.files ?? undefined;
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
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

	/** @override */
	protected readonly $refs!: {
		button: HTMLButtonElement;
		file?: HTMLInputElement;
	};

	/**
	 * If the `type` prop is passed to `file`, resets a file input
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
	@p({hook: 'beforeDataCreate', replace: false})
	protected initCloseHelpers(events?: CloseHelperEvents): void {
		iOpenToggle.initCloseHelpers(this, events);
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iProgress.initModEvents(this);
		iAccess.initModEvents(this);
		iOpenToggle.initModEvents(this);
		iVisible.initModEvents(this);
	}

	/**
	 * Handler: button trigger
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
				const
					dp = this.dataProvider;

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (dp != null && (dp !== 'Provider' || this.href != null)) {
					let
						that = this;

					if (this.href != null) {
						that = this.base(this.href);
					}

					await (<Function>that[this.method])();

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
	 * Handler: changing a value of the file input
	 *
	 * @param e
	 * @emits `change(result: InputEvent)`
	 */
	protected onFileChange(e: Event): void {
		this.emit('change', e);
	}
}

export default bButton;
