/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/pages/p-v4-components-demo/README.md]]
 * @packageDocumentation
 */

import iStaticPage, { component, hook } from 'components/super/i-static-page/i-static-page';
import VDOM, * as VDOMAPI from 'components/friends/vdom';
import State, { initFromRouter } from 'components/friends/state';

export * from 'components/super/i-static-page/i-static-page';

VDOM.addToPrototype(VDOMAPI);
State.addToPrototype({initFromRouter});

/**
 * This page is used for synchronous tests
 */
@component({root: true})
export default class pV4SyncTestPage extends iStaticPage {
	@hook('beforeCreate')
	setStageFromLocation(): void {
		const matches = /stage=(.*)/.exec(globalThis.location.search);

		if (matches != null) {
			this.stage = decodeURIComponent(matches[1]);
		}
	}
}
