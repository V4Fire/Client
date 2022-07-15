/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'friends/friend';

import * as names from 'friends/provide/names';
import * as classes from 'friends/provide/classes';
import * as mods from 'friends/provide/mods';

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

}

Provide.addToPrototype(names, classes, mods);

export default Provide;
