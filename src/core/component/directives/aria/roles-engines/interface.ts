export interface TabBindingValue {
	isFirst: boolean;
	isVertical: boolean;
	isActive: boolean;
	changeEvent(cb: Function): void;
}

export interface TablistBindingValue {
	isVertical: boolean;
	isMultiple: boolean;
}

export interface TreeBindingValue {
	isRoot: boolean;
	isVertical: boolean;
	changeEvent(cb: Function): void;
}

export interface TreeitemBindingValue {
	isRootFirstItem: boolean;
	isExpandable: boolean;
	isExpanded: boolean;
	rootElement: CanUndef<HTMLElement>;
	toggleFold(el: Element, value?: boolean): void;
}

export interface ComboboxBindingValue {
	isMultiple: boolean;
	changeEvent(cb: Function): void;
	openEvent(cb: Function): void;
	closeEvent(cb: Function): void;
}
