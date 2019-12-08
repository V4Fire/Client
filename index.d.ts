/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/// <reference types="@v4fire/core"/>

declare let READY_STATE: number;

declare const GLOBAL_NONCE: unknown;
declare const MODULE_DEPENDENCIES: string;
declare const PATH: Dictionary<CanUndef<string>>;
declare const TPLS: Dictionary<Dictionary<Function>>;

declare const BLOCK_NAMES: CanUndef<string[]>;
declare const DS: CanUndef<Dictionary>;
declare const DS_COMPONENTS_MODS: CanUndef<string[]>;

interface HTMLImageElement {
	readonly init: Promise<this>;
	onInit(onSuccess: () => void, onFail?: (err?: Error) => void): void;
}

interface Event {
	delegateTarget?: Element;
}

interface BoxSize {
	readonly blockSize: number;
	readonly inlineSize: number;
}

interface ResizeObserverObserveOptions {
	box: 'content-box' | 'border-box';
}

declare class ResizeObserver {
<<<<<<< HEAD
	constructor(callback: (entries: ResizeObserverEntry[]) => unknown)
=======
	constructor(callback: (entries: ResizeObserverEntry[]) => unknown);
>>>>>>> e574395a86a38854faad768898dcd20e9945ad27
	disconnect(): void;
	observe(target: Element, opts?: ResizeObserverObserveOptions): void;
	unobserve(target: Element): void;
}

<<<<<<< HEAD

=======
>>>>>>> e574395a86a38854faad768898dcd20e9945ad27
declare class ResizeObserverEntry {
	readonly contentRect: DOMRect;
	readonly target: Element;
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

interface IntersectionObserverInit {
	delay?: number;
	trackVisibility?: boolean;
}

interface IntersectionObserver {
	delay?: number;
	trackVisibility?: boolean;
}

interface Document {
	fonts: {
		ready: Promise<void>;
	}
}
