/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'components/super/i-block/i-block';

import type { SpyObject, SpyOptions } from 'tests/helpers/component-object/interface';
import { createAndDisposeMock, spy } from 'tests/helpers/mock';
import { setSerializerAsMockFn } from 'core/prelude/test-env/components/json';
import ComponentObjectInitializer from 'tests/helpers/component-object/initializer';
import type { SpyCtor } from 'tests/helpers/mock/interface';

export default class ComponentObjectMock<COMPONENT extends iBlock> extends ComponentObjectInitializer<COMPONENT> {

	/**
	 * Creates a spy for the specified path
	 *
	 * @param path
	 * @param spyOptions
	 *
	 * Sets a spy to the `component instance`:
	 *
	 * @example
	 * ```typescript
	 * const builder = new ComponentBuilder(page, 'b-component');
	 * builder.spyOn('initLoad');
	 * await builder.build();
	 *
	 * const
	 *   calls = await builder.spies.initLoad.calls,
	 *   lastCall = await builder.spies.initLoad.lastCall;
	 * ```
	 *
	 * Sets a spy to the `prototype`:
	 *
	 * @example
	 * ```typescript
	 * const builder = new ComponentBuilder(page, 'b-component');
	 * builder.spyOn('initLoad', {proto: true});
	 * await builder.build();
	 *
	 * const
	 *   calls = await builder.spies.initLoad.calls,
	 *   lastCall = await builder.spies.initLoad.lastCall;
	 * ```
	 */
	async spyOn(path: string, spyOptions?: SpyOptions): Promise<SpyObject> {
		const
			evaluateArgs = <const>[path, spyOptions],
			ctx = spyOptions?.proto ? await this.getComponentClass() : this.component;

		const instance = await spy(ctx, (ctx, [path, spyOptions]) => {
			if (spyOptions?.proto === true) {
				path = `prototype.${path}`;
			}

			const
				pathArray = path.split('.'),
				method = <string>pathArray.pop();

			const
				obj = pathArray.length >= 1 ? Object.get<object>(ctx, pathArray.join('.')) : ctx;

			if (!obj) {
				throw new ReferenceError(`Cannot find object by the provided path: ${path}`);
			}

			return jest.spy(
				<any>obj,
				method
			);
		}, evaluateArgs);

		return instance;
	}

	async getSpy(spyFinder: SpyCtor<COMPONENT, []>): Promise<SpyObject> {
		return spy(this.component, spyFinder);
	}

	/**
	 * Creates a mock function
	 * @param paths
	 *
	 * @example
	 * ```typescript
	 * const builder = new ComponentBuilder(page, 'b-component');
	 * builder.mock({initLoad: builder.mockFn()});
	 * await builder.build();
	 *
	 * const
	 *   calls = await builder.mocks.initLoad.calls,
	 *   lastCall = await builder.mocks.initLoad.lastCall;
	 *
	 * await builder.mocks.initLoad.implementation(() => 123);
	 * const result = await builder.component.evaluate((ctx) => ctx.initLoad());
	 * console.log(result) // 123;
	 * ```
	 *
	 * Mock the prototype function
	 *
	 * @example
	 * ```typescript
	 * const builder = new ComponentBuilder(page, 'b-component');
	 *
	 * builder.mock({
	 *   initLoad: {
	 *     fn: builder.mockFn(),
	 *     proto: true
	 *   }
	 * });
	 *
	 * await builder.build();
	 * ```
	 *
	 * > Notice that the implementation will be provided into browser,
	 * this imposes some restrictions, such as not being able to use a closure
	 */
	async mockFn<
		FN extends (...args: any[]) => any = (...args: any[]) => any
	>(fn?: FN, ...args: any[]): Promise<SpyObject> {
		fn ??= Object.cast(() => undefined);

		const
			{agent, id} = await createAndDisposeMock(this.page, fn!, ...args);

		return setSerializerAsMockFn(agent, id);
	}
}
