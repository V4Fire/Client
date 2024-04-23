/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { derive } from 'core/functools/trait';

import bDummy, { component, hook } from 'components/dummies/b-dummy/b-dummy';
import iLockPageScroll from 'components/traits/i-lock-page-scroll/i-lock-page-scroll';

export * from 'components/dummies/b-dummy/b-dummy';

interface bTraitsILockPageScrollDummy extends Trait<typeof iLockPageScroll> {}

@component()
@derive(iLockPageScroll)
class bTraitsILockPageScrollDummy extends bDummy {
	/** {@link iLockPageScroll.prototype.unlockPageScrollOnDestroy} */
	@hook('beforeCreate')
	unlockPageScrollOnDestroy(): void {
		iLockPageScroll.unlockPageScrollOnDestroy(this);
	}
}

export default bTraitsILockPageScrollDummy;
