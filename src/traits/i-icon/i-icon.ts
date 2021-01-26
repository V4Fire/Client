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

import iBlock from 'super/i-block/i-block';

import { ID_ATTRIBUTE } from 'core/component/directives/update-on';
import { icons, iconsMap } from 'traits/i-icon/modules/icons';

export default abstract class iIcon {
	/**
	 * Returns a link for the specified icon
	 * @param iconId
	 */
	static async getIconLink(iconId: Nullable<string>): Promise<CanUndef<string>> {
		if (iconId == null) {
			return Promise.resolve(undefined);
		}

		if (!(iconId in iconsMap)) {
			throw new ReferenceError(`The specified icon "${iconId}" is not defined`);
		}

		let
			q = '';

		if (location.search !== '') {
			q = location.search;

		} else {
			q = location.href.endsWith('?') ? '?' : '';
		}

		const icon = await icons(iconsMap[iconId]);
		return `${location.pathname + q}#${icon.id}`;
	}

	/**
	 * Updates `href` of the specified `use` element
	 *
	 * @param component
	 * @param el
	 * @param [href]
	 */
	static updateIconHref<T extends iBlock>(component: T, el: SVGUseElement, href?: string): void {
		const
			parent = el.parentNode;

		if (!parent) {
			return;
		}

		parent
			.querySelectorAll('[data-tmp]')
			.forEach((el) => parent.removeChild(el));

		if (!Object.isTruly(href)) {
			return;
		}

		const newEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');

		newEl.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href!);
		newEl.setAttribute('data-tmp', '');

		parent.appendChild(newEl);

		component.unsafe.async.worker(destructor, {
			group: el.getAttribute(ID_ATTRIBUTE) ?? undefined
		});

		function destructor(): void {
			try {
				parent?.removeChild(newEl);

			} catch {}
		}
	}

	/**
	 * Handles an error of the icon loading
	 *
	 * @param component
	 * @param el - link to the source `use` element
	 * @param err
	 */
	static handleIconError<T extends iBlock & iIcon>(component: T, el: SVGUseElement, err: Error): void {
		stderr(err);
		component.updateIconHref(el);
	}

	/**
	 * Link to iIcon.getIconLink
	 */
	abstract getIconLink: typeof iIcon.getIconLink;

	/**
	 * Updates `href` of the specified `use` element
	 *
	 * @param el
	 * @param [href]
	 */
	abstract updateIconHref(el: SVGUseElement, href?: string): void;

	/**
	 * Handles an error of the icon loading
	 *
	 * @param el - link to the source `use` element
	 * @param err
	 */
	abstract handleIconError(el: SVGUseElement, err: Error): void;
}
