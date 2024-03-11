/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { loadSession } from 'core/init/dependencies/load-session';
import { checkOnline } from 'core/init/dependencies/check-online';
import { loadedHydratedPage } from 'core/init/dependencies/loaded-hydrated-page';
import { whenDOMLoaded } from 'core/init/dependencies/when-dom-loaded';

export * from 'core/init/dependencies/helpers';
export * from 'core/init/dependencies/interface';

export default {
	loadSession,
	checkOnline,
	loadedHydratedPage,
	whenDOMLoaded
};
