/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iBlock, { component, system, wait } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

@component({tpl: false})
export default class bBackground extends iBlock {
	/** @override */
	async initLoad(): Promise<void> {
		this.tmp[$$.cache] = await this.loadSettings() || {};
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
	async applyStyle(className: string, dataURI: string): Promise<void> {
		if (this.globalName) {
			className = `${this.globalName}-${className}`;
		}

		const style = Object.assign(document.createElement('style'), {
			innerHTML: `
				.${className} {
					background-image: url(${dataURI});
				}
			`
		});

		const
			c = <Dictionary>this.tmp[$$.cache];

		c[className] = dataURI;
		document.head.appendChild(style);

		this.$el.classList.add(className);
		this.emit('applyStyle', className, dataURI);
		await this.saveSettings(c);
	}
}
