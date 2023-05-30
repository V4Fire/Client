/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import BrowserHistory from 'core/router/engines/browser-history';
import SSRHistory from 'core/router/engines/ssr';

export default SSR ? SSRHistory : BrowserHistory;
