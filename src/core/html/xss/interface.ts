/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Config } from 'dompurify';

export interface SanitizedOptions extends Omit<Config, 'RETURN_DOM' | 'RETURN_DOM_FRAGMENT'> {}
