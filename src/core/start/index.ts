/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import 'core/start/state';
import semaphore from 'core/start/semaphore';
import { whenDomLoaded } from 'core/event';

whenDomLoaded(() => {
	semaphore('domReady');
});
