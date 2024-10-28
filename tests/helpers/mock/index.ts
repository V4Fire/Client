/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ModuleMocker } from 'jest-mock';
import type { JSHandle, Page } from 'playwright';

import { expandedStringify, setSerializerAsMockFn } from 'core/prelude/test-env/components/json';
import type { ExtractFromJSHandle, SpyExtractor, SpyObject } from 'tests/helpers/mock/interface';

export * from 'tests/helpers/mock/interface';

/**
 * Wraps an object as a spy object by adding additional properties for accessing spy information.
 *
 * @param agent - the JSHandle representing the spy or mock function.
 * @param obj - the object to wrap as a spy object.
 * @returns The wrapped object with spy properties.
 */
export function wrapAsSpy<T extends object>(agent: JSHandle<ReturnType<ModuleMocker['fn']> | ReturnType<ModuleMocker['spyOn']>>, obj: T): T & SpyObject {
	Object.defineProperties(obj, {
		calls: {
			get: () => agent.evaluate((ctx) => ctx.mock.calls)
		},

		handle: {
			get: () => agent
		},

		callsCount: {
			get: () => agent.evaluate((ctx) => ctx.mock.calls.length)
		},

		lastCall: {
			get: () => agent.evaluate((ctx) => ctx.mock.calls[ctx.mock.calls.length - 1])
		},

		results: {
			get: () => agent.evaluate((ctx) => ctx.mock.results)
		}
	});

	return <T & SpyObject>obj;
}

/**
 * Creates a spy object.
 *
 * @param ctx - the `JSHandle` to spy on.
 * @param spyCtor - the function that creates the spy.
 * @param argsToCtor - the arguments to pass to the spy constructor function.
 * @returns A promise that resolves to the created spy object.
 *
 * @example
 * ```typescript
 * const ctx = ...; // JSHandle to spy on
 * const spyCtor = (ctx) => jestMock.spy(ctx, 'prop'); // Spy constructor function
 * const spy = await createSpy(ctx, spyCtor);
 *
 * // Access spy properties
 * console.log(await spy.calls);
 * console.log(await spy.callsCount);
 * console.log(await spy.lastCall);
 * console.log(await spy.results);
 * ```
 */
export async function createSpy<T extends JSHandle, ARGS extends any[]>(
	ctx: T,
	spyCtor: (ctx: ExtractFromJSHandle<T>, ...args: ARGS) => ReturnType<ModuleMocker['spyOn']>,
	...argsToCtor: ARGS
): Promise<SpyObject> {
	const
		agent = await ctx.evaluateHandle<ReturnType<ModuleMocker['spyOn']>>(<any>spyCtor, ...argsToCtor);

	return wrapAsSpy(agent, {});
}

/**
 * Retrieves an existing {@link SpyObject} from a `JSHandle`.
 *
 * @param ctx - the `JSHandle` containing the spy object.
 * @param spyExtractor - the function to extract the spy object.
 * @returns A promise that resolves to the spy object.
 *
 * @example
 * ```typescript
 * const component = await Component.createComponent(page, 'b-button', {
 *   attrs: {
 *     '@hook:beforeDataCreate': (ctx) => jestMock.spy(ctx.localEmitter, 'emit')
 *   }
 * });
 *
 * const spyExtractor = (ctx) => ctx.unsafe.localEmitter.emit; // Spy extractor function
 * const spy = await getSpy(ctx, spyExtractor);
 *
 * // Access spy properties
 * console.log(await spy.calls);
 * console.log(await spy.callsCount);
 * console.log(await spy.lastCall);
 * console.log(await spy.results);
 * ```
 */
export async function getSpy<T extends JSHandle>(
	ctx: T,
	spyExtractor: SpyExtractor<ExtractFromJSHandle<T>, []>
): Promise<SpyObject> {
	return createSpy(ctx, spyExtractor);
}

/**
 * Creates a mock function and injects it into a Page object.
 *
 * @param page - the Page object to inject the mock function into.
 * @param fn - the mock function.
 * @param args - the arguments to pass to the function.
 * @returns A promise that resolves to the mock function as a {@link SpyObject}.
 *
 * @example
 * ```typescript
 * const page = ...; // Page object
 * const fn = () => {}; // The mock function
 * const mockFn = await createMockFn(page, fn);
 *
 * // Access spy properties
 * console.log(await mockFn.calls);
 * console.log(await mockFn.callsCount);
 * console.log(await mockFn.lastCall);
 * console.log(await mockFn.results);
 * ```
 */
export async function createMockFn(
	page: Page,
	fn: (...args: any[]) => any,
	...args: any[]
): Promise<SpyObject> {
	const
		{agent, id} = await injectMockIntoPage(page, fn, ...args);

	return setSerializerAsMockFn(agent, id);
}

/**
 * Injects a mock function into a Page object and returns the {@link SpyObject}.
 *
 * This function also returns the ID of the injected mock function, which is stored in `globalThis`.
 * This binding allows the function to be found during object serialization within the page context.
 *
 * @param page - the Page object to inject the mock function into.
 * @param fn - the mock function.
 * @param args - the arguments to pass to the function.
 * @returns A promise that resolves to an object containing the spy object and the ID of the injected mock function.
 *
 * @example
 * ```typescript
 * const page = ...; // Page object
 * const fn = () => {}; // The mock function
 * const { agent, id } = await injectMockIntoPage(page, fn);
 *
 * // Access spy properties
 * console.log(await agent.calls);
 * console.log(await agent.callsCount);
 * console.log(await agent.lastCall);
 * console.log(await agent.results);
 * ```
 */
async function injectMockIntoPage(
	page: Page,
	fn: (...args: any[]) => any,
	...args: any[]
): Promise<{agent: SpyObject; id: string}> {
	const
		tmpFn = `tmp_${Math.random().toString()}`,
		argsToProvide = <const>[tmpFn, fn.toString(), expandedStringify(args)];

	const agent = await page.evaluateHandle(([tmpFn, fnString, args]) =>
		globalThis[tmpFn] = jestMock.mock((...fnArgs) =>
			// eslint-disable-next-line no-new-func
			new Function(`return ${fnString}`)()(...fnArgs, ...globalThis.expandedParse(args))),
	argsToProvide);

	return {agent: wrapAsSpy(agent, {}), id: tmpFn};
}
