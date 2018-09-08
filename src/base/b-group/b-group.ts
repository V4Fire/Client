/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { component, prop } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

@component()
export default class bGroup extends iData {
	/**
	 * Group title
	 */
	@prop(String)
	readonly title: string = '';

	/** @override */
	protected convertStateToStorage(): Dictionary {
		return {
			'mods.opened': this.mods.opened
		};
	}
}
