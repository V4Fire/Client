/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode, VNodeProps } from 'core/component/engines';

export const flagValues = {
	classes: 2,
	styles: 4,
	props: 8,
	fullProps: 16,
	events: 32,
	slots: 32,
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

type Flags = Array<keyof typeof flagValues>;

type PatchFlags = Exclude<Flags, 'slots' | 'children'>;

/**
 * Assigns the specified values to the `patchFlag` and `shapeFlag` properties of the provided VNode
 *
 * @param vnode
 * @param flags - the flags to set
 *
 * @example
 * ```js
 * setVNodePatchFlags(vnode, 'props', 'styles', 'children');
 * ```
 */
export function setVNodePatchFlags(vnode: VNode, ...flags: Flags): void {
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

/**
 * Returns the value of the `patchFlag` property based on the initial value and a set of individual flags
 *
 * @param initial - the initial value
 * @param flags - the flags to set
 */
export function buildPatchFlag(initial: number = 0, ...flags: PatchFlags): number {
	// eslint-disable-next-line no-bitwise
	return flags.reduce((result, flag) => result | flagValues[flag], initial);
}

/**
 * Normalizes the initial `patchFlag` if a vnode has special props
 *
 * @param patchFlag - the initial `patchFlag` value
 * @param props - the initial vnode props
 */
export function normalizePatchFlagUsingProps(
	patchFlag: number | undefined,
	props: Nullable<Record<string, unknown> & VNodeProps>
): number {
	const flags: PatchFlags = [];

	if (props == null) {
		return patchFlag ?? 0;
	}

	if ('data-has-v-on-directives' in props) {
		flags.push('props');
	}

	return buildPatchFlag(patchFlag, ...flags);
}
