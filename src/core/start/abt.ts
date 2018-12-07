/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import semaphore from 'core/start/semaphore';
import state from 'core/component/state';
import saveABT from 'core/abt';

export default (() => {
	saveABT(state.env);
	semaphore('ABTReady');
})();
