/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { derive } from 'components/traits';

import bDummy, { component, hook, wait } from 'components/dummies/b-dummy/b-dummy';
import iObserveDOM from 'components/traits/i-observe-dom/i-observe-dom';

export * from 'components/dummies/b-dummy/b-dummy';

interface bTraitsIObserveDOMDummy extends Trait<typeof iObserveDOM> {}

@component()
@derive(iObserveDOM)
class bTraitsIObserveDOMDummy extends bDummy {
	/** {@link iObserveDOM.initDOMObservers} */
	@hook('mounted')
	@wait('ready')
	initDOMObservers(): void {
		this.observeAPI.observe(this, {
			node: this.$el!,
			childList: true,
			subtree: true
		});
	}

	get observeAPI(): typeof iObserveDOM {
		return iObserveDOM;
	}
}

export default bTraitsIObserveDOMDummy;
