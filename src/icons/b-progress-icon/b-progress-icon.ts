/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:icons/b-progress-icon/README.md]]
 * @packageDocumentation
 */

import iIcon from 'traits/i-icon/i-icon';
import iBlock, { component } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

/**
 * Component to indicate a loading
 */
@component({functional: true, flyweight: true})
export default class bProgressIcon extends iBlock implements iIcon {
	/** @see iIcon.getIconLink */
	getIconLink(iconId: string): string {
		return iIcon.getIconLink(iconId);
	}
}
