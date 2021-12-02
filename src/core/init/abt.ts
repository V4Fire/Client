/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import semaphore from '@src/core/init/semaphore';

export default (() => semaphore('ABTReady'))();
