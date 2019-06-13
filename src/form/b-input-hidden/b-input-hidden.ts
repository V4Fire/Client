/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iInput, { component, Value, FormValue } from 'super/i-input/i-input';
export * from  'super/i-input/i-input';

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bInputHidden<
	V extends Value = Value,
	FV extends FormValue = FormValue,
	D extends object = Dictionary
> extends iInput<V, FV, D> {
	/** @override */
	protected readonly $refs!: {input: HTMLInputElement};
}
