/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/// <reference types="@v4fire/core"/>

declare let READY_STATE: number;
declare const MODULE_DEPENDENCIES: string;
declare const PATH: Dictionary<CanUndef<string>>;
declare const TPLS: Dictionary<Dictionary<Function>>;

interface Blob {
	mozSlice(start?: number, end?: number, type?: string): Blob;
	webkitSlice(start?: number, end?: number, type?: string): Blob;
}

interface BlobBuilder {
	append(data: unknown, endings?: BlobPropertyBag['endings']): void;
	getBlob(type?: BlobPropertyBag['type']): Blob;
}

interface BlobBuilderConstructor {
	prototype: BlobBuilder;
	new(): BlobBuilder;
}

interface Window {
	Blob: typeof Blob;
	BlobBuilder?: BlobBuilderConstructor;
	WebKitBlobBuilder?: BlobBuilderConstructor;
	MozBlobBuilder?: BlobBuilderConstructor;
	MSBlobBuilder?: BlobBuilderConstructor;
	DataView: typeof DataView;
	webkitURL?: typeof URL;
}

interface HTMLImageElement {
	readonly init: Promise<this>;
	onInit(onSuccess: () => void, onFail?: (err?: Error) => void): void;
}

interface Event {
	delegateTarget?: Element;
}

declare class ResizeObserver {
	constructor(cb: Function)
	disconnect(el: Element): void;
	observe(el: Element): void;
	unobserve(el: Element): void;
}

declare let ModuleDependencies: {
	cache: Dictionary;
	event: {on: Function; once: Function; off: Function};
	add(moduleName: string, dependencies: string[]): void;
	get(module: string): Promise<string[]>;
};

interface ElementPosition {
	top: number;
	left: number;
}

interface Element {
	getPosition(): ElementPosition;
	getIndex(): number | null;
}

interface Node {
	getOffset(parent?: Element | string): ElementPosition;
}

interface Number {
	em: string;
	ex: string;
	px: string;
	per: string;
	rem: string;
	vh: string;
	vw: string;
	vmin: string;
	vmax: string;
}

declare const GLOBAL_NONCE: unknown;
