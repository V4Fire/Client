export interface TabParams {
	preSelected: boolean;
	isFirst: boolean;
	isActive: boolean;
	orientation: string;
	changeEvent(cb: Function): void;
}

export interface TablistParams {
	isMultiple: boolean;
	orientation: string;
}

export interface TreeParams {
	isRoot: boolean;
	orientation: string;
	changeEvent(cb: Function): void;
}

export interface TreeitemParams {
	isRootFirstItem: boolean;
	isExpandable: boolean;
	isExpanded: boolean;
	orientation: string;
	rootElement: CanUndef<HTMLElement>;
	toggleFold(el: Element, value?: boolean): void;
}

export interface ComboboxParams {
	isMultiple: boolean;
	changeEvent(cb: Function): void;
	openEvent(cb: Function): void;
	closeEvent(cb: Function): void;
}
