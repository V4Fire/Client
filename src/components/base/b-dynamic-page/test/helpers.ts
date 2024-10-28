/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import { Component } from 'tests/helpers';

import type iDynamicPage from 'components/super/i-dynamic-page/i-dynamic-page';
import type bDynamicPage from 'components/base/b-dynamic-page/b-dynamic-page';

export const enum Pages {
	DYNAMIC_1 = 'p-v4-dynamic-page1',
	DYNAMIC_2 = 'p-v4-dynamic-page2',
	DYNAMIC_3 = 'p-v4-dynamic-page3'
}

export const enum Hooks {
	MOUNTED = 'mounted',
	DESTROYED = 'destroyed',
	ACTIVATED = 'activated',
	DEACTIVATED = 'deactivated'
}

/**
 * Creates the `bRouter`, renders the `bDynamicPage` component and returns Promise<JSHandle>
 *
 * @param page
 * @param attrs
 * @param routesConfig
 */
export async function renderDynamicPage(
	page: Page,
	attrs: RenderComponentsVnodeParams['attrs'] = {},
	routesConfig?: Dictionary
): Promise<JSHandle<bDynamicPage>> {
	await Component.createComponent(page, 'b-router', {
		attrs: {
			routes: routesConfig ?? {
				page1: {
					path: '/page-1',
					component: Pages.DYNAMIC_1
				},

				page2: {
					path: '/page-2',
					component: Pages.DYNAMIC_2
				},

				page3: {
					path: '/page-3',
					component: Pages.DYNAMIC_3
				}
			}
		}
	});

	return Object.cast(Component.createComponent(page, 'b-dynamic-page', {
		attrs: {
			id: 'target',
			...attrs
		}
	}));
}

/**
 * Switches some pages and writes temporary state (pages hooks and names) in the resulting array and returns it
 * @param ctx
 */
export async function switcher(ctx: bDynamicPage): Promise<string[]> {
	const
		res: string[] = [],
		prevHookDebugString: (hook: string) => string = (hook) => `Previous component: ${hook}`;

	let
		prev: iDynamicPage,
		cur: iDynamicPage;

	await ctx.router!.push('page3');
	await ctx.router!.push('page1');
	cur = await ctx.component;

	res.push(cur.componentName);
	res.push(cur.hook);

	prev = cur;
	await ctx.router!.push('page2');
	cur = await ctx.component;

	res.push(cur.componentName);
	res.push(cur.hook);
	res.push(prevHookDebugString(prev.hook));

	prev = cur;
	await ctx.router!.push('page1');
	cur = await ctx.component;

	res.push(cur.componentName);
	res.push(cur.hook);
	res.push(prevHookDebugString(prev.hook));

	return res;
}

/**
 * Takes the hook name and returns a template string for the previous component hook
 * @param hook
 */
export const prevHookDebugString = (hook: string): string => `Previous component: ${hook}`;
