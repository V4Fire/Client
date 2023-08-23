/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Locator, Page } from 'playwright';
import { build } from '@config/config';

import { concatURLs } from 'core/url';
import Component from 'tests/helpers/component';

import type bDummy from 'components/dummies/b-dummy/b-dummy';
import type pV4ComponentsDemo from 'components/pages/p-v4-components-demo/p-v4-components-demo';
import { expandedStringify } from 'core/prelude/test-env/components/json';

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
		const
			root = this.page.locator('#root-component');

		await this.page.goto(concatURLs(this.baseUrl, `${build.demoPage()}.html`), {waitUntil: 'networkidle'});
		await root.waitFor({state: 'attached'});

		this.component = await root.evaluateHandle((ctx) => ctx.component);

		return this;
	}

	/**
	 * Creates a new dummy component
	 */
	async createDummy(): Promise<JSHandle<bDummy>> {
		return Component.createComponent<bDummy>(this.page, 'b-dummy');
	}

	/**
	 * Renders a test component with the specified parameters on the page.
	 *
	 * Unlike {@link Component.createComponent}, the component is already present in the page template,
	 * which means it depends on the context of the page and can react to changes in reactive properties of its parents.
	 *
	 * Using a test component that is already embedded in the template can be useful when you need to test the component's
	 * reaction to changes in parent properties that are passed as props to the component.
	 *
	 * @param name - The name of the test component.
	 * @param attrs - The attributes for the test component.
	 */
	async buildTestComponent(name: string, attrs?: Dictionary): Promise<Locator> {
		if (!this.component) {
			throw new ReferenceError('Missing `DemoPage` component');
		}

		const
			serializedAttrs = expandedStringify(attrs ?? {});

		await this.component.evaluate((ctx, [name, attrs]) => {
			ctx.testComponent = name;
			ctx.testComponentAttrs = globalThis.expandedParse(attrs);
		}, <const>[name, serializedAttrs]);

		return this.page.locator('#testComponent');
	}

	/**
	 * Updates the state of the test component.
	 * @param attrs
	 */
	async updateTestComponent(attrs?: Dictionary): Promise<void> {
		if (!this.component) {
			throw new ReferenceError('Missing `DemoPage` component');
		}

		const
			serializedAttrs = expandedStringify(attrs ?? {});

		return this.component.evaluate((ctx, [attrs]) => {
			Object.assign(ctx.testComponentAttrs, globalThis.expandedParse(attrs));
		}, [serializedAttrs]);
	}
}
