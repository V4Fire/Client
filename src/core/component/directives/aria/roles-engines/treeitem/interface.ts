/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface TreeitemParams {
	isFirstRootItem: boolean;
	isExpandable: boolean;
	isExpanded: boolean;
	orientation: string;
	rootElement: CanUndef<HTMLElement>;
	toggleFold(el: Element, value?: boolean): void;
}
