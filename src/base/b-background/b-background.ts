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
	/**
	 * Styles cache
	 */
	@system()
	cache: Dictionary<string> = {};

	/**
	 * Applies background style to the node
	 *
	 * @param className
	 * @param dataURI - data:uri of a class image
	 * @emits applyStyle(className: string, dataURI: string)
	 */
	@wait('ready', {label: $$.applyStyle, defer: true})
	async applyStyle(className: string, dataURI: string): Promise<void> {
		const
			{head} = document;

		if (!head) {
			return;
		}

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

		this.cache[className] = dataURI;
		head.appendChild(style);

		this.$el.classList.add(className);
		this.emit('applyStyle', className, dataURI);
	}

	/** @override */
	protected convertStateToStorage(): Dictionary {
		return super.convertStateToStorage({cache: this.cache});
	}
}
