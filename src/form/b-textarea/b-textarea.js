'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import bInput from 'form/b-input/b-input';
import { params, wait } from 'super/i-block/i-block';
import { component } from 'core/component';

export const
	$$ = new Store();

@component()
export default class bTextarea extends bInput {
	/**
	 * Row count for extending
	 */
	extRowCount: number = 1;

	/** @override */
	get $refs(): {superWrapper: Element, scroll: bScrollInline, input: HTMLTextAreaElement} {}

	/** @inheritDoc */
	static mods = {
		collapsed: [
			'true',
			['false']
		]
	};

	/** @inheritDoc */
	async $$valueStore() {
		await this.calcHeight();
	}

	/**
	 * Textarea height
	 */
	@params({cache: false})
	get height(): number {
		return this.waitState('ready', () => {
			const
				{input} = this.$refs,
				s = getComputedStyle(this.$refs.input);

			return input.scrollHeight - Number.parseFloat(s.paddingTop) - Number.parseFloat(s.paddingBottom);
		});
	}

	/**
	 * Maximum block height
	 */
	@params({cache: false})
	get maxHeight(): number {
		return this.waitState('ready', () => {
			const s = getComputedStyle(this.$refs.superWrapper);
			return Number.parseFloat(s.maxHeight) - Number.parseFloat(s.paddingTop) - Number.parseFloat(s.paddingBottom);
		});
	}

	/**
	 * Height of a newline
	 */
	get newlineHeight(): number {
		return this.waitState('ready', () => Number.parseFloat(getComputedStyle(this.$refs.input).lineHeight) || 10);
	}

	/**
	 * Number of remaining characters
	 */
	get limit(): number {
		return this.maxlength - this.value.length;
	}

	/**
	 * Calculates the block height
	 */
	@wait('ready', {label: $$.calcHeight, defer: true})
	async calcHeight(): ?number {
		const
			{input, scroll} = this.$refs,
			{length} = this.value;

		if (input.scrollHeight <= input.clientHeight) {
			if (input.clientHeight > this.minHeight && (this.prevValue || '').length > length) {
				return this.minimize();
			}

			return;
		}

		const
			isEnd = input.value.length === input.selectionEnd,
			{height, maxHeight} = this;

		const
			newHeight = this.height + (this.extRowCount - 1) * this.newlineHeight,
			fixedNewHeight = newHeight < maxHeight ? newHeight : maxHeight;

		input.style.height = newHeight.px;
		await scroll.heightSetter(fixedNewHeight);

		/* eslint-disable no-extra-parens */

		if (isEnd && height !== fixedNewHeight && await (scroll.scrollOffset).top) {
			await scroll.setScrollerPosition({y: 'bottom'});
		}

		/* eslint-enable no-extra-parens */

		return fixedNewHeight;
	}

	/**
	 * Returns real textarea height
	 */
	@wait('ready')
	calcTextHeight(): Promise<number> | number {
		const
			{input} = this.$refs;

		const
			tmp = this.$el.cloneNode(true),
			tmpInput = tmp.query(this.block.getElSelector('input'));

		tmpInput.value = input.value;
		Object.assign(tmpInput.style, {
			width: input.clientWidth.px,
			height: 'auto'
		});

		Object.assign(tmp.style, {
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'z-index': -1
		});

		document.body.append(tmp);
		const height = tmpInput.scrollHeight;
		tmp.remove();

		return height;
	}

	/**
	 * Minimizes the block
	 */
	@wait('ready', {label: $$.minimize, defer: true})
	async minimize(): number {
		const
			{input, scroll} = this.$refs;

		const
			val = this.value,
			{maxHeight} = this;

		let newHeight = await this.calcTextHeight();
		newHeight = newHeight < this.minHeight ? this.minHeight : newHeight;
		input.style.height = val ? newHeight.px : '';

		if (maxHeight) {
			return scroll.heightSetter(newHeight < maxHeight ? newHeight : maxHeight);
		}

		return scroll.heightSetter(newHeight);
	}

	/** @inheritDoc */
	async mounted() {
		await this.putInStream(async () => {
			this.minHeight = this.$refs.input.clientHeight;
			await this.calcHeight();
		});
	}
}
