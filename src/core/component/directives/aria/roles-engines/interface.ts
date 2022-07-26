export interface TabParams {
	isFirst: boolean;
	isVertical: boolean;
	isActive: boolean;
	changeEvent(cb: Function): void;
}

export interface TablistParams {
	isVertical: boolean;
	isMultiple: boolean;
}

export interface TreeParams {
	isRoot: boolean;
	isVertical: boolean;
	changeEvent(cb: Function): void;
}

export interface TreeitemParams {
	isRootFirstItem: boolean;
	isExpandable: boolean;
	isExpanded: boolean;
	rootElement: CanUndef<HTMLElement>;
	toggleFold(el: Element, value?: boolean): void;
}

export interface ComboboxParams {
	isMultiple: boolean;
	changeEvent(cb: Function): void;
	openEvent(cb: Function): void;
	closeEvent(cb: Function): void;
}
