/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import History from 'traits/i-history/modules/history';

export default abstract class iHistory extends iBlock {
	abstract history: History<iHistory>;
}
