/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import Range from 'core/range';
import symbolGenerator from 'core/symbol';
import { is } from 'core/browser';

import bVirtualScroll, { $$ as componentLabels } from 'base/b-virtual-scroll/b-virtual-scroll';
import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import ScrollRequest from 'base/b-virtual-scroll/modules/scroll-request';

import {

	AnchoredItem,
	RenderItem,
	Size,
	ScrollRenderStatus,
	RenderedItems

} from 'base/b-virtual-scroll/modules/interface';

import { getHeightWithMargin, getRequestParams } from 'base/b-virtual-scroll/modules/helpers';

export const
	$$ = symbolGenerator();

export default class SuperRender {
	/**
	 * Component instance
	 */
	protected readonly component: bVirtualScroll;

	/**
	 * Async group
	 */
	protected readonly asyncGroup: string = 'scroll-render:';

	/**
	 * Async instance
	 */
	protected get async(): Async<bVirtualScroll> {
		return this.component.unsafe.async;
	}

	/**
	 * API for component DOM operations
	 */
	protected get dom(): bVirtualScroll['dom'] {
		return this.component.unsafe.dom;
	}

	/**
	 * Link to the component refs
	 */
	protected get refs(): bVirtualScroll['$refs'] {
		return this.component.unsafe.$refs;
	}

	/**
	 * Link to the scroll emitter
	 */
	protected get scrollEmitter(): HTMLElement {
		// @ts-ignore (access)
		return this.component.scrollEmitter;
	}

	/**
	 * @param component
	 */
	constructor(component: bVirtualScroll) {
		this.component = component;
	}

	/**
	 * Initializes events
	 */
	protected initEvents(): void {
		this.async.on(this.scrollEmitter, 'scroll', this.onScroll.bind(this), {
			label: $$.scroll,
			group: this.asyncGroup
		});
	}

	/**
	 * Handler: document being scrolled
	 */
	protected onScroll(): void {
		return undefined;
	}

	/**
	 * Handler: window resize
	 */
	protected onResize(): void {
		return undefined;
	}

	/**
	 * Handler: all requests are done
	 */
	protected onRequestsDone(): void {
		return undefined;
	}
}
