/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bButton, { component, prop } from 'form/b-button/b-button';

export * from 'form/b-button/b-button';

@component({
	flyweight: true,
	functional: {
		dataProvider: undefined,
		href: undefined
	}
})

export default class bIconButton<T extends object = Dictionary> extends bButton<T> {
	/** @override */
	@prop({type: String})
	readonly icon?: string;
}
