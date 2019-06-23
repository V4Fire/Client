/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import 'core/init/state';
import 'core/init/abt';

import semaphore from 'core/init/semaphore';
import { whenDomLoaded } from 'core/event';

export default whenDomLoaded(() => {
	semaphore('domReady');
});
