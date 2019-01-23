/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iMessage, { component } from 'super/i-message/i-message';
export * from 'super/i-message/i-message';

@component()
export default class bSideBar extends iMessage {
	/** @override */
	protected convertStateToStorage(): Dictionary {
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
