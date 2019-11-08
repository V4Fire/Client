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
		await this.focus();

		if (await this.check()) {
			const
				ctx = <any>this;

			for (let els = this.groupElements, i = 0; i < els.length; i++) {
				const
					el = els[i];

				if (el !== ctx && this.isComponent(el, bRadioButton)) {
					el.uncheck().catch(stderr);
				}
			}

			this.emit('actionChange', true);
		}
	}
}
