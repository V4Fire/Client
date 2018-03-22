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
	async initLoad(): Promise<void> {
		const
			opts = await this.loadSettings() || {};

		if (opts.opened) {
			this.setMod('opened', opts.opened);
		}

		return super.initLoad();
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.localEvent.on('block.mod.*.opened.*', async (el) => {
			if (this.blockName) {
				await this.saveSettings({[el.name]: el.value});
			}
		});
	}
}
