/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iIcon from 'traits/i-icon/i-icon';
import bCheckbox, { component, prop } from 'form/b-checkbox/b-checkbox';
export * from 'form/b-checkbox/b-checkbox';

@component()
export default class bIconCheckbox<
	V extends boolean = boolean,
	FV extends boolean = boolean,
	D extends Dictionary = Dictionary
> extends bCheckbox<V, FV, D> implements iIcon {
	/**
	 * Icon component
	 */
	@prop({type: String, required: false})
	readonly icon?: string;

	/** @see iIcon.getIconLink */
	getIconLink(iconId: string): string {
		return iIcon.getIconLink(iconId);
	}
}
