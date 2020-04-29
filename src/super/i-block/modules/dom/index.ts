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

import { wrapAsDelegateHandler } from 'core/dom';
import { ComponentElement } from 'core/component';

import iBlock from 'super/i-block/i-block';
import Block from 'super/i-block/modules/block';
import Friend from 'super/i-block/modules/friend';

import { wait } from 'super/i-block/modules/decorators';
import { componentRgxp } from 'super/i-block/modules/dom/const';
import { ElCb } from 'super/i-block/modules/dom/interface';

export * from 'super/i-block/modules/dom/const';
export * from 'super/i-block/modules/dom/interface';

/**
 * Class provides some methods to work with a DOM tree
 */
export default class DOM<C extends iBlock = iBlock> extends Friend<C> {
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
		if (!id) {
			return undefined;
		}

		return `${this.component.componentId}-${id}`;
	}

	/**
	 * Wraps the specified function as an event handler with delegation
	 *
	 * @see [[wrapAsDelegateHandler]]
	 * @param selector - selector to delegate
	 * @param fn
	 */
	delegate<T extends Function>(selector: string, fn: T): T {
		return wrapAsDelegateHandler(selector, fn);
	}

	/**
	 * Wraps the specified function as an event handler with delegation of a component element
	 *
	 * @param name - element name
	 * @param fn
	 */
	delegateElement<T extends Function>(name: string, fn: T): T {
		return this.delegate([''].concat(this.provide.elClasses({[name]: {}})).join('.'), fn);
	}

	/**
	 * Puts the specified element to a render stream.
	 * This method forces the render of the element.
	 *
	 * @param cb
	 * @param [el] - link to a DOM element or component element name
	 */
	@wait('ready')
	async putInStream(
		cb: ElCb<this['C']>,
		el: Element | string = this.component.$el
	): Promise<boolean> {
		const
			node = Object.isString(el) ? this.block.element(el) : el;

		if (!node) {
			return false;
		}

		if (node.clientHeight) {
			cb.call(this.component, node);
			return false;
		}

		const wrapper = document.createElement('div');
		Object.assign(wrapper.style, {
			'display': 'block',
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'z-index': -1,
			'opacity': 0
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
	 * @param [group] - operation group
	 */
	appendChild(
		parent: string | Node | DocumentFragment,
		newNode: Node,
		group?: string
	): Function | false {
		const
			parentNode = Object.isString(parent) ? this.block.element(parent) : parent;

		if (!parentNode) {
			return false;
		}

		if (!group && !(parent instanceof DocumentFragment)) {
			group = (<Element>parentNode).getAttribute('data-render-group') || '';
		}

		parentNode.appendChild(newNode);
		return this.component.async.worker(() => newNode.parentNode?.removeChild(newNode), {
			group: group || 'asyncComponents'
		});
	}

	/**
	 * Replaces a component element with the specified node.
	 * The method returns a link to an Async worker that wraps the operation.
	 *
	 * @param el - element name or a link to a node
	 * @param newNode
	 * @param [group] - operation group
	 */
	replaceWith(el: string | Element, newNode: Node, group?: string): Function | false {
		const
			node = Object.isString(el) ? this.block.element(el) : el;

		if (!node) {
			return false;
		}

		if (!group) {
			group = node.getAttribute('data-render-group') || '';
		}

		node.replaceWith(newNode);
		return this.component.async.worker(() => newNode.parentNode?.removeChild(newNode), {
			group: group || 'asyncComponents'
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
				el = <ComponentElement<T>>q.closest(`.i-block-helper${filter}`);

			if (el) {
				return el.component;
			}
		}

		return undefined;
	}

	/**
	 * Creates a Block instance from the specified node
	 *
	 * @param node
	 * @param [component]
	 */
	createBlockCtxFromNode(node: Node, component?: iBlock): Dictionary {
		const
			$el = <ComponentElement<this['C']>>node,
			comp = component || $el.component;

		const componentName = comp ?
			comp.componentName :
			Object.get(componentRgxp.exec($el.className), '1') || this.component.componentName;

		return Object.assign(Object.create(Block.prototype), {
			component: comp || {
				$el,
				componentName,
				isFlyweight: true,
				localEmitter: {emit(): void { /* loopback */ }}
			}
		});
	}
}
