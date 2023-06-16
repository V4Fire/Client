/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default abstract class AssertBase {
	/**
	 * @param page
	 */
	static setPage(page: Page): typeof AssertBase {
		this.page = page;
		return this;
	}

	static unsetPage(): void {
		this.page = undefined;
	}

	protected static page: Page | undefined;
}
