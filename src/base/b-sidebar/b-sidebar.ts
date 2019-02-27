/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { component } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

@component()
export default class bSidebar<T extends Dictionary = Dictionary> extends iData<T> {
	/** @override */
	protected syncStorageState(): Dictionary {
		return {
			'mods.opened': this.mods.opened
		};
	}

	/** @override */
	protected async onTouchClose(e: MouseEvent): Promise<void> {
		const
			target = <Element>e.target;

		if (!target) {
			return;
		}

		if (target.matches(this.block.getElSelector('overWrapper'))) {
			e.preventDefault();
			await this.close();
		}
	}
}
