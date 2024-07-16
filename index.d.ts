/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable no-var, vars-on-top, @typescript-eslint/triple-slash-reference */

/// <reference types="@v4fire/core"/>
/// <reference path="./ts-definitions/playwright.d.ts"/>
/// <reference path="./ts-definitions/stylus-ds.d.ts"/>

declare module '*?raw' {
	const content: string;
	export default content;
}

declare var ssr: Nullable<{
	document?: Document;
}>;

declare const BUILD_MODE: CanUndef<string>;

declare const CSP_NONCE_STORE: string;
declare const LANG_PACKS: string;
declare const LANG_KEYSETS: Dictionary<string>;

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

/**
 * If set to true, the theme attribute will be processed by a proxy server, such as Nginx.
 * The proxy server will interpolate the theme value from a cookie or header to the theme attribute.
 * Otherwise, the theme attributes will be sourced from the JS runtime.
 */
declare const POST_PROCESS_THEME: CanUndef<boolean>;

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
	 * Auxiliary functions for building a component showcase
	 * @see https://storybook.js.org/
	 */
	V4Storybook: {
		/**
		 * Initializes the application within the Storybook's canvas
		 *
		 * @param canvasElement - the storybook canvas element
		 * @param [rootComponent] - the name of the root component to initialize
		 */
		initApp(canvasElement: HTMLElement, rootComponent?: string): Promise<import('./src/core/component').ComponentApp>;
	},

	/**
	 * Requires a module by the specified path.
	 * This function should only be used when writing tests.
	 */
	importModule: (path: string) => any,

	/**
	 * Jest mock API for test environment.
	 */
	jestMock: {
		/**
		 * Wrapper for jest `spyOn` function.
		 * @see https://jestjs.io/docs/mock-functions
		 */
		spy: import('jest-mock').ModuleMocker['spyOn'];

		/**
		 * Wrapper for jest `fn` function.
		 * @see https://jestjs.io/docs/mock-functions
		 */
		mock: import('jest-mock').ModuleMocker['fn'];
	};

/**
 * The results returned by a mock or spy function from `jestMock`.
 */
interface JestMockResult<VAL = any> {
	type: 'throw' | 'return';
	value: VAL;
}

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
