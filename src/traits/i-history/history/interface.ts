/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface Content {
	el: Element;
	initBoundingRect: CanUndef<DOMRect>;
	trigger?: HTMLElement;
}

export interface Title {
	el: Nullable<Element>;
	initBoundingRect: CanUndef<DOMRect>;
}

export interface Page {
	content: Content;
	title: Title;
}

export interface HistoryItem {
	stage: string;
	options: CanUndef<Dictionary>;
	content?: Content;
	title?: Title;
}

export interface HistoryConfig {
	pageTriggers: boolean;
	triggerAttr: string;
	titleThreshold: number;
}

export type TransitionType =
	'back' |
	'push';

export interface Transition {
	type: TransitionType;
	page: HistoryItem;
}
