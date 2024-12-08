/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';
import { build } from '@config/config';

import { concatURLs } from 'core/url';
import Component from 'tests/helpers/component';

import type bDummy from 'components/dummies/b-dummy/b-dummy';
import type pV4ComponentsDemo from 'components/pages/p-v4-components-demo/p-v4-components-demo';

/**
 * Page object: provides an API to work with `DemoPage`
 */
export default class DemoPage {
	/** {@link Page} */
	readonly page: Page;

	/**
	 * Server base URL
	 */
	readonly baseUrl: string;

	/**
	 * Page component reference.
	 */
	component?: JSHandle<pV4ComponentsDemo>;

	/**
	 * Returns the initial page name
	 */
	get pageName(): string {
		return '';
	}

	/**
	 * Name of the HTML file
	 */
	protected pageFileName: string;

	/**
	 * @param page
	 * @param baseUrl
	 */
	constructor(page: Page, baseUrl: string) {
		this.page = page;
		this.baseUrl = baseUrl;
		this.pageFileName = build.demoPage();
	}

	/**
	 * Opens a demo page
	 * @param [query] - query parameters for the URL, i.e. `a=1&b=1`
	 */
	async goto(query: string = ''): Promise<DemoPage> {
		const
			root = this.page.locator('#root-component');

		await this.page.goto(concatURLs(this.baseUrl, `${this.pageFileName}.html`) + (query.length > 0 ? `?${query}` : ''), {waitUntil: 'networkidle'});
		await root.waitFor({state: 'attached'});

		this.component = await root.evaluate((ctx) => (<DemoPage><unknown>ctx).component);

		return this;
	}

	/**
	 * Creates a new dummy component
	 */
	async createDummy(): Promise<JSHandle<bDummy>> {
		return Component.createComponent<bDummy>(this.page, 'b-dummy');
	}
}
