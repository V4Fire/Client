/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import Block from 'super/i-block/modules/block';

import { delegate } from 'core/dom';
import { wait } from 'super/i-block/modules/decorators';
import { ComponentElement } from 'core/component';

const
	componentRgxp = /(?:^| )([bpg]-[^_ ]+)(?: |$)/;

export default class DOM {
	/**
	 * Component instance
	 */
	protected readonly component: iBlock;

	/**
	 * Block instance
	 */
	protected get block(): Block {
		// @ts-ignore
		return this.component.block;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
	}

	/**
	 * Returns a string id, which is connected to the component
	 * @param id - custom id
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
	 * Wrapper for core/dom -> delegate
	 *
	 * @param selector - CSS selector
	 * @param handler
	 */
	delegate(selector: string, handler?: Function): Function {
		return delegate(selector, handler);
	}

	/**
	 * Wraps a handler for delegation of the specified element
	 *
	 * @param name - element name
	 * @param handler
	 */
	delegateElement(name: string, handler: Function): CanPromise<Function> {
		const res = this.component.lfc.execCbAfterComponentReady(() =>
			this.delegate(this.block.getElSelector(name), handler)
		);

		if (Object.isPromise(res)) {
			return res.then((fn) => fn || Any);
		}

		return res || Any;
	}

	/**
	 * Puts the specified element to the render stream
	 *
	 * @param cb
	 * @param [el] - link to a dome element or an element name
	 */
	@wait('ready')
	async putInStream<T extends iBlock>(
		cb: (this: T, el: Element) => void,
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

		wrapper.remove();
		return true;
	}

	/**
	 * Replaces an element with the specified
	 *
	 * @param el - element name or a link to the node
	 * @param newNode
	 */
	replaceWith(el: string | Element, newNode: Node): Function | boolean {
		const
			node = Object.isString(el) ? this.block.element(el) : el;

		if (!node) {
			return false;
		}

		node.replaceWith(newNode);

		// @ts-ignore
		return this.component.async.worker(() => {
			if (newNode.parentNode) {
				newNode.parentNode.removeChild(newNode);
			}
		}, {group: 'asyncComponents'});
	}

	/**
	 * Returns an instance of a component by the specified element
	 *
	 * @param el
	 * @param [filter]
	 */
	getComponent<T extends iBlock>(el: ComponentElement<T>, filter?: string): T;

	/**
	 * Returns an instance of a component by the specified query
	 *
	 * @param query
	 * @param [filter]
	 */
	getComponent<T extends iBlock>(query: string, filter?: string): CanUndef<T>;
	getComponent<T extends iBlock>(query: string | ComponentElement<T>, filter: string = ''): CanUndef<T> {
		const
			q = Object.isString(query) ? document.body.querySelector<ComponentElement<T>>(query) : query;

		if (q) {
			if (q.component && (q.component.instance instanceof iBlock)) {
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
	createBlockCtxFromNode(node: Element, component?: iBlock): Dictionary {
		const
			$el = <ComponentElement<iBlock>>node,
			comp = component || $el.component;

		const componentName = comp ?
			comp.componentName :
			Object.get(componentRgxp.exec($el.className), '1') || this.component.componentName;

		return Object.assign(Object.create(Block.prototype), {
			component: comp || {
				$el,
				componentName,
				localEvent: {emit(): void { /* loopback */ }}
			}
		});
	}
}
