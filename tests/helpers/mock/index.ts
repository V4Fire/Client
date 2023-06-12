/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ModuleMocker } from 'jest-mock';
import type { JSHandle, Page } from 'playwright';
import type { SpyObject, SyncSpyObject } from 'tests/helpers/component-object/interface';
import type { ExtractFromJSHandle } from 'tests/helpers/mock/interface';

export function wrapAsSpy<T extends object>(agent: JSHandle<ReturnType<ModuleMocker['fn']> | ReturnType<ModuleMocker['spyOn']>>, obj: T): T & SpyObject {
	Object.defineProperties(obj, {
		calls: {
			get: () => agent.evaluate((ctx) => ctx.mock.calls)
		},

		callsLength: {
			get: () => agent.evaluate((ctx) => ctx.mock.calls.length)
		},

		lastCall: {
			get: () => agent.evaluate((ctx) => ctx.mock.calls[ctx.mock.calls.length - 1])
		},

		results: {
			get: () => agent.evaluate((ctx) => ctx.mock.results)
		},

		compile: {
			value: async () => {
				const [
					calls,
					lastCall,
					callsLength
				] = await agent.evaluate((ctx) => [
					ctx.mock.calls,
					ctx.mock.lastCall,
					ctx.mock.calls.length
				]);

				return <SyncSpyObject>{
					calls,
					lastCall,
					callsLength,
					compile: (<SpyObject>obj).compile.bind(obj)
				};
			}
		}
	});

	return <T & SpyObject>obj;
}

export async function spy<T extends JSHandle, ARGS extends any[]>(
	ctx: T,
	spyCtor: (ctx: ExtractFromJSHandle<T>, ...args: ARGS) => ReturnType<ModuleMocker['spyOn']>,
	...argsToCtor: ARGS
): Promise<SpyObject> {
	const
		agent = await ctx.evaluateHandle<ReturnType<ModuleMocker['spyOn']>>(<any>spyCtor, ...argsToCtor);

	return wrapAsSpy(agent, {});
}

export async function createAndDisposeMock(
	page: Page,
	fn: (...args: any[]) => any,
	...args: any[]
): Promise<{agent: SpyObject; id: string}> {
	const
		tmpFn = `tmp_${Math.random().toString()}`;

	const agent = await page.evaluateHandle(([tmpFn, fnString, args]) =>
		// eslint-disable-next-line no-new-func
		globalThis[tmpFn] = jest.mock((...fnArgs) => Object.cast(new Function(`return ${fnString}`)()(...fnArgs, ...args))), <const>[tmpFn, fn.toString(), args]);

	return {agent: wrapAsSpy(agent, {}), id: tmpFn};
}
