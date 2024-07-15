/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import SyncPromise from 'core/promise/sync';
import type iBlock from 'components/super/i-block';

import { idsCache, iconsStore } from 'components/directives/icon/const';
import { getElementId } from 'core/component/directives';
import { getIcon } from 'components/directives/icon/icons';

/**
 * Returns a link for the specified icon
 *
 * @param iconId
 * @throws {ReferenceError} if the icon for the given id does not exist
 */
export function getIconHref(iconId: Nullable<string>): Promise<CanUndef<string>> {
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
}

/**
 * Updates the `href` attribute of the child `use` element to the given value
 *
 * @param id
 * @param el
 * @param [href]
 */
export function updateIconHref(this: iBlock, id: string, el: SVGElement, href?: string): void {
	const {
		async: $a,
		$normalParent
	} = this;

	if (this.componentStatus === 'inactive' || $normalParent?.componentStatus === 'inactive') {
		return;
	}

	setDSIconStyles(el, id);

	const group = {group: getElementId(el, idsCache)};
	$a.clearAll(group);

	Object.forEach(el.children, (child) => el.removeChild(child));

	if (href == null || href === '') {
		return;
	}

	const newUseEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
	newUseEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);

	$a.requestAnimationFrame(() => {
		el.appendChild(newUseEl);
	}, group);

	$a.worker(() => {
		try {
			el.removeChild(newUseEl);
		} catch {}
	}, group);
}

/**
 * Sets styles from the design system for the specified svg element
 *
 * @param el
 * @param name
 */
function setDSIconStyles(el: SVGElement, name: string): void {
	if (DS == null) {
		return;
	}

	const
		style = Object.get(DS, `icons.${name}.style`);

	if (Object.isDictionary(style)) {
		const styleAttr = Object.entries(style).map(([k, v]) => `${k}:${String(v)}`).join(';');
		el.setAttribute('style', styleAttr);
	}
}
