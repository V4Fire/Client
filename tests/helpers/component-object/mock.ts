/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import type iBlock from 'components/super/i-block/i-block';

import ComponentObjectBuilder from 'tests/helpers/component-object/builder';
import { createSpy, createMockFn, getSpy } from 'tests/helpers/mock';

import type { SpyOptions } from 'tests/helpers/component-object/interface';
import type { SpyExtractor, SpyObject } from 'tests/helpers/mock/interface';

/**
 * The {@link ComponentObjectMock} class extends the {@link ComponentObjectBuilder} class
 * and provides additional methods for creating spies and mock functions.
 *
 * It is used for testing components in a mock environment.
 */
export default abstract class ComponentObjectMock<COMPONENT extends iBlock> extends ComponentObjectBuilder<COMPONENT> {
	/**
	 * Creates a spy to observe calls to the specified method.
	 *
	 * @param path - the path to the method relative to the context (component).
	 * The {@link Object.get} method is used for searching, so you can use a complex path with separators.
	 *
	 * @param spyOptions - options for setting up the spy.
	 * @param spyOptions.proto - if set to `true`, the spy will be installed on the prototype of the component class.
	 * In this case, you don't need to add `prototype` to the `path`; it will be added automatically.
	 *
	 * @returns A promise that resolves to the spy object.
	 *
	 * @example
	 * ```typescript
	 * const
	 *   component = new ComponentObject(page, 'b-virtual-scroll'),
	 *   spy = await component.spyOn('initLoad', {proto: true}); // Installs a spy on the prototype of the component class
	 *
	 * await component.build();
	 * console.log(await spy.calls);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * const component = new ComponentObject(page, 'b-virtual-scroll');
	 * const spy = await component.spyOn('someModule.someMethod');
	 *
	 * await component.build();
	 * console.log(await spy.calls);
	 * ```
	 */
	async spyOn(path: string, spyOptions?: SpyOptions): Promise<SpyObject> {
		const evaluateArgs = <const>[path, spyOptions];
		const ctx = await (spyOptions?.proto ? this.getComponentClass() : this.component);

		const instance = await createSpy(ctx, (ctx, [path, spyOptions]) => {
			if (spyOptions?.proto === true) {
				path = `prototype.${path}`;
			}

			const
				pathArray = path.split('.'),
				method = <string>pathArray.pop(),
				obj = pathArray.length >= 1 ? Object.get<object>(ctx, pathArray.join('.')) : ctx;

			if (!obj) {
				throw new ReferenceError(`Cannot find object by the provided path: ${path}`);
			}

			return jestMock.spy(<any>obj, method);
		}, evaluateArgs);

		return instance;
	}

	/**
	 * Extracts the spy using the provided function. The provided function should return a reference to the spy.
	 *
	 * @param spyExtractor - the function that extracts the spy.
	 * @returns A promise that resolves to the spy object.
	 *
	 * @example
	 * ```typescript
	 * await component.withProps({
	 *   '@hook:beforeDataCreate': (ctx) => jestMock.spy(ctx.localEmitter, 'emit')
	 * });
	 *
	 * await component.build();
	 *
	 * const
	 *   spy = await component.getSpy((ctx) => ctx.localEmitter.emit);
	 *
	 * console.log(await spy.calls);
	 * ```
	 */
	async getSpy(spyExtractor: SpyExtractor<COMPONENT, []>): Promise<SpyObject> {
		return getSpy(await this.component, spyExtractor);
	}

	/**
	 * Creates a mock function.
	 *
	 * @param fn - the mock function.
	 * @param args - arguments to pass to the mock function.
	 *
	 * @returns A promise that resolves to the mock function object.
	 *
	 * @example
	 * ```typescript
	 * const
	 *   component = new ComponentObject(page, 'b-virtual-scroll'),
	 *   shouldStopRequestingData = await component.mockFn(() => false);
	 *
	 * await component.withProps({
	 *   shouldStopRequestingData
	 * });
	 *
	 * await component.build();
	 * console.log(await shouldStopRequestingData.calls);
	 * ```
	 */
	async mockFn<
		FN extends (...args: any[]) => any = (...args: any[]) => any
	>(fn?: FN, ...args: any[]): Promise<SpyObject> {
		fn ??= Object.cast(() => undefined);

		return createMockFn(this.pwPage, fn!, ...args);
	}
}
