/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import symbolGenerator from 'core/symbol';
import bSelect from 'form/b-select/b-select';
import iBlock, { prop, field, p, component } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

export interface Page {
	label: string;
	value: number;
}

export const
	$$ = symbolGenerator();

@component()
export default class bPaging extends iBlock {
	/**
	 * Initial count of pages
	 */
	@prop(Number)
	readonly count: number = 0;

	/**
	 * Initial current page
	 */
	@prop(Number)
	readonly currentProp!: number;

	/**
	 * Visible strip length
	 */
	@prop(Number)
	readonly stripLength: number = 5;

	/**
	 * Visible strip start
	 */
	@field()
	protected stripStart!: number;

	/**
	 * Visible paging strip
	 */
	@field()
	protected strip!: number[];

	/**
	 * Current page field
	 */
	@field((o) => o.link('currentProp'))
	protected currentStore!: number;

	/**
	 * List of advanced pages (for dropdown)
	 */
	@field()
	protected advPages!: Page[];

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
	protected getDropdownPages(): Page[] {
		const
			full = <number[]>Number.range(1, this.pageCount).toArray(),
			strip = new Set(this.strip),
			options = $C(full).filter((el) => !strip.has(el)).map();

		return $C(options as number[]).to([] as Page[]).map((value) => ({label: String(value), value}));
	}

	/**
	 * Calculates the visible strip
	 */
	@p({watch: ['currentStore', 'count'], watchParams: {immediate: true}})
	protected setStripInView(): number[] {
		let
			end = this.current;

		if (end - this.stripLength > 0) {
			this.stripStart = end + 1 - this.stripLength;

		} else {
			this.stripStart = 1;
			end = this.stripLength > this.pageCount ? this.pageCount : this.stripLength;
		}

		const
			start = this.pageCount <= this.stripLength ? 1 : this.stripStart;

		this.strip = Number.range(start, end).toArray();
		this.advPages = this.getDropdownPages();

		return this.strip;
	}

	/**
	 * Checks switch available
	 * @param value - switch direction -1 || 1
	 */
	protected isSwitch(value: number): boolean {
		return value > 0 ? this.current < this.pageCount : this.current > 1;
	}

	/**
	 * Handler: page trigger
	 *
	 * @param e
	 * @emits actionChange(value: number)
	 */
	protected onPageClick(e: Event): void {
		this.current = e.delegateTarget ? Number(e.delegateTarget.textContent) : 0;
		this.emit('actionChange', this.current);
	}

	/**
	 * Handler: page switch
	 *
	 * @param skip - count of skipping days
	 * @emits actionChange(value: number)
	 */
	protected onSwitchPage(skip: number): void {
		if (this.isSwitch(skip)) {
			this.current = this.current + skip;
			this.emit('actionChange', this.current);
		}
	}

	/**
	 * Handler: select page change
	 * @emits actionChange(value: number)
	 */
	protected async onSelectChange(el: bSelect, value: string): Promise<void> {
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
	protected onFastJump(edge: number): void {
		if (this.isSwitch(edge)) {
			this.current = edge > 0 ? this.pageCount : 1;
			this.emit('actionChange', this.current);
		}
	}

	/** @override */
	protected async mounted(): Promise<void> {
		super.mounted();
		this.async.on(this.$el, 'click', await this.delegateElement('page', this.onPageClick), {
			label: $$.pageSelection
		});
	}
}
