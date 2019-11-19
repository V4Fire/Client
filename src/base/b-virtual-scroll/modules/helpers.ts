/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable-next-line: completed-docs
export function isNatural(v: number): boolean {
	return v.isNatural();
}

/**
 * Returns height of the node with margins
 * @param node
 */
export function getHeightWithMargin(node: HTMLElement): number {
	const
		style = window.getComputedStyle(node);

	const t = ['top', 'bottom']
		.map((side) => parseInt(style[`margin-${side}`], 10))
		.reduce((total, side) => total + side, node.offsetHeight);

	return t;
}
