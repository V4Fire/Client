import type { JSHandle, Page } from 'playwright';

import type iPage from 'components/super/i-page/i-page';

export type EngineName = 'history' | 'in-memory';

export type InitRouter = (page: Page, initOptions?: InitRouterOptions) => Promise<JSHandle<iPage>>;

export interface InitRouterOptions {
	initialRoute?: string;
}

export interface RouterTestResult {
	routeChanges?: unknown[];
	queryChanges?: unknown[];
	initialQuery?: string;
	initialContent?: unknown;
	initialRouteLink?: unknown;
	routeLink?: unknown;
}
