/* eslint-disable @typescript-eslint/no-unused-vars-experimental */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-icon/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';
import type iBlock from 'super/i-block/i-block';

import { ID_ATTRIBUTE } from 'core/component/directives/update-on';
import { getIcon, iconsStore } from 'traits/i-icon/modules/icons';

export default abstract class iIcon {
	/**
	 * Returns a link for the specified icon
	 *
	 * @param component
	 * @param iconId
	 */
	static getIconLink: AddSelf<iIcon['getIconLink'], iBlock> = (component, iconId) => {
		if (iconId == null) {
			return SyncPromise.resolve(undefined);
		}

		if (!(iconId in iconsStore)) {
			throw new ReferenceError(`The specified icon "${iconId}" is not defined`);
		}

		const
			icon = getIcon(iconId);

		if (Object.isPromise(icon)) {
			return (async () => `#${(await icon).id}`)();
		}

		return SyncPromise.resolve(`#${icon.id}`);
	};

	/**
	 * Updates `href` of the specified `use` element
	 *
	 * @param component
	 * @param el
	 * @param [href]
	 */
	static updateIconHref: AddSelf<iIcon['updateIconHref'], iBlock> = (component, el: SVGUseElement, href?) => {
		const {
			async: $a,
			$normalParent
		} = component.unsafe;

		if (component.componentStatus === 'inactive' || $normalParent?.componentStatus === 'inactive') {
			return;
		}

		const group = {group: el.getAttribute(ID_ATTRIBUTE) ?? undefined};
		$a.clearAll(group);

		const
			parent = el.parentNode;

		if (!parent) {
			return;
		}

		Object.forEach(parent.querySelectorAll('[data-tmp]'), (el: Node) => parent.removeChild(el));

		if (!Object.isTruly(href)) {
			return;
		}

		const
			newEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');

		newEl.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href!);
		newEl.setAttribute('data-tmp', '');

		$a.requestAnimationFrame(() => {
			parent.appendChild(newEl);
		}, group);

		$a.worker(() => {
			try {
				parent.removeChild(newEl);
			} catch {}
		}, group);
	};

	/**
	 * Handles an error of the icon loading
	 *
	 * @param component
	 * @param el - link to the source `use` element
	 * @param err
	 */
	static handleIconError: AddSelf<iIcon['handleIconError'], iBlock & iIcon> = (component, el, err) => {
		stderr(err);
		component.updateIconHref(el);
	};

	/**
	 * Link to iIcon.getIconLink
	 */
	getIconLink(iconId: Nullable<string>): Promise<CanUndef<string>> {
		return Object.throw();
	}

	/**
	 * Updates `href` of the specified `use` element
	 *
	 * @param el
	 * @param [href]
	 */
	updateIconHref(el: SVGUseElement, href?: string): void {
		return Object.throw();
	}

	/**
	 * Handles an error of the icon loading
	 *
	 * @param el - link to the source `use` element
	 * @param err
	 */
	handleIconError(el: SVGUseElement, err: Error): void {
		return Object.throw();
	}
}
