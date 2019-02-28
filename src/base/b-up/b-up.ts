/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iVisible from 'traits/i-visible/i-visible';
import iBlock, { component, hook, watch, ModsDecl } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

@component({functional: true})
export default class bUp extends iBlock implements iVisible {
	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		hidden: [
			...iVisible.mods.hidden,
			['true']
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

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}
}
