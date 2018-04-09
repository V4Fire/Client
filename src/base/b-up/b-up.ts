/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iBlock, { component, ModsDecl } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

@component({functional: true})
export default class bUp extends iBlock {
	/** @inheritDoc */
	static mods: ModsDecl = {
		hidden: [
			['true'],
			'false'
		]
	};

	/** @override */
	protected async mounted(): Promise<void> {
		await super.mounted();

		const
			{async: $a} = this;

		$a.on(document, 'scroll', () => this.setMod('hidden', !(pageYOffset > innerHeight / 3)), {
			label: $$.scroll
		});

		$a.on(this.$el, 'click', () => window.scrollTo(0, 0), {
			label: $$.up
		});
	}
}
