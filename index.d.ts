/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/// <reference types="@v4fire/core"/>
/// <reference types="dom4"/>

declare let READY_STATE: number;
declare let CONFIG: Record<string, any>;
declare let PATH: Record<string, string | undefined>;
declare let API: string;

interface HTMLImageElement {
	onInit(onSuccess: () => void, onFail?: (err?: Error) => void): void;
}

declare let ModuleDependencies: {
	cache: Record<string, any>;
	event: {on: Function; once: Function; off: Function};
	add(moduleName: string, dependencies: string[]): void;
	get(module: string): Promise<string[]>;
};

interface Element {
	getPosition(): {top: number; left: number};
	getIndex(): number;
}

interface Node {
	getOffset(parent?: Element | string): {top: number; left: number};
}
