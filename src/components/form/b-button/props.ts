/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { HintPosition } from 'components/global/g-hint';

import type iVisible from 'components/traits/i-visible/i-visible';
import type iAccess from 'components/traits/i-access/i-access';

import iData, {

	component,
	prop,

	ModelMethod,
	DataProviderProp,
	RequestFilter

} from 'components/super/i-data/i-data';

import type bButton from 'components/form/b-button/b-button';
import type { ButtonType } from 'components/form/b-button/interface';

@component({partial: 'i-button'})
export default abstract class iButtonProps extends iData {
	override readonly dataProviderProp: DataProviderProp = 'Provider';
	override readonly defaultRequestFilter: RequestFilter = true;

	/** {@link iVisible.hideIfOffline} */
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

	/** {@link iAccess.autofocus} */
	@prop({type: Boolean, required: false})
	readonly autofocus?: boolean;

	/** {@link iAccess.tabIndex} */
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
	 * @see {gHint}
	 *
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
	 *
	 * @see {gHint}
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
	 * {@link bButton.$refs.button}
	 */
	@prop({type: Object, required: false})
	readonly attrsProp?: Dictionary;
}
