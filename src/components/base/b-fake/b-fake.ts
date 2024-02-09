/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { component } from 'components/super/i-block/i-block';
import AsyncRender, { waitForceRender } from 'components/friends/async-render';

export * from 'components/super/i-block/i-block';

AsyncRender.addToPrototype({waitForceRender});

@component({functional: true})
export default class bFake extends iBlock {

}
