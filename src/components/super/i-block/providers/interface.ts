/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Provider from 'core/data';

export type DataProviderProp = string | Provider | typeof Provider | (() => Provider | typeof Provider);
