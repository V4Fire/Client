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

export default class Dom {
	/**
	 * iBlock instance
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
	getConnectedId(id: string): string;
	getConnectedId(id: undefined | null): undefined;
	getConnectedId(id: Nullable<string>): CanUndef<string> {
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
		// @ts-ignore
		const res = this.component.execCbAfterBlockReady(() =>
			this.delegate(this.block.getElSelector(name), handler)
		);

		if (Object.isPromise(res)) {
			return res.then((fn) => <Function>fn || Any);
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
	async putInStream(
		cb: (this: iBlock, el: Element) => void,
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
	 * Creates a fake context for a component instance from the specified node
	 * @param node
	 */
	protected createComponentCtxFromNode(node: Element): Dictionary {
		const
			$el = <ComponentElement<iBlock>>node,
			comp = $el.component;

		const
			rgxp = /(?:^| )([bpg]-[^_ ]+)(?: |$)/,
			componentName = comp ? comp.componentName : Object.get(rgxp.exec($el.className), '1') || this.componentName;

		return Object.assign(Object.create(Block.prototype), {
			component: {
				$el,
				componentName,
				localEvent: comp ? comp.localEvent : {emit(): void { /* loopback */ }},
				mods: comp ? comp.mods : undefined
			}
		});
	}
}
