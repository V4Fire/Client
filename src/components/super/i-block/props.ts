/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { component, ComponentInterface } from 'core/component';
import type { Module } from 'components/friends/module-loader';

import type iBlock from 'components/super/i-block/i-block';
import type { Stage } from 'components/super/i-block/interface';

import type { ModsProp } from 'components/super/i-block/modules/mods';
import { prop, DecoratorMethodWatcher } from 'components/super/i-block/decorators';
import type { TransitionMethod } from 'components/base/b-router/interface';

@component()
export default abstract class iBlockProps extends ComponentInterface {
	@prop({type: String, required: false})
	override readonly componentIdProp?: string;

	@prop({type: String, required: false})
	override readonly globalName?: string;

	/**
	 * The component root tag type
	 */
	@prop({type: String, required: false})
	readonly rootTag?: string;

	/**
	 * If set to true, the component will log informational messages in addition to errors and warnings.
	 * This option determines the type of messages that are output by the log method.
	 */
	@prop(Boolean)
	readonly verbose: boolean = false;

	/**
	 * A string value that specifies the logical state in which the component should operate.
	 *
	 * This property can be used to indicate different stages of a component.
	 * For example, let's say we have a component that implements an image upload form.
	 * And we have two options for this form: uploading from a link or uploading from a computer.
	 *
	 * In order to differentiate between these two options and render different markups accordingly,
	 * we can create two stage values: "link" and "file".
	 * This way, we can modify the component's template based on the current stage value.
	 */
	@prop({type: [String, Number], required: false})
	readonly stageProp?: Stage;

	@prop({type: Object, required: false})
	override readonly modsProp?: ModsProp;

	/**
	 * If set to true, the component will be activated by default.
	 * A deactivated component will not retrieve data from providers during initialization.
	 */
	@prop(Boolean)
	readonly activatedProp: boolean = true;

	/**
	 * If set to true, forced activation of handlers is enabled for functional components.
	 * By default, functional components do not execute activation handlers such as router/storage synchronization.
	 */
	@prop(Boolean)
	readonly forceActivation: boolean = false;

	/**
	 * If set to true, the component will attempt to reload provider data upon reactivation.
	 * This parameter can be useful in scenarios where you are using the keep-alive directive in your template.
	 * For example, if you have a page that is cached using keep-alive, and you return to this page,
	 * the component will be rendered from the keep-alive cache.
	 * However, with this parameter enabled, the page will silently attempt to reload its data after rendering.
	 */
	@prop(Boolean)
	readonly reloadOnActivation: boolean = false;

	/**
	 * If set to true, the component will be forced to re-render upon reactivation.
	 * This parameter can be helpful when using the keep-alive directive in your template.
	 * In such cases, even if the component is rendered from the keep-alive cache,
	 * enabling this parameter will force it to re-render its template.
	 */
	@prop(Boolean)
	readonly renderOnActivation: boolean = false;

	/**
	 * An iterable object with additional component dependencies for initialization
	 *
	 * @example
	 * ```js
	 * {
	 *   dependencies: [
	 *     {name: 'b-button', load: () => import('components/form/b-button')}
	 *   ]
	 * }
	 * ```
	 */
	@prop({
		validator: (val) => val == null || Object.isIterable(val),
		required: false
	})

	readonly dependenciesProp?: Iterable<Module>;

	/**
	 * If set to false, the component will not render its content during SSR
	 */
	@prop({type: Boolean, forceDefault: true})
	readonly ssrRenderingProp: boolean = true;

	/**
	 * A promise that will block the rendering of the component until it is resolved.
	 * This should be used together with Suspense and non-functional components.
	 *
	 * @see https://vuejs.org/guide/built-ins/suspense.html#async-components
	 *
	 * @example
	 * ```
	 * < suspense
	 *   < b-popup :wait = promisifyOnce('showPopup')
	 * ```
	 */
	@prop({
		validator: Object.isPromiseLike,
		required: false
	})

	readonly wait?: Promise<unknown>;

	/**
	 * If set to true, the component is marked as a removed provider.
	 * This signifies that the parent component will wait for the current component to finish loading before proceeding.
	 */
	@prop(Boolean)
	readonly remoteProvider: boolean = false;

	/**
	 * If set to true, the component will skip waiting for remote providers to avoid redundant re-rendering.
	 * This property can be useful to optimize non-functional components that do not have any remote providers.
	 * By default, the value of this property is automatically calculated based on the component dependencies.
	 */
	@prop({type: Boolean, required: false})
	readonly dontWaitRemoteProvidersProp?: boolean;

	/**
	 * If set to true, the component state will be synchronized with the router after initialization.
	 * For example, you have a component that uses the `syncRouterState` method to create two-way binding with the router:
	 *
	 * ```typescript
	 * import iBlock, { component, field } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @field()
	 *   stage: string = 'defaultStage';
	 *
	 *   syncRouterState(data?: Dictionary) {
	 *     // This notation signifies that if there is a value within the `route.query`,
	 *     // it will be mapped to the component as stage.
	 *     // This mapping will also be repeated if the route has been changed.
	 *     // Additionally, if the stage field of the component has been modified,
	 *     // it will be mapped to the router query parameters as stage using `router.push`.
	 *     return {stage: data?.stage || this.stage};
	 *   }
	 * }
	 * ```
	 *
	 * However, in certain cases where the stage value is not present in the `route.query`,
	 * and the component has a default value for stage.
	 * We may encounter a situation where there is a route that has not been synchronized with the component.
	 * This can impact the logic for "back" navigation as it may not meet our expectations.
	 *
	 * To address this, if you set `syncRouterStateOnInit` to true,
	 * the component will force its state to be synchronized with the router after initialization.
	 * This ensures that the component's state is always in sync with the router,
	 * even if the route does not have the stage value initially.
	 * This can provide a more consistent navigation experience, especially when using "back" navigation.
	 */
	@prop(Boolean)
	readonly syncRouterStoreOnInit: boolean = false;

	/**
	 * The method that will be used for transitions when the router synchronizes
	 * its state with the component's state using {@link iBlock.syncRouterState}
	 */
	@prop(String)
	readonly routerStateUpdateMethod: Exclude<TransitionMethod, 'event'> = 'push';

	/**
	 * A dictionary with remote component watchers.
	 * Using this prop is very similar to using the @watch decorator:
	 *   1. As a key, we specify the name of the current component method we want to call.
	 *   2. As a value, we specify the property path or event that we want to watch or listen to.
	 *      We can also include additional observation parameters in the method.
	 *      It is important to note that the properties or events are taken from the component
	 *      that contains the current one.
	 *
	 * {@link iBlock.watch}
	 *
	 * @example
	 * ```js
	 * // We have two components: A and B.
	 * // We want to specify that component B should call its own reload method when an event occurs in component A.
	 *
	 * const watchProp = {
	 *   // To listen for events, we should use the ":" syntax.
	 *   // Additionally, we can specify a different event emitter using the "link:" syntax.
	 *   // For example, "document:scroll" will listen to the "scroll" event on the document.
	 *   reload: ':foo'
	 * };
	 * ```
	 *
	 * @example
	 * ```js
	 * // We can attach multiple watchers for one method
	 *
	 * const watchProp = {
	 *   reload: [
	 *     // Listens to the `foo` event from `A`
	 *     ':foo',
	 *
	 *     // Watches for changes to the `A.bla` property
	 *     'bla',
	 *
	 *     // Listens to the "scroll" event on the window.document object
	 *     // and does not provide event arguments to the reload method
	 *     {
	 *       path: 'document:scroll',
	 *       provideArgs: false
	 *     }
	 *   ]
	 * };
	 * ```
	 */
	@prop({type: Object, required: false})
	readonly watchProp?: Dictionary<DecoratorMethodWatcher>;

	/**
	 * If set to true, the component will listen for the `callChild` special event on its parent.
	 * The event handler will receive an object as the payload, which should implement the `CallChild` interface.
	 *
	 * ```typescript
	 * interface CallChild<CTX extends iBlock = iBlock> {
	 *   if(ctx: CTX): AnyToBoolean;
	 *   then(ctx: CTX): Function;
	 * }
	 * ```
	 *
	 * The `if` function allows you to specify which components should handle a particular event.
	 * If the check is successful,
	 * then the then method will be called with the handler component's context as an argument.
	 *
	 * Here's an example:
	 *
	 * @example
	 * ```js
	 * // Reload all children iData components
	 * this.emit('callChild', {
	 *   if: (ctx) => ctx.instance instanceof iData,
	 *   then: (ctx) => ctx.reload()
	 * });
	 * ```
	 */
	@prop(Boolean)
	readonly proxyCall: boolean = false;

	/**
	 * If set to true, the component event dispatching mode is enabled.
	 * This means that all component events will bubble up to the parent component.
	 *
	 * If the parent component also has this property set to true,
	 * then the events will continue to bubble up to the next parent component in the hierarchy.
	 *
	 * To avoid collisions with events from other components,
	 * all dispatched events will have special prefixes.
	 * For example, if a component named `bButton` emits a `click` event, it will bubble up as `b-button::click`.
	 *
	 * If the component has the `globalName` property, it will additionally bubble up as `${globalName}::click`.
	 */
	@prop(Boolean)
	readonly dispatching: boolean = false;

	/**
	 * If set to true, all events that are bubbled up by child components will be fired as the component's own events,
	 * without any prefixes
	 */
	@prop(Boolean)
	readonly selfDispatching: boolean = false;

	/**
	 * Additional component parameters.
	 * This parameter can be useful when you need to pass custom or specific data to a component in a flexible and
	 * unstructured way.
	 * You can include any additional parameters you need, according to your component's requirements.
	 */
	@prop({type: Object, required: false})
	readonly p?: Dictionary;

	@prop({type: Object, required: false})
	override readonly classes?: Dictionary<CanArray<string>>;

	@prop({type: Object, required: false})
	override readonly styles?: Dictionary<CanArray<string> | Dictionary<string>>;

	@prop({type: Boolean, forceDefault: true})
	override readonly canFunctional: boolean = false;

	@prop({type: Function, required: false})
	override readonly getRoot?: () => this['Root'];

	@prop({type: Function, required: false})
	override readonly getParent?: () => this['$parent'];
}
