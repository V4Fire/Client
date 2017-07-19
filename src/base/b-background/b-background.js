'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import iBlock, { abstract, wait } from 'super/i-block/i-block';
import { component } from 'core/component';

export const
	$$ = new Store();

@component({tpl: false})
export default class bBackground extends iBlock {
	/**
	 * Block cache
	 */
	@abstract
	cache: Object;

	/** @override */
	async initLoad() {
		this.cache = await this.loadSettings() || {};
		this.block.status = this.block.statuses.ready;
		this.emit('initLoad');
	}

	/**
	 * Normalizes a string
	 * @param str
	 */
	clrfx(str: string): string {
		return str.replace(/[\s(),]/g, '_');
	}

	/**
	 * Applies background style to the node
	 *
	 * @param className
	 * @param dataURI - data:uri of a class image
	 * @emits applyStyle(className: string, dataURI: string)
	 */
	@wait('ready', {label: $$.applyStyle, defer: true})
	async applyStyle(className: string, dataURI: string) {
		if (this.blockName) {
			className = `${this.blockName}-${className}`;
		}

		const style = document.createElement('style');
		style.innerHTML = `
			.${className} {
				background-image: url(${dataURI});
			}
		`;

		this.cache[className] = dataURI;
		this.saveSettings(this.cache);
		document.head.appendChild(style);
		this.$el.classList.add(className);
		this.emit('applyStyle', className, dataURI);
	}
}
