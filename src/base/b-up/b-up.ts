/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iBlock, { component, hook, watch, ModsDecl } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

@component({functional: true})
export default class bUp extends iBlock {
	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		hidden: [
			['true'],
			'false'
		]
	};

	/**
	 * Handler: click trigger
	 * @emits up()
	 */
	@watch('?$el:click')
	protected onClick(): void {
		this.r.scrollToProxy(0, 0);
		this.emit('up');
	}

	/**
	 * Handler: scroll trigger
	 * @emits up()
	 */
	@hook('activated')
	@watch('document:scroll')
	protected onScroll(): void {
		this.setMod('hidden', !(pageYOffset > innerHeight / 3));
	}
}
