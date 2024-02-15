/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { StaticRoutes } from 'components/base/b-router/b-router';

export default <StaticRoutes>{
	page1: {
		component: 'p-v4-dynamic-page1',
		path: 'page1',
		default: true
	},
	page2: {
		component: 'p-v4-dynamic-page2',
		path: 'page2'
	},
	page3: {
		component: 'p-v4-dynamic-page3',
		path: 'page3'
	}
};
