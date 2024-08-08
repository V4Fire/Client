/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iVisible from 'components/traits/i-visible/i-visible';

import iData, {

	component,
	prop,

	ModelMethod,
	DataProviderProp,
	RequestFilter,
	CreateRequestOptions

} from 'components/super/i-data/i-data';

import type { ActionFn } from 'components/form/b-form/interface';

@component({partial: 'b-form'})
export default abstract class iFormProps extends iData {
	override readonly dataProviderProp: DataProviderProp = 'Provider';
	override readonly defaultRequestFilter: RequestFilter = true;

	/** {@link iVisible.hideIfOffline} */
	@prop(Boolean)
	readonly hideIfOffline: boolean = false;

	/**
	 * The form identifier.
	 * You can use it to connect the form to components lying "outside" from the form body (using the `form` attribute).
	 *
	 * @example
	 * ```
	 * < b-form :id = 'my-form'
	 * < b-input :form = 'my-form'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly id?: string;

	/**
	 * The form name.
	 * You can use it to find the form element via `document.forms`.
	 *
	 * @example
	 * ```
	 * < b-form :name = 'my-form'
	 * ```
	 *
	 * ```js
	 * console.log(document.forms['my-form']);
	 * ```
	 */
	@prop({type: String, required: false})
	readonly name?: string;

	/**
	 * The form action URL (the URL where the data will be submitted) or a function to create the action.
	 * If no value is specified, the component will use the default URLs from the data provider.
	 *
	 * @example
	 * ```
	 * < b-form :action = '/create-user'
	 * < b-form :action = createUser
	 * ```
	 */
	@prop({type: [String, Function], required: false})
	readonly action?: string | ActionFn;

	/**
	 * The data provider method that is called when the form is submitted
	 *
	 * @example
	 * ```
	 * < b-form :dataProvider = 'User' | :method = 'upd'
	 * ```
	 */
	@prop(String)
	readonly method: ModelMethod = 'post';

	/**
	 * Additional form request parameters
	 *
	 * @example
	 * ```
	 * < b-form :params = {headers: {'x-foo': 'bla'}}
	 * ```
	 */
	@prop(Object)
	readonly paramsProp: CreateRequestOptions = {};

	/**
	 * If true, all form elements will be cached.
	 * Caching means that if some component value has not changed since the last time the form was submitted,
	 * it will not be resubmitted.
	 *
	 * @example
	 * ```
	 * < b-form :dataProvider = 'User' | :method = 'upd' | :cache = true
	 *   < b-input :name = 'fname'
	 *   < b-input :name = 'lname'
	 *   < b-input :name = 'bd' | :cache = false
	 *   < b-button :type = 'submit'
	 * ```
	 */
	@prop(Boolean)
	readonly cache: boolean = false;
}
