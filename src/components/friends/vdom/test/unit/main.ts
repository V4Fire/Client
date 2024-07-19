/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type bButton from 'components/form/b-button/b-button';

import type VDOM from 'components/friends/vdom';
import type bFriendsVDOMDummy from 'components/friends/vdom/test/b-friends-vdom-dummy/b-friends-vdom-dummy';

test.describe('friends/vdom', () => {
	const schema = {
		attrs: {
			id: 'test-dummy'
		},

		children: {
			default: {
				type: 'b-button',
				attrs: {
					id: 'test-button'
				},

				children: {
					default: 'Hello ima button'
				}
			}
		}
	};

	let
		target: JSHandle<bFriendsVDOMDummy>,

		button: JSHandle<bButton>,
		vdom: JSHandle<VDOM>,

		DUMMY_COMPONENT_ID: string;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		// Wait until the component is loaded
		await Component.waitForComponentTemplate(page, 'b-friends-vdom-dummy');

		// Get handles for the rendered components
		target = await Component.createComponent(page, 'b-friends-vdom-dummy', schema);
		button = await Component.waitForComponentByQuery(page, '#test-button');

		// Get a handle for the VDOM friend class
		vdom = await button.evaluateHandle((ctx) => ctx.vdom);

		// Extra info
		DUMMY_COMPONENT_ID = await target.evaluate((ctx) => ctx.componentId);
	});

	test.describe('`closest`', () => {
		test.describe('when the component name is provided', () => {
			test('should return the closest parent component instance', async () => {
				const res = await vdom.evaluate((ctx) => {
					const instance = ctx.closest('b-friends-vdom-dummy');
					return [instance!.componentName, instance!.componentId];
				});

				test.expect(res).toEqual([
					'b-friends-vdom-dummy',
					DUMMY_COMPONENT_ID
				]);
			});

			test('should return `null` if there is no such parent component', async () => {
				const res = await vdom.evaluate((ctx) => ctx.closest('b-unreachable-component'));
				test.expect(res).toBeNull();
			});
		});

		test.describe('when the component constructor is provided', () => {
			test('should return the closest parent component instance', async () => {
				const result = await vdom.evaluate((ctx) => {
					const
						// @ts-ignore component prop exists
						dummy = document.getElementById('test-dummy').component,
						instance = ctx.closest(dummy.componentConstructors.bFriendsVDOMDummy);

					return [instance!.componentName, instance!.componentId];
				});

				test.expect(result).toEqual([
					'b-friends-vdom-dummy',
					DUMMY_COMPONENT_ID
				]);
			});

			test('should return `null` if there is no such parent component', async () => {
				const res = await vdom.evaluate((ctx) => {
					// @ts-ignore component prop exists
					const dummy = document.getElementById('test-dummy').component;
					return ctx.closest(dummy.componentConstructors.bBottomSlide);
				});

				test.expect(res).toBeNull();
			});
		});
	});

	test.describe('`findElement`', () => {
		test('should return an element if it is a child of the provided `VNode`', async () => {
			const hasEl = await target.evaluate((ctx) => {
				const
					vNode = ctx.vdom.findElement('wrapper', Object.cast(ctx.unsafe.tmp.vnode)),
					className = 'b-friends-vdom-dummy__wrapper';

				return vNode?.el?.classList.contains(className);
			});

			test.expect(hasEl).toBeTruthy();
		});

		test('should return `null` if an element is not a child of the provided `VNode`', async () => {
			const hasEl = await target.evaluate((ctx) => ctx.vdom.findElement('unreachable', Object.cast(ctx.unsafe.tmp.vnode)));
			test.expect(hasEl).toBeNull();
		});
	});

	test.describe('`render`', () => {
		test('should render a single component when a single `VNode` is provided', async ({page}) => {
			await button.evaluate((ctx) => {
				const newButton = ctx.vdom.render(ctx.vdom.create('b-button', {
					attrs: {
						'v-attrs': {
							id: 'new-button'
						}
					}
				}));

				document.body.appendChild(newButton);
			});

			const
				newButton = await Component.waitForComponentByQuery(page, '#new-button'),
				newButtonComponentName = await newButton.evaluate((ctx) => ctx.componentName);

			test.expect(newButton).toBeTruthy();
			test.expect(newButtonComponentName).toBe('b-button');
		});

		test('should render multiple components when an array of `VNode`\'s is provided', async ({page}) => {
			await button.evaluate((ctx) => {
				const newButtons = ctx.vdom.render([
					ctx.vdom.create('b-button', {
						attrs: {
							'v-attrs': {
								id: 'new-button-1'
							}
						}
					}),

					ctx.vdom.create('b-button', {
						attrs: {
							'v-attrs': {
								id: 'new-button-2'
							}
						}
					})
				]);

				document.body.append(...newButtons);
			});

			const [button1, button2] = await Promise.all([
				Component.waitForComponentByQuery(page, '#new-button-1'),
				Component.waitForComponentByQuery(page, '#new-button-2')
			]);

			const [button1ComponentName, button2ComponentName] = await Promise.all([
				button1.evaluate((ctx) => ctx.componentName),
				button2.evaluate((ctx) => ctx.componentName)
			]);

			test.expect(button1ComponentName).toBe('b-button');
			test.expect(button2ComponentName).toBe('b-button');
		});
	});

	test.describe('`getRenderFactory`', () => {
		test('should return a render function if the specified template exists', async () => {
			const isRenderFn = await vdom.evaluate((ctx) => {
				const renderFn = ctx.getRenderFactory('b-button.index');
				return Object.isFunction(renderFn) && renderFn.length === 2;
			});

			test.expect(isRenderFn).toBeTruthy();
		});

		test('should return `undefined` if the specified template does not exist', async () => {
			const hasRenderFn = await vdom.evaluate((ctx) =>
				ctx.getRenderFactory('b-button.unreachableTemplate') != null);

			test.expect(hasRenderFn).toBeFalsy();
		});
	});

	test.describe('`getRenderFn`', () => {
		test('should return a vnode if the provided template exists', async () => {
			const res = await target.evaluate((ctx) => {
				const vnode = ctx.unsafe.$withCtx(() => ctx.vdom.getRenderFn('bButton.index')());
				return !Object.isArray(vnode) && vnode.type === 'span';
			});

			test.expect(res).toBe(true);
		});

		test('should return a placeholder if the provided template does not exist', async () => {
			const isPlaceholder = await vdom.evaluate((ctx) => {
				const result = ctx.getRenderFn('bUnreachable.index')();
				if (Array.isArray(result)) {
					return false;
				}

				return result.children === 'loopback';
			});

			test.expect(isPlaceholder).toBeTruthy();
		});
	});
});
