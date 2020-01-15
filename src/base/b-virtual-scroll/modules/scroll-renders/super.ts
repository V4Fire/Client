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

export default class SuperRender {
	/**
	 * Component instance
	 */
	protected component: bVirtualScroll;

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
	 * @param component
	 */
	constructor(component: bVirtualScroll) {
		this.component = component;
	}
}
