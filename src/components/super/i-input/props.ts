/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iAccess from 'components/traits/i-access/i-access';
import type iVisible from 'components/traits/i-visible/i-visible';

import iData, { component, prop, ComponentConverter } from 'components/super/i-data/i-data';
import type { Value, FormValue, Validator } from 'components/super/i-input/interface';

import { unpackIf } from 'components/super/i-input/modules/helpers';

@component({partial: 'iInput'})
export default abstract class iInputProps extends iData {
	/**
	 * Type: the value of the component
	 */
	readonly Value!: Value;

	/**
	 * Type: the value of the component to be sent through a form
	 */
	readonly FormValue!: FormValue;

	/**
	 * The value of the component
	 */
	@prop({required: false})
	readonly valueProp?: this['Value'];

	/** {@link iInputProps.valueProp} */
	@prop({required: false})
	readonly modelValue?: this['Value'];

	/**
	 * The default value of the component.
	 * This value will be used if no `value` is specified for the property or after calling the `reset` method.
	 */
	@prop({required: false})
	readonly defaultProp?: this['Value'];

	/**
	 * The ID attribute value for the component.
	 * Typically, this attribute is set on the native form control element inside the component.
	 * You can use it to integrate with a label or other form element.
	 *
	 * @example
	 * ```
	 * < b-input :id = 'my-input'
	 *
	 * < label for = my-input
	 *   The input label
	 * ```
	 */
	@prop({type: String, required: false})
	readonly id?: string;

	/**
	 * A string specifying a name for the form control.
	 * This name is submitted along with the control value when the form data is submitted.
	 * If you do not specify a name, the form will ignore your component.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname
	 *
	 * @example
	 * ```
	 * < form
	 *   < b-input :name = 'fname' | :value = 'Andrey'
	 *
	 *   /// After clicking, the form generates an object to submit with the values `{fname: 'Andrey'}`
	 *   < button type = submit
	 *     Submit
	 * ```
	 */
	@prop({type: String, required: false})
	readonly name?: string;

	/**
	 * A string specifying the `<form>` element with which the component is associated (that is, its form owner).
	 * This string value, if present, must match the id of a `<form>` element in the same document.
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
	 * < form id = my-form
	 *   < button type = submit
	 *     Submit
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
	 * Additional attributes that are provided to the native form control within the component
	 * {@link iInputProps.$refs.input}
	 */
	@prop({type: Object, required: false})
	readonly attrsProp?: Dictionary;

	/**
	 * Component value(s) that cannot be submitted via the associated form.
	 * If the component value matches with one of the denied conditions,
	 * the component form value will be set to undefined.
	 *
	 * The parameter can accept a value or an iterable of values to be prohibited.
	 * You can also pass the parameter as a function or a regular expression.
	 *
	 * {@link iInputProps.formValue}
	 *
	 * @example
	 * ```
	 * /// Disallow values that contain only spaces
	 * < b-input :name = 'name' | :disallow = /^\s*$/
	 * ```
	 */
	@prop({required: false})
	readonly disallowProp?: CanIter<this['Value'] | Function | RegExp>;

	/**
	 * Component value converter(s) to form value.
	 *
	 * You can provide one or more functions to convert the original value into a new form value.
	 * For example, if you have an input component, the original input value is a string, but you provide a function to
	 * parse that string into a Date object.
	 *
	 * ```
	 * < b-input :formValueConverter = toDate
	 * ```
	 *
	 * To provide more than one function, pass an iterable of functions.
	 * The functions from the iterable will be called from left to right.
	 *
	 * ```
	 * < b-input :formValueConverter = [toDate, toUTC]
	 * ```
	 *
	 * Any converter can return a Promise.
	 * When iterating through value converters, they will wait for the previous value to be resolved before being called.
	 *
	 * Additionally, any transformer can return a `Maybe` monad. This helps to combine validators and converters.
	 *
	 * ```
	 * < b-input :validators = ['required'] | :formValueConverter = [toDate.option(), toUTC.toUTC()]
	 * ```
	 *
	 * {@link iInputProps.formValue}
	 */
	@prop({
		validator: (v) => v == null || Object.isFunction(v) || Object.isIterable(v),
		required: false
	})

	readonly formValueConverter?: CanIter<ComponentConverter>;

	/**
	 * Converter(s) that is used by the associated form.
	 * The form applies these converters to the group form value of the component.
	 *
	 * To provide more than one function, pass an iterable of functions.
	 * The functions from the iterable will be called from left to right.
	 *
	 * ```
	 * < b-input :formConverter = [toProtobuf, zip]
	 * ```
	 *
	 * Any converter can return a Promise.
	 * When iterating through value converters, they will wait for the previous value to be resolved before being called.
	 *
	 * Additionally, any transformer can return a `Maybe` monad. This helps to combine validators and converters.
	 *
	 * ```
	 * < b-input :validators = ['required'] | :formConverter = [toProtobuf.option(), zip.toUTC()]
	 * ```
	 */
	@prop({
		validator: (v) => v == null || Object.isFunction(v) || Object.isIterable(v),
		required: false
	})

	readonly formConverter: CanIter<ComponentConverter> = [unpackIf];

	/**
	 * If set to false, the linked form will not cache the component value.
	 *
	 * Caching means that if the component value has not changed since the last form submission,
	 * it will not be resubmitted.
	 */
	@prop(Boolean)
	readonly cache: boolean = true;

	/**
	 * An iterable of validators for checking component value.
	 * If any of the validators returns a value other than true, the corresponding form will not submit data.
	 *
	 * @example
	 * ```
	 * < b-input :name = 'name' | :validators = ['required', ['pattern', {pattern: /^\d+$/}]]
	 * ```
	 */
	@prop({
		validator: (val) => val == null || Object.isIterable(val),
		required: false
	})

	readonly validatorsProp?: Iterable<Validator>;

	/**
	 * Information message that the component should display.
	 * Logically, this option is very similar to displaying STDIN in Unix.
	 *
	 * @example
	 * ```
	 * < b-input :info = 'This is required parameter'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly infoProp?: string;

	/**
	 * Error message that the component should display.
	 * Logically, this option is very similar to displaying STDERR in Unix.
	 *
	 * @example
	 * ```
	 * < b-input :error = 'This is required parameter'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly errorProp?: string;

	/**
	 * If set to true, the default markup for displaying information/error messages is created in the component template
	 */
	@prop(Boolean)
	readonly messageHelpers: boolean = false;

	/** {@link iVisible.hideIfOffline} */
	@prop(Boolean)
	readonly hideIfOffline: boolean = false;
}
