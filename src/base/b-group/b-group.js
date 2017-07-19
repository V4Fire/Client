'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData from 'super/i-data/i-data';
import { component } from 'core/component';

@component()
export default class bGroup extends iData {
	/**
	 * Group title
	 */
	title: ?string = '';

	/** @override */
	async initLoad() {
		const
			opts = await this.loadSettings() || {};

		if (opts.opened) {
			this.setMod('opened', opts.opened);
		}

		return super.initLoad();
	}

	/** @inheritDoc */
	created() {
		this.localEvent.on('block.mod.*.opened.*', (el) => {
			if (this.blockName) {
				this.saveSettings({[el.name]: el.value});
			}
		});
	}
}
