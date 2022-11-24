/* eslint-disable no-var,camelcase */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/// <reference types="@v4fire/core"/>
/// <reference path="./ts-definitions/playwright.d.ts"/>
/// <reference path="./ts-definitions/stylus-ds.d.ts"/>

declare let __webpack_nonce__: CanUndef<string>;
declare let __webpack_public_path__: CanUndef<string>;
declare let __webpack_require__: (moduleId: string) => any;

declare const SSR: boolean;
declare const MODULE: string;
declare const CSP_NONCE_STORE: string;

declare var PATH: Dictionary<CanUndef<string>>;
declare var PUBLIC_PATH: CanUndef<string>;

declare const COMPONENTS: Dictionary<{dependencies: string[]}>;
declare const TPLS: Dictionary<Dictionary<Function>>;

declare const DS: CanUndef<DesignSystem>;
declare const BLOCK_NAMES: CanUndef<string[]>;

declare const DS_COMPONENTS_MODS: CanUndef<{
	[name: string]: Nullable<Array<string | boolean | number>>;
}>;

interface HTMLImageElement {
	readonly init: Promise<this>;
	onInit(onSuccess: () => void, onFail?: (err?: Error) => void): void;
}

/**
 * Default app theme
 * @see config/default.js
 */
declare const THEME: CanUndef<string>;

/**
 * Attribute name to set the theme value to the root element
 * @see config/default.js
 */
declare const THEME_ATTRIBUTE: CanUndef<string>;

/**
 * A list of available app themes
 * @see config/default.js
 */
declare const AVAILABLE_THEMES: CanUndef<string[]>;

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

type RenderComponentsScheme = RenderComponentsVnodeParams[] | string;

interface RenderComponentsVnodeDescriptor extends RenderComponentsVnodeParams {
	/**
	 * A simple tag name or component name
	 */
	type: string;
}

interface RenderComponentsVnodeParams {
	/**
	 * A dictionary with attributes to pass to the created VNode
	 */
	attrs?: Dictionary;

	/**
	 * An array of children VNode descriptors or dictionary with slot functions
	 */
	children?: VNodeChildren;
}

type VNodeChild = string | RenderComponentsVnodeDescriptor;

type VNodeChildren =
	VNodeChild[] |
	Dictionary<CanArray<VNodeChild> | ((...args: any[]) => CanArray<VNodeChild>)>;

// eslint-disable-next-line no-var,vars-on-top
declare var
	/**
	 * Renders the specified components.
	 * This function should only be used when writing tests.
	 *
	 * @param componentName
	 * @param scheme
	 */
	renderComponents: (componentName: string, scheme: RenderComponentsScheme) => void,

	/**
	 * Removes all components created via `globalThis.renderComponents`.
	 * This function should only be used when writing tests.
	 */
	removeCreatedComponents: () => void,

	/**
	 * Requires a module by the specified path.
	 * This function should only be used when writing tests.
	 */
	importModule: (path: string) => any;

interface TouchGesturesCreateOptions {
	/**
	 * An element to dispatch the event
	 */
	dispatchEl: Element | string;

	/**
	 * An element to be provided as the target in the dispatched event
	 */
	targetEl: Element | string;

	/**
	 * Delay between steps
	 * @default `5`
	 */
	pause?: number;
}

interface TouchGesturePoint extends Partial<TouchGesturesCreateOptions> {
	x: number;
	y: number;
}
