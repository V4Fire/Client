/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { createTestHelpers, filterEmitterResults } from 'components/base/b-virtual-scroll/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll/test/api/helpers/interface';
import type { ComponentItem, VirtualScrollState } from 'components/base/b-virtual-scroll/interface';
import type { CDPSession, Page } from 'playwright';

test.describe('<b-virtual-scroll>', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		provider: VirtualScrollTestHelpers['provider'],
		state: VirtualScrollTestHelpers['state'];

	const reset = async () => {
		await state.data.reset();
		await component.reload();
	};

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();
		await provider.responder();

		await provider.response(200, () => state.data.addData(10));
	});

	test.describe('working with memory', () => {
		test.describe('created components', () => {
			test('are destroyed after reset event', async () => {
				// ...
			});
		});

		test.describe('created nested components ', () => {
			test('are destroyed after reset event', () => {
				// ...
			});

			test('DOM nodes is removed after reset event', () => {
				// ...
			});
		});

		test.only('memory is freed after many components have been rendered and the state has been cleared', async ({page}) => {
			const
				session = await page.context().newCDPSession(page);

			await session.send('HeapProfiler.enable');
			await session.send('HeapProfiler.startSampling');

			const
				chunkSize = 10;

			console.log('before component create', await getMemoryUsage(session));

			await component
				.withDefaultPaginationProviderProps()
				.withProps({chunkSize})
				.build();

			let i = 0;

			console.log('after component create', await getMemoryUsage(session));

			await provider.unresponder();

			while (i < 10) {
				await component.waitForChildCountEqualsTo(chunkSize);
				console.log(i, 'after first chunk render', await getMemoryUsage(session));

				await component.scrollToBottom();
				await component.waitForChildCountEqualsTo(chunkSize * 2);
				console.log(i, 'after second chunk render', await getMemoryUsage(session));

				await component.scrollToBottom();
				await component.waitForChildCountEqualsTo(chunkSize * 3);
				console.log(i, 'after third chunk render', await getMemoryUsage(session));

				await component.scrollToTop();
				await reset();
				await clearMemory(session);
				await component.waitForChildCountEqualsTo(chunkSize);
				console.log(i, 'after reset after first chunk render', await getMemoryUsage(session));

				await component.scrollToBottom();
				await component.waitForChildCountEqualsTo(chunkSize * 2);
				console.log(i, 'after reset after second chunk render', await getMemoryUsage(session));

				await component.scrollToBottom();
				await component.waitForChildCountEqualsTo(chunkSize * 3);
				console.log(i, 'after reset after third chunk render', await getMemoryUsage(session));
				await reset();
				console.log(i, 'after reset and cycle done', await getMemoryUsage(session));

				i++;
			}
		});
	});

	async function getMemoryUsage(session: CDPSession) {
		// Получение данных о состоянии памяти
		const {profile} = await session.send('HeapProfiler.getSamplingProfile');
		const {samples} = profile;

		// Суммирование объема памяти в примерных значениях (байты)
		let memoryUsage = 0;
		samples.forEach((sample) => {
			memoryUsage += sample.size;
		});

		// Возвращение общего объема памяти в килобайтах
		return memoryUsage / 1024;
	}

	async function clearMemory(session: CDPSession) {
		await session.send('HeapProfiler.collectGarbage');
	}
});

