/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable no-var, vars-on-top, camelcase, @typescript-eslint/triple-slash-reference */

/// <reference types="@v4fire/core"/>
/// <reference path="./ts-definitions/playwright.d.ts"/>
/// <reference path="./ts-definitions/stylus-ds.d.ts"/>

declare let __webpack_nonce__: CanUndef<string>;
declare let __webpack_public_path__: CanUndef<string>;
declare let __webpack_require__: (moduleId: string) => any;

declare const BUILD_MODE: CanUndef<string>;

declare const CSP_NONCE_STORE: string;
declare const LANG_PACKS: string;

declare const SSR: boolean;
declare const HYDRATION: boolean;
declare const MODULE: string;

declare const PATH: Dictionary<CanUndef<string>>;
declare const PUBLIC_PATH: CanUndef<string>;

declare const COMPONENTS: Dictionary<{parent: string; dependencies: string[]}>;
declare const TPLS: Dictionary<Dictionary<Function>>;
declare const BLOCK_NAMES: CanUndef<string[]>;

declare const THEME: CanUndef<string>;
declare const THEME_ATTRIBUTE: CanUndef<string>;
declare const AVAILABLE_THEMES: CanUndef<string[]>;

declare const DS: CanUndef<DesignSystem>;
declare const DS_COMPONENTS_MODS: CanUndef<{
	[name: string]: Nullable<Array<string | boolean | number>>;
}>;

interface HTMLImageElement {
	readonly init: Promise<this>;
	onInit(onSuccess: () => void, onFail?: (err?: Error) => void): void;
}

interface Event {
	delegateTarget?: Element;
}

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

interface IntersectionObserver {
	delay?: number;
	trackVisibility?: boolean;
}

type RenderComponentsScheme = RenderComponentsVnodeParams[] | string;

interface RenderComponentsVnodeDescriptor extends RenderComponentsVnodeParams {
	/**
	 * A simple tag name or component name
	 */
	type: string;
}

interface RenderComponentsVnodeParams<A extends object = Dictionary> {
	/**
	 * A dictionary with attributes to pass to the created VNode
	 */
	attrs?: A;

	/**
	 * An array of children VNode descriptors or dictionary with slot functions
	 */
	children?: VNodeChildren;
}

type VNodeChild = string | RenderComponentsVnodeDescriptor;

type VNodeChildren =
	VNodeChild[] |
	Dictionary<CanArray<VNodeChild> | ((...args: any[]) => CanArray<VNodeChild>)>;

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
