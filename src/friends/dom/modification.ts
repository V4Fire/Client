/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Friend from 'friends/friend';

import type iBlock from 'super/i-block/i-block';
import type { ComponentElement } from 'super/i-block/i-block';

import type { DOMModificationOptions } from 'friends/dom/interface';

/**
 * Appends the specified DOM node to the passed parent node.
 * The function returns a destructor to remove the appended node from the DOM.
 *
 * This method should be preferred over native DOM methods because the component destructor does not remove dynamically
 * created elements.
 *
 * @param parent - the node to append into
 * @param node - the node to append
 * @param [groupOrOptions] - a group name to register in [[Async]] or additional operation parameters
 *
 * @example
 * ```js
 * const id = this.dom.appendChild(this.$el, document.createElement('button'));
 * this.async.terminateWorker(id);
 * ```
 */
export function appendChild(
	this: Friend,
	parent: string | Node | DocumentFragment,
	node: Node,
	groupOrOptions?: string | DOMModificationOptions
): Function | false {
	const
		{async: $a} = this.ctx;

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

	parentNode.appendChild(node);

	$a.worker(destructor, {group: group ?? 'asyncComponents'});
	return () => $a.clearWorker(destructor);

	function destructor() {
		node.parentNode?.removeChild(node);

		const
			{component} = <ComponentElement<iBlock>>node;

		if (component != null && destroyIfComponent === true) {
			component.unsafe.$destroy();
		}
	}
}

/**
 * Replaces the specified component element with the passed DOM node.
 * The function returns a destructor to remove the appended node from the DOM.
 *
 * This method should be preferred over native DOM methods because the component destructor does not remove dynamically
 * created elements.
 *
 * @param el - the element name or a link to the element to replace
 * @param newNode - the node to append
 * @param [groupOrOptions] - a group name to register in [[Async]] or additional operation parameters
 *
 * * @example
 * ```js
 * const id = this.dom.replaceWith(this.block.element('foo'), document.createElement('button'));
 * this.async.terminateWorker(id);
 * ```
 */
export function replaceWith(
	this: Friend,
	el: string | Element,
	newNode: Node,
	groupOrOptions?: string | DOMModificationOptions
): Function | false {
	const
		{async: $a} = this.ctx;

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

	$a.worker(destructor, {group: group ?? 'asyncComponents'});
	return () => $a.clearWorker(destructor);

	function destructor() {
		newNode.parentNode?.removeChild(newNode);

		const
			{component} = <ComponentElement<iBlock>>newNode;

		if (component != null && destroyIfComponent === true) {
			component.unsafe.$destroy();
		}
	}
}
