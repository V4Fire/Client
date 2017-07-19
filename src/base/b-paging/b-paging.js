'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { field, watch } from 'super/i-block/i-block';
import { component } from 'core/component';
import Store from 'core/store';

export const
	$$ = new Store();

@component()
export default class bPaging extends iBlock {
	/**
	 * Initial count of pages
	 */
	@watch('setStripInView', {immediate: true})
	count: number = 0;

	/**
	 * Initial current page
	 */
	currentProp: ?number;

	/**
	 * Visible strip length
	 */
	stripLength: number = 5;

	/**
	 * Visible strip start
	 * @private
	 */
	@field()
	_stripStart: number;

	/**
	 * Visible paging strip
	 */
	@field()
	strip: ?Array;

	/**
	 * Current page field
	 */
	@watch('setStripInView', {immediate: true})
	@field((o) => o.link('currentProp'))
	currentStore: number;

	/**
	 * List of advanced pages (for dropdown)
	 */
	@field()
	advPages: Array;

	/**
	 * Current page current
	 */
	get current(): number {
		return this.currentStore;
	}

	/**
	 * Sets the page current
	 */
	set current(value: number) {
		this.currentStore = value;
	}

	/**
	 * Page count number
	 */
	get pageCount(): number {
		return this.count;
	}

	/**
	 * Calculates pages for the dropdown select
	 */
	getDropdownPages(): Array<Object> {
		const
			full = Number.range(1, this.pageCount).toArray(),
			options = full.subtract(this.strip);

		return options.map((el) => ({label: el, value: el}));
	}

	/**
	 * Calculates visible strip
	 */
	setStripInView(): Array<number> {
		let
			end = this.current;

		if (end - this.stripLength > 0) {
			this._stripStart = end + 1 - this.stripLength;

		} else {
			this._stripStart = 1;
			end = this.stripLength > this.pageCount ? this.pageCount : this.stripLength;
		}

		const
			start = this.pageCount <= this.stripLength ? 1 : this._stripStart;

		this.strip = Number.range(start, end).toArray();
		this.advPages = this.getDropdownPages();

		return this.strip;
	}

	/**
	 * Checks switch available
	 * @param value - switch direction -1 || 1
	 */
	isSwitch(value: number): boolean {
		return value > 0 ? this.current < this.pageCount : this.current > 1;
	}

	/**
	 * Handler: page trigger
	 *
	 * @param e
	 * @emits actionChange(value: number)
	 */
	onPageClick(e: Event) {
		this.current = Number(e.delegateTarget.textContent);
		this.emit('actionChange', this.current);
	}

	/**
	 * Handler: page switch
	 *
	 * @param skip - count of skipping days
	 * @emits actionChange(value: number)
	 */
	onSwitchPage(skip: number) {
		if (this.isSwitch(skip)) {
			this.current = this.current + skip;
			this.emit('actionChange', this.current);
		}
	}

	/**
	 * Handler: select page change
	 * @emits actionChange(value: number)
	 */
	async onSelectChange(el: bSelect, value) {
		this.current = Number(value);
		this.emit('actionChange', this.current);
		await el.clear();
	}

	/**
	 * Handler: fast-passage trigger
	 *
	 * @param edge - edge of pages -1 || 1
	 * @emits actionChange(value: number)
	 */
	onFastJump(edge: number) {
		if (this.isSwitch(edge)) {
			this.current = edge > 0 ? this.pageCount : 1;
			this.emit('actionChange', this.current);
		}
	}

	/** @inheritDoc */
	mounted() {
		this.async.on(this.$el, 'click', {
			label: $$.pageSelection,
			fn: this.delegateElement('page', this.onPageClick)
		});
	}
}
