export interface TabBindingValue {
	isFirst: boolean;
	isVertical: boolean;
	activeElement: CanUndef<Promise<CanArray<HTMLElement>>>;
	onChange(cb: Function): void;
}

export interface TablistBindingValue {
	isVertical: boolean;
	isMultiple: boolean;
}

export interface TreeBindingValue {
	isVertical: boolean;
	isRootTree: boolean;
	onChange(cb: Function): void;
}

export interface TreeitemBindingValue {
	isVeryFirstItem: boolean;
	isExpandable: boolean;
	isExpanded(): boolean;
	getRootElement(): CanUndef<HTMLElement>;
	toggleFold(el: Element, value?: boolean): void;
}

export interface ComboboxBindingValue {
	isMultiple: boolean;
	onChange(cb: Function): void;
	onOpen(cb: Function): void;
	onClose(cb: Function): void;
}
