/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check
/* eslint-disable max-lines-per-function */

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers');

/** @param {Page} page */
module.exports = (page) => {
	const components = {
		renderNextWithSlot: undefined,
		renderNextNoSlot: undefined
	};

	const nodes = {
		renderNextWithSlot: undefined,
		renderNextNoSlot: undefined
	};

	const containers = {
		renderNextWithSlot: undefined,
		renderNextNoSlot: undefined
	};

	const isNotHidden = async (selector, ctx) => {
		const
			el = await ctx.$(selector),
			state = await el.evaluate((ctx) => ctx.parentNode.style.display);

		return state === '';
	};

	const
		initialTimeout = globalThis.jasmine.DEFAULT_TIMEOUT_INTERVAL;

	beforeAll(() => {
		globalThis.jasmine.DEFAULT_TIMEOUT_INTERVAL = (20).seconds();
	});

	beforeEach(async () => {
		await h.utils.reloadAndWaitForIdle(page);
		await h.component.waitForComponent(page, '#root-component');

		await page.evaluate(() => {
			const dummy = document.querySelector('#dummy-component');

			if (dummy) {
				document.querySelector('#dummy-component').remove();
			}

			globalThis.removeCreatedComponents();

			const baseAttrs = {
				theme: 'demo',
				option: 'section',
				optionProps: ({current}) => ({'data-index': current.i})
			};

			const slots = {
				renderNext: {
					tag: 'div',
					attrs: {
						id: 'renderNext',
						'data-test-ref': 'renderNext'
					}
				}
			};

			const scheme = [
				{
					attrs: {
						...baseAttrs,
						dataProvider: 'demo.Pagination',
						loadStrategy: 'manual',
						id: 'renderNextNoSlot'
					}
				},

				{
					attrs: {
						...baseAttrs,
						dataProvider: 'demo.Pagination',
						loadStrategy: 'manual',
						id: 'renderNextWithSlot'
					},

					content: {
						renderNext: slots.renderNext
					}
				}
			];

			globalThis.renderComponents('b-virtual-scroll', scheme, '.p-v4-components-demo');
		});

		await h.bom.waitForIdleCallback(page);
		await h.component.waitForComponentStatus(page, '.b-virtual-scroll', 'ready');

		const
			allComponents = await page.$$('.b-virtual-scroll');

		for (let i = 0; i < allComponents.length; i++) {
			await allComponents[i].evaluate((ctx) => ctx.style.display = 'none');
		}

		for (let keys = Object.keys(components), i = 0; i < keys.length; i++) {
			const key = keys[i];

			nodes[key] = await h.dom.waitForEl(page, `#${key}`);
			await nodes[key].evaluate((ctx) => ctx.style.display = '');
			containers[key] = await h.dom.waitForRef(nodes[key], 'container');

			// eslint-disable-next-line require-atomic-updates
			components[key] = await h.component.getComponentById(page, key);
		}

		await components.renderNextWithSlot.evaluate((ctx) => {
			ctx.dataProvider = 'demo.Pagination';
			ctx.request = {get: {}};
			ctx.shouldStopRequest = (v) => v.isLastEmpty;

			return new Promise((res) => {
				if (ctx.isReady) {
					return res();
				}

				ctx.localEmitter.on('localState.ready', res);
			});
		});

		await h.bom.waitForIdleCallback(page);
	});

	afterAll(() => {
		globalThis.jasmine.DEFAULT_TIMEOUT_INTERVAL = initialTimeout;
	});

	describe('b-virtual-scroll `renderNext` slot', () => {
		describe('not render', () => {
			it('if it is not set', async () => {
				expect(await components.renderNextNoSlot.evaluate((ctx) => Boolean(ctx.vdom.getSlot('empty')))).toBe(false);
				expect(await h.dom.getRef(nodes.renderNextNoSlot, 'empty')).toBeFalsy();
			});

			it('there are no loaded data', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dbConverter = () => ({data: []});
					ctx.request = {get: {total: 0, chunkSize: 0, id: Math.random()}};

					return new Promise((res) => {
						ctx.localEmitter.on('localState.ready', res);
					});
				});

				await h.bom.waitForIdleCallback(page);
				await h.bom.waitForRAF(page);

				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeFalse();
			});

			it('there are no data', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = undefined;
					ctx.options = [];

					return new Promise((res) => {
						ctx.localEmitter.on('localState.ready', res);
					});
				});

				await h.bom.waitForRAF(page);
				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeFalse();
			});

			it('if initial loading in progress', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.request = {get: {chunkSize: 10, sleep: 1000}};
				});

				await h.bom.waitForIdleCallback(page);
				await h.bom.waitForRAF(page);

				await expectAsync(page.waitForFunction(() => {
					const
						node = document.querySelector('#renderNext'),
						parent = node.parentElement;

					return parent.style.display === 'none';
				})).toBeResolved();
			});

			it('if the second batch of data loading in progress', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.request = {get: {total: 20, chunkSize: 10, id: Math.random(), sleep: 500}};
					ctx.chunkSize = 10;
				});

				await h.dom.waitForEl(containers.renderNextWithSlot, 'section');
				await h.scroll.scrollToBottom(page);
				await h.dom.waitForRef(nodes.renderNextWithSlot, 'renderNext');
				await components.renderNextWithSlot.evaluate((ctx) => ctx.renderNext());
				await h.bom.waitForRAF(page);

				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeFalse();
			});

			it('if all data were loaded after the initial request', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.request = {get: {total: 10, chunkSize: 10, id: Math.random()}};
					ctx.shouldStopRequest = () => true;
					ctx.chunkSize = 10;
				});

				await h.dom.waitForEl(containers.renderNextWithSlot, 'section');
				await h.bom.waitForIdleCallback(page);

				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeFalse();
			});

			it('if all data were loaded after the second batch load', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.request = {get: {total: 20, chunkSize: 10, id: Math.random(), sleep: 50}};
					ctx.shouldStopRequest = ({data}) => data.length === 20;
					ctx.chunkSize = 10;
				});

				await h.dom.waitForEl(containers.renderNextWithSlot, 'section');
				await h.dom.waitForRef(nodes.renderNextWithSlot, 'renderNext');
				await components.renderNextWithSlot.evaluate((ctx) => ctx.renderNext());

				await h.dom.waitForEl(containers.renderNextWithSlot, 'section:nth-child(11)');
				await h.bom.waitForIdleCallback(page);
				await h.bom.waitForRAF(page);

				expect(await (await nodes.renderNextWithSlot.$('#renderNext')).evaluate((ctx) => ctx.parentNode.style.display)).toBe('none');
			});

			it('if all items were rendered', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = undefined;
					ctx.chunkSize = 10;
					// @ts-ignore
					ctx.options = Array.from(Array(10), (v, i) => ({i}));
				});

				await h.dom.waitForEl(containers.renderNextWithSlot, 'section');
				await h.bom.waitForRAF(page);
				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeFalse();
			});

			it('if all items were rendered after second render', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = undefined;
					ctx.chunkSize = 10;
					ctx.options = Array.from(Array(20), (v, i) => ({i}));
				});

				await h.dom.waitForEl(containers.renderNextWithSlot, 'section');
				await h.dom.waitForRef(nodes.renderNextWithSlot, 'renderNext');
				await components.renderNextWithSlot.evaluate((ctx) => ctx.renderNext());
				await h.dom.waitForEl(containers.renderNextWithSlot, 'section:nth-child(11)');
				await h.bom.waitForIdleCallback(page);
				await h.bom.waitForRAF(page);

				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeFalse();
			});

			it('if all data were rendered and loaded', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.shouldStopRequest = ({data}) => data.length === 80;
					ctx.request = {get: {total: 80, chunkSize: 40, id: Math.random()}};
					ctx.chunkSize = 20;

					return new Promise((res) => {
						ctx.localEmitter.once('localState.ready', res);
					});
				});

				await h.dom.waitForEl(containers.renderNextWithSlot, 'section');

				let
					renders = 1;

				const
					totalRenders = 4;

				while (renders < totalRenders) {
					await h.dom.waitForRef(nodes.renderNextWithSlot, 'renderNext');
					await components.renderNextWithSlot.evaluate((ctx) => ctx.renderNext());
					await h.dom.waitForEl(containers.renderNextWithSlot, `section:nth-child(${(renders * 20) + 1})`);
					await h.bom.waitForIdleCallback(page);
					await h.bom.waitForRAF(page);

					renders++;
				}

				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeFalse();
			});

			it('if an error appears on the initial loading', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					const p = new Promise((res) => {
						ctx.watch(':onRequestError', res);
					});

					ctx.dataProvider = 'demo.Pagination';
					ctx.request = {get: {total: 20, chunkSize: 10, id: Math.random(), failOn: 0, sleep: 500}};
					ctx.chunkSize = 10;

					return p;
				});

				await h.bom.waitForIdleCallback(page);
				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeFalse();
			});

			it('if an error appears on the second data batch loading', async () => {
				const requestErrorPromise = components.renderNextWithSlot.evaluate((ctx) => new Promise((res) => {
					ctx.watch(':requestError', res);
				}));

				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.request = {get: {total: 40, chunkSize: 10, id: Math.random(), failOn: 1, sleep: 50}};
					ctx.chunkSize = 10;
				});

				await h.dom.waitForEl(containers.renderNextWithSlot, 'section');
				await h.dom.waitForRef(nodes.renderNextWithSlot, 'renderNext');

				await components.renderNextWithSlot.evaluate((ctx) => ctx.renderNext());
				await requestErrorPromise;

				await h.bom.waitForIdleCallback(page);
				await h.bom.waitForRAF(page);

				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeFalse();
			});
		});

		describe('render', () => {
			it('after initial loading', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.request = {get: {total: 20, chunkSize: 10, id: Math.random()}};
					ctx.chunkSize = 10;

					return new Promise((res) => {
						ctx.localEmitter.on('localState.ready', res);
					});
				});

				await h.bom.waitForIdleCallback(page);
				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeTrue();
			});

			it('after loading of the second data batch', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.request = {get: {total: 40, chunkSize: 10, id: Math.random()}};
					ctx.chunkSize = 10;

					return new Promise((res) => {
						ctx.localEmitter.on('localState.ready', res);
					});
				});

				await h.dom.waitForEl(containers.renderNextWithSlot, 'section');
				await h.dom.waitForRef(nodes.renderNextWithSlot, 'renderNext');
				await components.renderNextWithSlot.evaluate((ctx) => ctx.renderNext());
				await h.dom.waitForEl(containers.renderNextWithSlot, 'section:nth-child(11)');
				await h.bom.waitForIdleCallback(page);
				await h.bom.waitForRAF(page);

				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeTrue();
			});

			it('after the initial rendering with items provided', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = undefined;
					// @ts-ignore
					ctx.options = Array.from(Array(20), (v, i) => ({i}));
				});

				await h.dom.waitForEl(containers.renderNextWithSlot, 'section');
				await h.bom.waitForIdleCallback(page);

				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeTrue();
			});

			it('after the second rendering with items provided', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = undefined;
					// @ts-ignore
					ctx.options = Array.from(Array(40), (v, i) => ({i}));
				});

				await h.dom.waitForEl(containers.renderNextWithSlot, 'section');
				await h.dom.waitForRef(nodes.renderNextWithSlot, 'renderNext');
				await components.renderNextWithSlot.evaluate((ctx) => ctx.renderNext());
				await h.dom.waitForEl(containers.renderNextWithSlot, 'section:nth-child(11)');
				await h.bom.waitForRAF(page);

				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeTrue();
			});

			it('until all data are rendered', async () => {
				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.shouldStopRequest = ({data}) => data.length === 60;
					ctx.request = {get: {total: 60, chunkSize: 30, id: Math.random()}};
					ctx.chunkSize = 10;

					return new Promise((res) => {
						ctx.localEmitter.on('localState.ready', res);
					});
				});

				await h.dom.waitForEl(containers.renderNextWithSlot, 'section');

				let
					renders = 1;

				const
					totalRenders = 5;

				while (renders < totalRenders) {
					await h.dom.waitForRef(nodes.renderNextWithSlot, 'renderNext');
					await components.renderNextWithSlot.evaluate((ctx) => ctx.renderNext());
					await h.dom.waitForEl(containers.renderNextWithSlot, `section:nth-child(${(renders * 10) + 1})`);
					await h.bom.waitForRAF(page);

					expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeTrue();
					renders++;
				}
			});

			it('if there was an error on the initial loading, but after retrying all fine', async () => {
				const requestErrorPromise = components.renderNextWithSlot.evaluate((ctx) => new Promise((res) => {
					ctx.watch(':requestError', res);
				}));

				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.request = {get: {total: 40, chunkSize: 10, id: Math.random(), failOn: 0, failCount: 1, sleep: 50}};
					ctx.chunkSize = 10;
				});

				await requestErrorPromise;
				await components.renderNextWithSlot.evaluate((ctx) => ctx.reloadLast());

				await h.dom.waitForEl(containers.renderNextWithSlot, 'section');
				await h.bom.waitForRAF(page);

				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeTrue();
			});

			it('if there was an error on the second data batch loading, but after retrying all fine', async () => {
				const requestErrorPromise = components.renderNextWithSlot.evaluate((ctx) => new Promise((res) => {
					ctx.watch(':requestError', res);
				}));

				await components.renderNextWithSlot.evaluate((ctx) => {
					ctx.dataProvider = 'demo.Pagination';
					ctx.request = {get: {total: 40, chunkSize: 10, id: Math.random(), failOn: 1, failCount: 1, sleep: 50}};
					ctx.chunkSize = 10;
				});

				await h.dom.waitForEl(containers.renderNextWithSlot, 'section');

				await components.renderNextWithSlot.evaluate((ctx) => ctx.renderNext());
				await requestErrorPromise;
				await h.bom.waitForIdleCallback(page);
				await components.renderNextWithSlot.evaluate((ctx) => ctx.reloadLast());
				await h.dom.waitForEl(containers.renderNextWithSlot, 'section:nth-child(11)');
				await h.bom.waitForRAF(page);

				expect(await isNotHidden('#renderNext', nodes.renderNextWithSlot)).toBeTrue();
			});
		});
	});
};
