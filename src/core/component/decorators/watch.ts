/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { paramsFactory } from 'core/component/decorators/factory';
import type { DecoratorFieldWatcher, DecoratorMethodWatcher } from 'core/component/decorators/interface';

/**
 * Attaches a watcher of a component property/event to a component method or property.
 *
 * When you watch for some property changes, the handler function can take the second argument
 * that refers to the old value of a property. If the object that watching is non-primitive,
 * the old value will be cloned from the original old value to avoid the problem when we have two
 * links to the one object.
 *
 * ```typescript
 * @component()
 * class Foo extends iBlock {
 *   @field()
 *   list: Dictionary[] = [];
 *
 *   @watch('list')
 *   onListChange(value: Dictionary[], oldValue: Dictionary[]): void {
 *     // true
 *     console.log(value !== oldValue);
 *     console.log(value[0] !== oldValue[0]);
 *   }
 *
 *   // When you don't declare the second argument in a watcher,
 *   // the previous value isn't cloned
 *   @watch('list')
 *   onListChangeWithoutCloning(value: Dictionary[]): void {
 *     // true
 *     console.log(value === arguments[1]);
 *     console.log(value[0] === oldValue[0]);
 *   }
 *
 *   // When you watch a property in deep and declare the second argument
 *   // in a watcher, the previous value is cloned deeply
 *   @watch({path: 'list', deep: true})
 *   onListChangeWithDeepCloning(value: Dictionary[], oldValue: Dictionary[]): void {
 *     // true
 *     console.log(value !== oldValue);
 *     console.log(value[0] !== oldValue[0]);
 *   }
 *
 *   created() {
 *     this.list.push({});
 *     this.list[0].foo = 1;
 *   }
 * }
 * ```
 *
 * To listen an event you need to use the special delimiter ":" within a path.
 * Also, you can specify an event emitter to listen by writing a link before ":".
 * For instance:
 *
 * 1. `':onChange'` - a component will listen its own event `onChange`;
 * 2. `'localEmitter:onChange'` - a component will listen an event `onChange` from `localEmitter`;
 * 3. `'$parent.localEmitter:onChange'` - a component will listen an event `onChange` from `$parent.localEmitter`;
 * 4. `'document:scroll'` - a component will listen an event `scroll` from `window.document`.
 *
 * A link to the event emitter is taken from component properties or from the global object.
 * The empty link '' is a link to a component itself.
 *
 * Also, if you listen an event, you can manage when start to listen the event by using special characters at the
 * beginning of a path string:
 *
 * 1. `'!'` - start to listen an event on the "beforeCreate" hook, for example: `'!rootEmitter:reset'`;
 * 2. `'?'` - start to listen an event on the "mounted" hook, for example: `'?$el:click'`.
 *
 * By default, all events start to listen on the "created" hook.
 *
 * @decorator
 *
 * @example
 * ```typescript
 * @component()
 * class bExample extends iBlock {
 *   @field()
 *   foo: Dictionary = {bla: 0};
 *
 *   // Watch for changes of "foo"
 *   @watch('foo')
 *   watcher1() {
 *
 *   }
 *
 *   // Deep watch for changes of "foo"
 *   @watch({path: 'foo', deep: true}})
 *   watcher2() {
 *
 *   }
 *
 *   // Watch for changes of "foo.bla"
 *   @watch('foo.bla')
 *   watcher3() {
 *
 *   }
 *
 *   // Listen "onChange" event of a component
 *   @watch(':onChange')
 *   watcher3() {
 *
 *   }
 *
 *   // Listen "onChange" event of a component parentEmitter
 *   @watch('parentEmitter:onChange')
 *   watcher4() {
 *
 *   }
 * }
 * ```
 */
export const watch = paramsFactory<
	DecoratorFieldWatcher |
	DecoratorMethodWatcher
>(null, (watch) => ({watch}));
