/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:form/b-checkbox/README.md]]
 * @packageDocumentation
 */

import bCheckbox, { component } from 'form/b-checkbox/b-checkbox';

export * from 'super/i-input/i-input';

/**
 * Component to create a radio button
 */
@component({flyweight: true})
export default class bRadioButton extends bCheckbox {
	/** @override */
	readonly changeable: boolean = false;

	/** @override */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected async onClick(e: Event): Promise<void> {
		await this.focus();

		const
			ctx = <any>this;

		const uncheckOthers = async () => {
			for (let els = await this.groupElements, i = 0; i < els.length; i++) {
				const
					el = els[i];

				if (el !== ctx && this.isComponent(el, bRadioButton)) {
					el.uncheck().catch(stderr);
				}
			}

			this.emit('actionChange', true);
		};

		if (this.changeable) {
			await this.toggle();
			await uncheckOthers();

		} else if (await this.check()) {
			await uncheckOthers();
		}
	}
}
