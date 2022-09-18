/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

type FoldToggle = (el: Element, value?: boolean) => void;

export class TreeitemParams {
	firstRootItem: boolean = false;
	expandable: boolean = false;
	expanded: boolean = false;
	rootElement?: Element = undefined;
	toggleFold: FoldToggle = () => undefined;
}
