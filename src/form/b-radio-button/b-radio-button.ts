/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bCheckbox, { component, Value, FormValue } from 'form/b-checkbox/b-checkbox';
export * from 'super/i-input/i-input';

@component({flyweight: true})
export default class bRadioButton<
	V extends Value = Value,
	FV extends FormValue = FormValue,
	D extends object = Dictionary
> extends bCheckbox<V, FV, D> {
	/** @override */
	protected async onClick(e: Event): Promise<void> {
		if (this.mods.checked === 'true') {
			return;
		}

		return super.onClick(e);
	}
}
