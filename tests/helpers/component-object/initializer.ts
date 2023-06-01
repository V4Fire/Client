/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'components/super/i-block/i-block';
import ComponentObjectBuilder from 'tests/helpers/component-object/builder';

interface _InitializerFunction<C extends iBlock, ARGS extends any[] = any[]> {
	(ctx: C, ...args: ARGS): unknown;
}

export default class ComponentObjectInitializer<COMPONENT extends iBlock> extends ComponentObjectBuilder<COMPONENT> {
	// TODO: Implement or destroy
}

/**
 * Почему такая странная схема с инициализацией:
 *
 * Все проблемы из-за за замыканий,
 * допустим у нас метод который на вход принимает путь на который надо установить spy и хук на который это сделать
 *
 * ```typescript
 * async spyOn(path: string, spyOptions: {hook: string}): Promise<void>
 * ```
 *
 * Пытаемся сделать реализацию:
 *
 * ```typescript
 * async spyOn(path: string, spyOptions: {hook: string}): Promise<void> {
 *   this.setProps({
 *     [`@componentHook:${hook}`]: (ctx) => jest.spy(ctx, path)
 *   })
 * }
 * ```
 *
 * Ииии падаем с ошибкой во время выполнения Reference error path is not defined так как функция
 * будет передана в браузера
 */

  // Expose function for pushing messages to the Node.js script.
//   const log = [];
//   await page.exposeFunction('logCall', msg => log.push(msg));
