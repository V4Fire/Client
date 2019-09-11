/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iIcon from 'traits/i-icon/i-icon';
import iWidth from 'traits/i-width/i-width';

import bCheckbox, { component, prop, ModsDecl } from 'form/b-checkbox/b-checkbox';
export * from 'form/b-checkbox/b-checkbox';

@component()
export default class bIconCheckbox<
	V extends boolean = boolean,
	FV extends boolean = boolean,
	D extends object = Dictionary
> extends bCheckbox<V, FV, D> implements iIcon, iWidth {
	/**
	 * Icon component
	 */
	@prop({type: String, required: false})
	readonly icon?: string;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iWidth.mods
	};

	/** @see iIcon.getIconLink */
	getIconLink(iconId: string): string {
		return iIcon.getIconLink(iconId);
	}
}
