/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode } from 'core/component/engines';

const flagValues = {
	classes: 2,
	styles: 4,
	props: 8,
	fullProps: 16,
	events: 32,
	slots: 8,
	children: 16
};

const flagDest = {
	classes: 'patchFlag',
	styles: 'patchFlag',
	props: 'patchFlag',
	fullProps: 'patchFlag',
	events: 'patchFlag',
	slots: 'shapeFlag',
	children: 'shapeFlag'
};

/**
 * Sets the given values for the `patchFlag` and `shapeFlag` properties of the passed virtual node
 *
 * @param vnode
 * @param flags - flags to set
 */
export function setVNodePatchFlags(vnode: VNode, ...flags: Array<keyof typeof flagValues>): void {
	flags.forEach((flag) => {
		const
			val = flagValues[flag],
			dest = flagDest[flag];

		// eslint-disable-next-line no-bitwise
		if ((vnode[dest] & val) === 0) {
			vnode[dest] += val;
		}
	});
}
