/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import { concatURLs } from 'core/url';
import Component from 'tests/helpers/component';

import type bDummy from 'dummies/b-dummy/b-dummy';

/**
 * Page object: provides an API to work with `DemoPage`
 */
export default class DemoPage {

	/** @see [[Page]] */
	readonly page: Page;

	/**
	 * Server base url
	 */
	readonly baseUrl: string;

	/**
	 * @param page
	 */
	constructor(page: Page, baseUrl: string) {
		this.page = page;
		this.baseUrl = baseUrl;
	}

	/**
	 * Opens a demo page
	 */
	async goto(): Promise<DemoPage> {
		await this.page.goto(concatURLs(this.baseUrl, 'p-v4-components-demo.html'), {waitUntil: 'networkidle'});
		await this.page.waitForSelector('#root-component', {state: 'attached'});

		return this;
	}

	/**
	 * Creates a new dummy component
	 */
	async getDummy(): Promise<JSHandle<bDummy>> {
		return Component.createComponent<bDummy>(this.page, 'b-dummy');
	}
}
