/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { component, ComponentInterface } from 'core/component';
import type { Module } from 'friends/module-loader';

import type { ModsProp } from 'super/i-block/modules/mods';
import { prop, DecoratorMethodWatcher } from 'super/i-block/modules/decorators';

import type { Stage } from 'super/i-block/interface';

@component()
export default abstract class iBlockProps extends ComponentInterface {
	/**
	 * The unique or global name of the component.
	 * Used to synchronize component data with different external storages.
	 */
	@prop({type: String, required: false})
	readonly globalName?: string;

	/**
	 * The component root tag type
	 */
	@prop(String)
	readonly rootTag: string = 'div';

	/**
	 * If true, the component will log informational messages, not just errors and warnings.
	 * This option affects the messages output by the `log` method.
	 */
	@prop(Boolean)
	readonly verbose: boolean = false;

	/**
	 * A string value that specifies in which logical state the component should run.
	 *
	 * This property can be used to indicate different states of a component.
	 * For instance, we have a component that implements an image upload form. And, we have two options for this form:
	 * upload from a link or upload from a computer.
	 *
	 * Therefore, we can create two stage values: "link" and "file", in order to separate the component template into two
	 * markup options depending on the stage value.
	 */
	@prop({type: [String, Number], required: false})
	readonly stageProp?: Stage;

	@prop({type: Object, required: false})
	override readonly modsProp?: ModsProp;

	/**
	 * If true, the component is activated by default.
	 * A deactivated component won't load data from providers on initialization.
	 */
	@prop(Boolean)
	readonly activatedProp: boolean = true;

	/**
	 * If true, forced activation of handlers is enabled (only for functional components).
	 * By default, functional components do not execute activation handlers: router/storage synchronization, etc.
	 */
	@prop(Boolean)
	readonly forceActivation: boolean = false;

	/**
	 * If true, then the component will try to reload provider data on reactivation.
	 * This parameter can be useful if you are using the `keep-alive` directive in your template.
	 * For example, you have a page in keep-alive, and after returning to this page, the component will be
	 * force-rendered from the keep-alive cache, but after that, the page will silently try to reload its data.
	 */
	@prop(Boolean)
	readonly reloadOnActivation: boolean = false;

	/**
	 * If true, the component is forced to re-render on reactivation.
	 * This parameter can be useful if you are using the keep-alive directive in your template.
	 */
	@prop(Boolean)
	readonly renderOnActivation: boolean = false;

	/**
	 * A list of additional dependencies to load when the component is initializing
	 *
	 * @example
	 * ```js
	 * {
	 *   dependencies: [
	 *     {name: 'b-button', load: () => import('form/b-button')}
	 *   ]
	 * }
	 * ```
	 */
	@prop({type: Array, required: false})
	readonly dependenciesProp: Module[] = [];

	/**
	 * If true, the component is marked as a removed provider.
	 * This means that the parent component will wait for the current component to load.
	 */
	@prop(Boolean)
	readonly remoteProvider: boolean = false;

	/**
	 * If true, the component will skip waiting for remote providers to avoid redundant re-rendering.
	 * This prop can help optimize your non-functional component when it does not contain any remote providers.
	 * By default, this prop is automatically calculated based on component dependencies.
	 */
	@prop({type: Boolean, required: false})
	readonly dontWaitRemoteProvidersProp?: boolean;

	/**
	 * If true, the component will listen to the `callChild` special event on its parent.
	 * The event handler will receive as a payload an object that implements the `CallChild` interface.
	 *
	 * ```typescript
	 * interface CallChild<CTX extends iBlock = iBlock> {
	 *   check: [ParentMessageProperty, unknown];
	 *   action(ctx: CTX): Function;
	 * }
	 *
	 * export type ParentMessageProperty =
	 *   'instanceOf' |
	 *   'globalName' |
	 *   'componentName' |
	 *   'componentId';
	 * ```
	 *
	 * The `check` property allows you to specify which components should handle this event.
	 * If the check is successful, then the `action` method will be called with the handler component context as
	 * an argument.
	 *
	 * @example
	 * ```js
	 * // Reload all child iData components
	 * this.emit('callChild', {
	 *   check: ['instanceOf', iData],
	 *   action: (ctx) => ctx.reload()
	 * });
	 * ```
	 */
	@prop(Boolean)
	readonly proxyCall: boolean = false;

	/**
	 * If true, the component state will be synchronized with the router after initializing.
	 * For example, you have a component that uses the `syncRouterState` method to create two-way binding with the router.
	 *
	 * ```typescript
	 * @component()
	 * class Foo {
	 *   @field()
	 *   stage: string = 'defaultStage';
	 *
	 *   syncRouterState(data?: Dictionary) {
	 *     // This notation means that if there is a value within `route.query`
	 *     // it will be mapped to the component as `stage`.
	 *     // If the route has been changed, the mapping is repeated.
	 *     // Also, if the `stage` field of the component has been changed,
	 *     // it will be mapped to the router query parameters as `stage` by using `router.push`.
	 *     return {stage: data?.stage || this.stage};
	 *   }
	 * }
	 * ```
	 *
	 * But, if in some cases we don't have `stage` in `route.query`, and the component has a default value,
	 * we trap in a situation where there is a route that has not been synchronized with the component.
	 * This can affect the "back" navigation logic. Sometimes this behavior does not meet our expectations.
	 * But if we switch `syncRouterStoreOnInit` to true, the component will force its state to be synchronized with
	 * the router after initialization.
	 */
	@prop(Boolean)
	readonly syncRouterStoreOnInit: boolean = false;

	/**
	 * A dictionary with remote component watchers.
	 * The use of this mechanism is similar to the `@watch` decorator:
	 *   1. As a key, we declare the component method name we want to call;
	 *   2. As a value, we declare the property path or event that we want to watch or listen to.
	 *      Also, the method can take additional observation parameters.
	 *      Keep in mind that properties or events are taken from the component that contains the current one.
	 *
	 * @see [[iBlock.watch]]
	 * @example
	 * ```js
	 * // We have two components: A and B.
	 * // We want to declare that component B must call its own `reload` method on an event from component A.
	 *
	 * {
	 *   // If we want to listen for events, we should use the ":" syntax.
	 *   // Also, we can provide a different event emitter as `link:`,
	 *   // for instance, `document:scroll`
	 *   reload: ':foo'
	 * }
	 * ```
	 *
	 * @example
	 * ```js
	 * // We can attach multiple watchers for one method
	 *
	 * {
	 *   reload: [
	 *     // Listens the `foo` event from `A`
	 *     ':foo',
	 *
	 *     // Watches for changes to the `A.bla` property
	 *     'bla',
	 *
	 *     // Listens the `window.document` `scroll` event,
	 *     // does not provide event arguments to `reload`
	 *     {
	 *       path: 'document:scroll',
	 *       provideArgs: false
	 *     }
	 *   ]
	 * }
	 * ```
	 */
	@prop({type: Object, required: false})
	readonly watchProp?: Dictionary<DecoratorMethodWatcher>;

	/**
	 * If true, then the component event dispatching mode is enabled.
	 *
	 * This means that all component events will bubble up to the parent component:
	 * if the parent also has this property set to true, then events will bubble up to the next (from the hierarchy)
	 * parent component.
	 *
	 * All dispatched events have special prefixes to avoid collisions with events from other components.
	 * For example: bButton `click` will bubble up as `b-button::click`.
	 * Or if the component has the `globalName` prop, it will additionally bubble up as `${globalName}::click`.
	 */
	@prop(Boolean)
	readonly dispatching: boolean = false;

	/**
	 * If true, then all events that are bubbled up by child components will be fired as the component own events
	 * without any prefixes
	 */
	@prop(Boolean)
	readonly selfDispatching: boolean = false;

	/**
	 * Additional component parameters.
	 * This parameter can be useful if you need to provide some unstructured additional parameters to a component.
	 */
	@prop({type: Object, required: false})
	readonly p?: Dictionary;

	@prop({type: Object, required: false})
	override readonly classes?: Dictionary<CanArray<string>>;

	@prop({type: Object, required: false})
	override readonly styles?: Dictionary<CanArray<string> | Dictionary<string>>;

	/**
	 * Link to the `i18n` function that will be used to localize string literals
	 */
	@prop(Function)
	readonly i18n: typeof i18n = i18n;
}
