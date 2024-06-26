/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ConsoleMessage } from '@playwright/test';

export type MessageFilters = Record<string, null | ((msg: ConsoleMessage) => CanPromise<string>)>;
