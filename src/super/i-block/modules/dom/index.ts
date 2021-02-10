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

import { deprecated } from 'core/functools/deprecation';

import { wrapAsDelegateHandler } from 'core/dom';

import { InitOptions, InViewAdapter } from 'core/dom/in-view';
import { ResizeWatcherInitOptions } from 'core/dom/resize-observer';

import { ComponentElement } from 'core/component';
import { AsyncOptions } from 'core/async';

import iBlock from 'super/i-block/i-block';
import Block from 'super/i-block/modules/block';
import Friend from 'super/i-block/modules/friend';

import { wait } from 'super/i-block/modules/decorators';
import { componentRgxp } from 'super/i-block/modules/dom/const';
import { ElCb, inViewInstanceStore, DOMManipulationOptions } from 'super/i-block/modules/dom/interface';

export * from 'super/i-block/modules/dom/const';
export * from 'super/i-block/modules/dom/interface';

/**
 * Class provides some methods to work with a DOM tree
 */
export default class DOM extends Friend {
	/**
	 * Returns a component in-view instance
	 */
	get localInView(): Promise<InViewAdapter> {
		const
			currentInstance = <CanUndef<Promise<InViewAdapter>>>this.ctx.tmp[inViewInstanceStore];

		if (currentInstance != null) {
			return currentInstance;
		}

		return this.ctx.tmp[inViewInstanceStore] = this.async.promise(import('core/dom/in-view')).then(({inViewFactory}) => inViewFactory());
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
	 * Wraps the specified function as an event handler with delegation
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
	 * Wraps the specified function as an event handler with delegation of a component element
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
	 * Puts the specified element to a render stream.
	 * This method forces the rendering of the element.
	 *
	 * @param cb
	 * @param [el] - link to a DOM element or component element name
	 */
	@wait('ready')
	async putInStream(
		cb: ElCb<this['C']>,
		el: CanUndef<Element | string> = this.ctx.$el
	): Promise<boolean> {
		const
			node = Object.isString(el) ? this.block?.element(el) : el;

		if (node == null) {
			return false;
		}

		if (node.clientHeight > 0) {
			cb.call(this.component, node);
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
			parent = node.parentNode,
			before = node.nextSibling;

		wrapper.appendChild(node);
		document.body.appendChild(wrapper);
		await cb.call(this.component, node);

		if (parent) {
			if (before) {
				parent.insertBefore(node, before);

			} else {
				parent.appendChild(node);
			}
		}

		wrapper.parentNode?.removeChild(wrapper);
		return true;
	}

	/**
	 * Appends a child node to the specified parent.
	 * The method returns a link to an Async worker that wraps the operation.
	 *
	 * @param parent - element name or a link to the parent node
	 * @param newNode
	 * @param [groupOrOptions] - `async` group or a set of options
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

			if (destroyIfComponent === true && component) {
				component.unsafe.$destroy();
			}

		}, {
			group: group ?? 'asyncComponents'
		});
	}

	/**
	 * Replaces a component element with the specified node.
	 * The method returns a link to an Async worker that wraps the operation.
	 *
	 * @param el - element name or a link to a node
	 * @param newNode
	 * @param [groupOrOptions] - `async` group or a set of options
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

			if (destroyIfComponent === true && component) {
				component.unsafe.$destroy();
			}

		}, {
			group: group ?? 'asyncComponents'
		});
	}

	/**
	 * Returns an instance of a component from the specified element
	 *
	 * @param el
	 * @param [filter]
	 */
	getComponent<T extends iBlock>(el: ComponentElement<T>, filter?: string): T;

	/**
	 * Returns an instance of a component by the specified CSS selector
	 *
	 * @param selector
	 * @param [filter]
	 */
	getComponent<T extends iBlock>(selector: string, filter?: string): CanUndef<T>;
	getComponent<T extends iBlock>(query: string | ComponentElement<T>, filter: string = ''): CanUndef<T> {
		const
			q = Object.isString(query) ? document.body.querySelector<ComponentElement<T>>(query) : query;

		if (q) {
			if (q.component?.instance instanceof iBlock) {
				return q.component;
			}

			const
				el = q.closest<ComponentElement<T>>(`.i-block-helper${filter}`);

			if (el != null) {
				return el.component;
			}
		}

		return undefined;
	}

	/**
	 * Creates a Block instance from the specified node and component instance
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

	/**
	 * @deprecated
	 * @see [[DOM.prototype.watchForIntersection]]
	 *
	 * @param el
	 * @param options
	 * @param asyncOptions
	 */
	@deprecated({renamedTo: 'watchForIntersection'})
	watchForNodeIntersection(el: Element, options: InitOptions, asyncOptions: AsyncOptions): Function {
		return this.watchForIntersection(el, options, asyncOptions);
	}

	/**
	 * Watches for intersections of the specified element by using the `in-view` module
	 *
	 * @param el
	 * @param options
	 * @param asyncOptions
	 */
	watchForIntersection(el: Element, options: InitOptions, asyncOptions: AsyncOptions): Function {
		const
			{ctx} = this,
			inViewInstance = this.localInView;

		const destructor = ctx.async.worker(
			() => inViewInstance.then((adapter) => adapter.remove(el, options.threshold), stderr),
			asyncOptions
		);

		inViewInstance.then((adapter) => adapter.observe(el, options), stderr);
		return destructor;
	}

	/**
	 * Watches for size changes of the specified element by using the `resize-observer` module.
	 * Notice, this functionality depends on `ResizeObserver`.
	 *
	 * @param el
	 * @param options
	 * @param asyncOptions
	 */
	watchForResize(el: Element, options: ResizeWatcherInitOptions, asyncOptions: AsyncOptions): Function {
		const
			ResizeWatcher = this.async.promise(import('core/dom/resize-observer'));

		const destructor = this.ctx.async.worker(
			() => ResizeWatcher.then(({ResizeWatcher}) => ResizeWatcher.unobserve(el, options), stderr),
			asyncOptions
		);

		ResizeWatcher.then(({ResizeWatcher}) => ResizeWatcher.observe(el, options), stderr);
		return destructor;
	}
}
