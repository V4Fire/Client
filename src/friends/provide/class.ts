/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'friends/friend';
import type iBlock from 'super/i-block/i-block';

import * as names from 'friends/provide/names';
import * as classes from 'friends/provide/classes';
import * as mods from 'friends/provide/mods';

import { elementClassesCache } from 'friends/provide/const';

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
