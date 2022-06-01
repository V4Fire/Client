/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/dom/README.md]]
 * @packageDocumentation
 */

import { memoize } from 'core/promise/sync';
import { deprecated } from 'core/functools/deprecation';
import { wrapAsDelegateHandler } from 'core/dom';

import type { InViewInitOptions, InViewAdapter } from 'core/dom/in-view';
import type { ResizeWatcherInitOptions } from 'core/dom/resize-observer';

import type { AsyncOptions } from 'core/async';
import type { ComponentElement } from 'core/component';

import iBlock from 'super/i-block/i-block';
import Block from 'super/i-block/modules/block';
import Friend from 'super/i-block/friend';

import { componentRgxp } from 'super/i-block/modules/dom/const';
import { ElCb, inViewInstanceStore, DOMManipulationOptions } from 'super/i-block/modules/dom/interface';

export * from 'super/i-block/modules/dom/const';
export * from 'super/i-block/modules/dom/interface';

/**
 * Class provides helper methods to work with a component' DOM tree
 */
export default class DOM extends Friend {
	/**
	 * Link to a component' `core/dom/in-view` instance
	 */
	get localInView(): Promise<InViewAdapter> {
		const
			currentInstance = <CanUndef<Promise<InViewAdapter>>>this.ctx.tmp[inViewInstanceStore];

		if (currentInstance != null) {
			return currentInstance;
		}

		return this.ctx.tmp[inViewInstanceStore] = this.async.promise(
			memoize('core/dom/in-view', () => import('core/dom/in-view'))
		).then(({inViewFactory}) => inViewFactory());
	}

	/**
	 * Takes a string identifier and returns a new identifier that is connected to the component.
	 * This method should use to generate id attributes for DOM nodes.
	 *
	 * @param id
	 *
	 * @example
	 * ```
	 * < div :id = dom.getId('bla')
	 * ```
	 */
	getId(id: string): string;
	getId(id: undefined | null): undefined;
	getId(id: Nullable<string>): CanUndef<string> {
		if (id == null) {
			return undefined;
		}

		return `${this.ctx.componentId}-${id}`;
	}

	/**
	 * Returns a component's instance from the specified element.
	 * There are two scenarios of working the method:
	 *
	 * 1. You provide the root element of a component, and the method returns a component's instance from this element.
	 * 2. You provide not the root element, and the method returns a component's instance from the closest parent
	 *    component's root element.
	 *
	 * @param el
	 * @param [rootSelector] - additional CSS selector that the component' root element should match
	 *
	 * @example
	 * ```js
	 * console.log(this.dom.getComponent(someElement)?.componentName);
	 * console.log(this.dom.getComponent(someElement, '.b-form')?.componentName);
	 * ```
	 */
	getComponent<T extends iBlock>(el: ComponentElement<T>, rootSelector?: string): CanUndef<T>;

	/**
	 * Returns a component's instance by the specified CSS selector.
	 * There are two scenarios of working the method:
	 *
	 * 1. You provide the root element of a component, and the method returns a component's instance from this element.
	 * 2. You provide not the root element, and the method returns a component's instance from the closest parent
	 *    component's root element.
	 *
	 * @param selector
	 * @param [rootSelector] - additional CSS selector that the component' root element should match
	 *
	 * @example
	 * ```js
	 * console.log(this.dom.getComponent('.foo')?.componentName);
	 * console.log(this.dom.getComponent('.foo__bar', '.b-form')?.componentName);
	 * ```
	 */
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	getComponent<T extends iBlock>(selector: string, rootSelector?: string): CanUndef<T>;
	getComponent<T extends iBlock>(
		query: string | ComponentElement<T>,
		rootSelector: string = ''
	): CanUndef<T> {
		const
			q = Object.isString(query) ? document.body.querySelector<ComponentElement<T>>(query) : query;

		if (q) {
			if (q.component?.instance instanceof iBlock) {
				return q.component;
			}

			const
				el = q.closest<ComponentElement<T>>(`.i-block-helper${rootSelector}`);

			if (el != null) {
				return el.component;
			}
		}

		return undefined;
	}

	/**
	 * Wraps the specified function as an event handler with delegation.
	 * The event object will contain a link to the element to which we are delegating the handler
	 * by a property `delegateTarget`.
	 *
	 * @see [[wrapAsDelegateHandler]]
	 * @param selector - selector to delegate
	 * @param fn
	 *
	 * @example
	 * ```js
	 * el.addEventListener('click', this.delegate('.foo', () => {
	 *   // ...
	 * }));
	 * ```
	 */
	delegate<T extends Function>(selector: string, fn: T): T {
		return wrapAsDelegateHandler(selector, fn);
	}

	/**
	 * Wraps the specified function as an event handler with delegation of a component element.
	 * The event object will contain a link to the element to which we are delegating the handler
	 * by a property `delegateTarget`.
	 *
	 * @param name - element name
	 * @param fn
	 *
	 * @example
	 * ```js
	 * el.addEventListener('click', this.delegateElement('myElement', () => {
	 *   // ...
	 * }));
	 * ```
	 */
	delegateElement<T extends Function>(name: string, fn: T): T {
		return this.delegate([''].concat(this.provide.elClasses({[name]: {}})).join('.'), fn);
	}

	/**
	 * Puts an element to the render stream.
	 * The method forces rendering of the element, i.e., you can check its geometry.
	 *
	 * @param el - link to a DOM element or a component element name
	 * @param cb - callback function
	 *
	 * * @example
	 * ```js
	 * this.dom.putInStream(this.$el.querySelector('.foo'), () => {
	 *   console.log(this.$el.clientHeight);
	 * })
	 * ```
	 */
	putInStream(el: Element | string, cb: ElCb<this['C']>): Promise<boolean>;

	/**
	 * Puts an element to the render stream.
	 * The method forces rendering of the element (by default it uses the root component' element), i.e.,
	 * you can check its geometry.
	 *
	 * @param cb - callback function
	 * @param [el] - link to a DOM element or a component element name
	 *
	 * @example
	 * ```js
	 * this.dom.putInStream(() => {
	 *   console.log(this.$el.clientHeight);
	 * });
	 * ```
	 */
	putInStream(cb: ElCb<this['C']>, el?: Element | string): Promise<boolean>;
	putInStream(
		cbOrEl: CanUndef<Element | string> | ElCb<this['C']>,
		elOrCb: CanUndef<Element | string> | ElCb<this['C']> = this.ctx.$el
	): Promise<boolean> {
		let
			cb,
			el;

		if (Object.isFunction(cbOrEl)) {
			cb = cbOrEl;
			el = elOrCb;

		} else if (Object.isFunction(elOrCb)) {
			cb = elOrCb;
			el = cbOrEl;
		}

		if (!(el instanceof Node)) {
			throw new ReferenceError('An element to put in the stream is not specified');
		}

		if (!Object.isFunction(cb)) {
			throw new ReferenceError('A callback to invoke is not specified');
		}

		return this.ctx.waitStatus('ready').then(async () => {
			const
				resolvedEl = Object.isString(el) ? this.block?.element(el) : el;

			if (resolvedEl == null) {
				return false;
			}

			if (resolvedEl.clientHeight > 0) {
				await cb.call(this.component, resolvedEl);
				return false;
			}

			const wrapper = document.createElement('div');
			Object.assign(wrapper.style, {
				display: 'block',
				position: 'absolute',
				top: 0,
				left: 0,
				'z-index': -1,
				opacity: 0
			});

			const
				parent = resolvedEl.parentNode,
				before = resolvedEl.nextSibling;

			wrapper.appendChild(resolvedEl);
			document.body.appendChild(wrapper);

			await cb.call(this.component, resolvedEl);

			if (parent != null) {
				if (before != null) {
					parent.insertBefore(resolvedEl, before);

				} else {
					parent.appendChild(resolvedEl);
				}
			}

			wrapper.parentNode?.removeChild(wrapper);
			return true;
		});
	}

	/**
	 * Appends a node to the specified parent.
	 * The method returns a link to an `Async` worker that wraps the operation.
	 *
	 * You should prefer this method instead of native DOM methods because the component destructor
	 * does not delete elements that are created dynamically.
	 *
	 * @param parent - element name or a link to the parent node
	 * @param newNode - node to append
	 * @param [groupOrOptions] - `async` group or a set of options
	 *
	 * @example
	 * ```js
	 * const id = this.dom.appendChild(this.$el, document.createElement('button'));
	 * this.async.terminateWorker(id);
	 * ```
	 */
	appendChild(
		parent: string | Node | DocumentFragment,
		newNode: Node,
		groupOrOptions?: string | DOMManipulationOptions
	): Function | false {
		const
			parentNode = Object.isString(parent) ? this.block?.element(parent) : parent,
			destroyIfComponent = Object.isPlainObject(groupOrOptions) ? groupOrOptions.destroyIfComponent : undefined;

		let
			group = Object.isString(groupOrOptions) ? groupOrOptions : groupOrOptions?.group;

		if (parentNode == null) {
			return false;
		}

		if (group == null && parentNode instanceof Element) {
			group = parentNode.getAttribute('data-render-group') ?? undefined;
		}

		parentNode.appendChild(newNode);

		return this.ctx.async.worker(() => {
			newNode.parentNode?.removeChild(newNode);

			const
				{component} = <ComponentElement<iBlock>>newNode;

			if (component != null && destroyIfComponent === true) {
				component.unsafe.$destroy();
			}

		}, {
			group: group ?? 'asyncComponents'
		});
	}

	/**
	 * Replaces a component element with the specified node.
	 * The method returns a link to an `Async` worker that wraps the operation.
	 *
	 * You should prefer this method instead of native DOM methods because the component destructor
	 * does not delete elements that are created dynamically.
	 *
	 * @param el - element name or a link to the node
	 * @param newNode - node to append
	 * @param [groupOrOptions] - `async` group or a set of options
	 *
	 * * @example
	 * ```js
	 * const id = this.dom.replaceWith(this.block.element('foo'), document.createElement('button'));
	 * this.async.terminateWorker(id);
	 * ```
	 */
	replaceWith(el: string | Element, newNode: Node, groupOrOptions?: string | DOMManipulationOptions): Function | false {
		const
			node = Object.isString(el) ? this.block?.element(el) : el,
			destroyIfComponent = Object.isPlainObject(groupOrOptions) ? groupOrOptions.destroyIfComponent : undefined;

		let
			group = Object.isString(groupOrOptions) ? groupOrOptions : groupOrOptions?.group;

		if (node == null) {
			return false;
		}

		if (group == null) {
			group = node.getAttribute('data-render-group') ?? undefined;
		}

		node.replaceWith(newNode);

		return this.ctx.async.worker(() => {
			newNode.parentNode?.removeChild(newNode);

			const
				{component} = <ComponentElement<iBlock>>newNode;

			if (component != null && destroyIfComponent === true) {
				component.unsafe.$destroy();
			}

		}, {
			group: group ?? 'asyncComponents'
		});
	}

	/**
	 * Watches for intersections of the specified element by using the `core/dom/in-view` module.
	 * The method returns a link to an `Async` worker that wraps the operation.
	 *
	 * You should prefer this method instead of raw `core/dom/in-view` to cancel intersection observing
	 * when the component is destroyed.
	 *
	 * @param el
	 * @param inViewOpts
	 * @param [asyncOpts]
	 *
	 * @example
	 * ```js
	 * const id = this.watchForIntersection(myElem, {delay: 200}, {group: 'inView'})
	 * this.async.terminateWorker(id);
	 * ```
	 */
	watchForIntersection(el: Element, inViewOpts: InViewInitOptions, asyncOpts?: AsyncOptions): Function {
		const
			inViewInstance = this.localInView;

		const destructor = this.ctx.async.worker(
			() => inViewInstance
				.then((adapter) => adapter.remove(el, inViewOpts.threshold))
				.catch(stderr),

			asyncOpts
		);

		inViewInstance
			.then((adapter) => adapter.observe(el, inViewOpts))
			.catch(stderr);

		return destructor;
	}

	/**
	 * @deprecated
	 * @see [[DOM.watchForIntersection]]
	 *
	 * @param el
	 * @param inViewOpts
	 * @param [asyncOpts]
	 */
	@deprecated({renamedTo: 'watchForIntersection'})
	watchForNodeIntersection(el: Element, inViewOpts: InViewInitOptions, asyncOpts?: AsyncOptions): Function {
		return this.watchForIntersection(el, inViewOpts, asyncOpts);
	}

	/**
	 * Watches for size changes of the specified element by using the `core/dom/resize-observer` module.
	 * The method returns a link to an `Async` worker that wraps the operation.
	 *
	 * You should prefer this method instead of raw `core/dom/resize-observer` to cancel resize observing
	 * when the component is destroyed.
	 *
	 * @param el
	 * @param resizeOpts
	 * @param [asyncOpts]
	 *
	 * @example
	 * ```js
	 * const id = this.watchForResize(myElem, {immediate: true}, {group: 'resize'})
	 * this.async.terminateWorker(id);
	 * ```
	 */
	watchForResize(el: Element, resizeOpts: ResizeWatcherInitOptions, asyncOpts?: AsyncOptions): Function {
		const ResizeWatcher = this.async.promise(
			memoize('core/dom/resize-observer', () => import('core/dom/resize-observer'))
		);

		const destructor = this.ctx.async.worker(
			() => ResizeWatcher
				.then(({ResizeWatcher}) => ResizeWatcher.unobserve(el, resizeOpts))
				.catch(stderr),

			asyncOpts
		);

		ResizeWatcher
			.then(({ResizeWatcher}) => ResizeWatcher.observe(el, resizeOpts))
			.catch(stderr);

		return destructor;
	}

	/**
	 * Creates a [[Block]] instance from the specified node and component instance.
	 * Basically, you don't need to use this method.
	 *
	 * @param node
	 * @param [component] - component instance, if not specified, the instance is taken from a node
	 */
	createBlockCtxFromNode(node: CanUndef<Node>, component?: iBlock): Dictionary {
		const
			$el = <CanUndef<ComponentElement<this['CTX']>>>node,
			ctxFromNode = component ?? $el?.component;

		const componentName = ctxFromNode ?
			ctxFromNode.componentName :
			Object.get(componentRgxp.exec($el?.className ?? ''), '1') ?? this.ctx.componentName;

		const resolvedCtx = ctxFromNode ?? {
			$el,
			componentName,

			mods: {},
			isFlyweight: true,

			localEmitter: {
				emit(): void {
					// Loopback
				}
			},

			emit(): void {
				// Loopback
			}
		};

		return Object.assign(Object.create(Block.prototype), {
			ctx: resolvedCtx,
			component: resolvedCtx
		});
	}
}
