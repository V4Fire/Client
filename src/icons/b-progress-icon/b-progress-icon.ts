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

import iBlock, { component } from 'super/i-block/i-block';

export * from 'super/i-block/i-block';

/**
 * Component to indicate loading
 */
@component({functional: true, flyweight: true})
export default class bProgressIcon extends iBlock {
	/** @override */
	readonly rootTag: string = 'span';
}
