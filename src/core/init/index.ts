/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/init/README.md]]
 * @packageDocumentation
 */

import 'core/init/state';
import 'core/init/abt';
import 'core/init/prefetch';

import semaphore from '@src/core/init/semaphore';
import { resolveAfterDOMLoaded } from '@src/core/event';

export default resolveAfterDOMLoaded().then(() => semaphore('domReady'));
