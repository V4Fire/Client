/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';
import type iBlock from 'components/super/i-block/i-block';

import * as api from 'components/friends/provide/api';
import { elementClassesCache } from 'components/friends/provide/const';

interface Provide {
	fullComponentName: typeof api.fullComponentName;
	fullElementName: typeof api.fullElementName;

	classes: typeof api.classes;
	hintClasses: typeof api.hintClasses;

	componentClasses: typeof api.componentClasses;
	elementClasses: typeof api.elementClasses;

	mods: typeof api.mods;
}

class Provide extends Friend {
	constructor(component: iBlock) {
		super(component);

		this.ctx.meta.hooks.beforeDestroy.push({
			fn: () => delete elementClassesCache[this.componentId]
		});
	}
}

Provide.addToPrototype(api);

export default Provide;
