/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';

import type iBlock from 'components/super/i-block/i-block';
import type { Classes, ModsDict, ModsProp } from 'components/super/i-block/i-block';

import * as api from 'components/friends/provide/api';

import type { Mods } from 'components/friends/provide/interface';

//#if runtime has dummyComponents
import('components/friends/provide/test/b-friends-provide-dummy');
//#endif

interface Provide {
	fullComponentName(): string;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	fullComponentName(modName: string, modValue: unknown): string;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	fullComponentName(componentName: string): string;
	fullComponentName(componentName: string, modName: string, modValue: unknown): string;

	fullElementName(elName: string): string;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	fullElementName(elName: string, modName: string, modValue: unknown): string;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	fullElementName(componentName: string, elName: string): string;
	fullElementName(componentName: string, elName: string, modName: string, modValue: unknown): string;

	classes(classes: Classes): Readonly<Dictionary<string>>;
	classes(componentName: string, classes: Classes): Readonly<Dictionary<string>>;

	hintClasses(pos?: string): readonly string[];

	componentClasses(mods?: ModsProp): readonly string[];
	componentClasses(componentName: string, mods?: ModsProp): readonly string[];

	elementClasses(els: Dictionary<ModsProp>): readonly string[];
	elementClasses(componentNameOrCtx: string | iBlock, els: Dictionary<ModsProp>): readonly string[];

	mods(mods?: Mods): CanUndef<Readonly<ModsDict>>;
}

class Provide extends Friend {

}

Provide.addToPrototype(api);

export default Provide;
