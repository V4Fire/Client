/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-prevent-ssr/README.md]]
 * @packageDocumentation
 */

import iBlock, { component, field, hook } from 'components/super/i-block/i-block';

export * from 'components/super/i-block/i-block';

@component()
class bPreventSsr extends iBlock {
	/**
	 * If true, the component will render the content, passed to the default slot.
	 * Otherwise, if a fallback content is passed to the `fallback` slot, it will be rendered instead
	 */
	@field()
	protected preventRendering: boolean = true;

	/**
	 * Allows rendering of the content, passed to the default slot if the component is not in a SSR context
	 */
	@hook('mounted')
	protected async shouldRenderContent(): Promise<void> {
		if (SSR) {
			return;
		}

		await this.async.nextTick();

		this.preventRendering = false;
	}
}

export default bPreventSsr;
