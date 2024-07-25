/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { build } from '@config/config';

import DemoPage from 'components/pages/p-v4-components-demo/test/api/page';
import { Page } from 'playwright';

/**
 * Page object: provides an API to work with `SyncTestPage`
 */
export default class SyncTestPage extends DemoPage {
	constructor(page: Page, baseUrl: string) {
		super(page, baseUrl);

		this.pageFileName = build.syncTestPage();
	}
}
