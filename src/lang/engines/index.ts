/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import inlineHTML from 'lang/engines/inline-html';
import context from 'lang/engines/context';

export default SSR ? context : inlineHTML;
