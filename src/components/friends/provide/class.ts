/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';
import type iBlock from 'components/super/i-block/i-block';

import * as names from 'components/friends/provide/names';
import * as classes from 'components/friends/provide/classes';
import * as mods from 'components/friends/provide/mods';

import { elementClassesCache } from 'components/friends/provide/const';

interface Provide {
	fullComponentName: typeof names.fullComponentName;
	fullElementName: typeof names.fullElementName;

	classes: typeof classes.classes;
	hintClasses: typeof classes.hintClasses;

	componentClasses: typeof classes.componentClasses;
	elementClasses: typeof classes.elementClasses;

	mods: typeof mods.mods;
}

class Provide extends Friend {
	constructor(component: iBlock) {
		super(component);

		this.ctx.meta.hooks.beforeDestroy.push({
			fn: () => delete elementClassesCache[this.componentId]
		});
	}
}

Provide.addToPrototype(names, classes, mods);

export default Provide;
