/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/// <reference types="@v4fire/core"/>
/// <reference types="./build/stylus/ds"/>

declare const CSP_NONCE_STORE: string;

// eslint-disable-next-line camelcase
declare let __webpack_nonce__: CanUndef<string>;

declare const MODULE: string;
declare const PATH: Dictionary<CanUndef<string>>;
declare const TPLS: Dictionary<Dictionary<Function>>;

declare const COMPONENTS: Dictionary<{dependencies: string[]}>;
declare const BLOCK_NAMES: CanUndef<string[]>;
declare const DS: CanUndef<DesignSystem>;

declare const DS_COMPONENTS_MODS: CanUndef<{
	[name: string]: Nullable<Array<string | boolean | number>>;
}>;

interface RenderOptions {
	/** @default `'rootSelector'` */
	selectorToInject?: string;

	/** @default `'#root-component'` */
	rootSelector?: string;
}

interface HTMLImageElement {
	readonly init: Promise<this>;
	onInit(onSuccess: () => void, onFail?: (err?: Error) => void): void;
}

declare const INCLUDED_THEMES: CanUndef<string[]>;
declare const THEME: CanUndef<string>;
declare const ROOT_GLOBAL_NAME: string;

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
	constructor(callback: (entries: ResizeObserverEntry[]) => unknown);
	disconnect(): void;
	observe(target: Element, opts?: ResizeObserverObserveOptions): void;
	unobserve(target: Element): void;
}

declare class ResizeObserverEntry {
	readonly contentRect: DOMRectReadOnly;
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
	};
}

interface RenderContentFn {
	(props: Dictionary): string;
}

interface RenderParams {
	/**
	 * Component attrs
	 */
	attrs: Dictionary;

	/** @see [[RenderContent]] */
	content?: Dictionary<RenderContent | RenderContentFn | string>;
}

/**
 * Content to render into an element
 *
 * @example
 *
 * ```typescript
 * globalThis.renderComponents('b-button', {
 *   attrs: {
 *      testProp: 1
 *   },
 *
 *   content: {
 *     default: {
 *       tag: 'b-button',
 *       content: {
 *         default: 'Test'
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * This schema is the equivalent of such a template:
 *
 * ```ss
 * < b-button :testProp = 1
 *   < b-button
 *     Test
 * ```
 */
interface RenderContent {
	/**
	 * Component name or tagName
	 */
	tag: string;

	/**
	 * Component attrs
	 */
	attrs: Dictionary;

	/** @see [[RenderContent]] */
	content?: Dictionary<RenderContent | RenderContentFn | string>;
}

// eslint-disable-next-line no-var,vars-on-top
declare var
	/**
	 * Renders specified components
	 *
	 * @param componentName
	 * @param scheme
	 * @param options
	 */
	renderComponents: (componentName: string, scheme: RenderParams[], options?: RenderOptions) => void,

	/**
	 * Removes all components created via `globalThis.renderComponents`
	 */
	removeCreatedComponents: () => void;
