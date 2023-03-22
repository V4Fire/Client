import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';
import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import BOM from 'tests/helpers/bom';

test.use({
	actionTimeout: 0
});

test.describe('b-scrolly rendering', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	['pushToListCreateElement', 'pushToList', 'updateList'].forEach((method) => {
		test(`b-scrolly perf ${method}`, async ({page, browser, context}) => {
			const scrolly = await Component.createComponent<bScrolly>(page, 'b-scrolly', {
				children: {
					default: ({item}) => item.id
				}
			});

			await page.pause();

			const client = await context.newCDPSession(page);
			await client.send('Emulation.setCPUThrottlingRate', {rate: 8});

			await browser.startTracing(page, {path: `${method}.json`});

			await page.evaluate(() => performance.mark('YOLO'));
			await page.evaluate(([method]) => globalThis.method = method, [method]);

			await scrolly.evaluate((c) => c[globalThis.method](100));
			await BOM.waitForIdleCallback(page);
			await scrolly.evaluate((c) => c[globalThis.method](100));
			await BOM.waitForIdleCallback(page);
			await scrolly.evaluate((c) => c[globalThis.method](500));
			await BOM.waitForIdleCallback(page);
			await scrolly.evaluate((c) => c[globalThis.method](500));
			await BOM.waitForIdleCallback(page);
			await scrolly.evaluate((c) => c[globalThis.method](500));

			await browser.stopTracing();
		});
	});
});
