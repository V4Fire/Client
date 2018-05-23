/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import bScrollInline from 'base/b-scroll/b-scroll-inline/b-scroll-inline';
import bInput, { component, prop, system, p, wait, watch, ModsDecl } from 'form/b-input/b-input';
export * from 'form/b-input/b-input';

export const
	$$ = symbolGenerator();

@component({
	functional: {
		limit: undefined
	}
})

export default class bTextarea<T extends Dictionary = Dictionary> extends bInput<T> {
	/**
	 * Row count for extending
	 */
	@prop(Number)
	readonly extRowCount: number = 1;

	/**
	 * Textarea height
	 */
	@p({cache: false})
	get height(): CanPromise<number> {
		return this.waitStatus('ready', () => {
			const
				{input} = this.$refs,
				s = getComputedStyle(this.$refs.input);

			return input.scrollHeight - Number.parseFloat(s.paddingTop || '') - Number.parseFloat(s.paddingBottom || '');
		});
	}

	/**
	 * Maximum component height
	 */
	@p({cache: false})
	get maxHeight(): CanPromise<number> {
		return this.waitStatus('ready', () => {
			const s = getComputedStyle(this.$refs.superWrapper);
			return Number.parseFloat(s.maxHeight || '') -
				Number.parseFloat(s.paddingTop || '') -
				Number.parseFloat(s.paddingBottom || '');
		});
	}

	/**
	 * Height of a newline
	 */
	get newlineHeight(): CanPromise<number> {
		return this.waitStatus('ready', () =>
			Number.parseFloat(getComputedStyle(this.$refs.input).lineHeight || '') || 10);
	}

	/**
	 * Number of remaining characters
	 */
	get limit(): number | undefined {
		if (this.maxlength === undefined) {
			return;
		}

		return this.maxlength - this.value.length;
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		collapsed: [
			'true',
			['false']
		]
	};

	/**
	 * Minimum component height
	 */
	@system()
	protected minHeight?: number;

	/** @override */
	// @ts-ignore
	protected readonly $refs!: {
		superWrapper: HTMLElement;
		scroll: bScrollInline;
		input: HTMLTextAreaElement;
	};

	/**
	 * Calculates the component height
	 */
	@wait('ready', {label: $$.calcHeight, defer: true})
	async calcHeight(): Promise<number | void> {
		const
			{input, scroll} = this.$refs,
			{length} = this.value;

		if (input.scrollHeight <= input.clientHeight) {
			if (input.clientHeight > <number>this.minHeight && (this.prevValue || '').length > length) {
				return this.minimize();
			}

			return;
		}

		const
			isEnd = input.value.length === input.selectionEnd,
			[height, maxHeight, newlineHeight] = await Promise.all([this.height, this.maxHeight, this.newlineHeight]);

		const
			newHeight = height + (this.extRowCount - 1) * newlineHeight,
			fixedNewHeight = newHeight < maxHeight ? newHeight : maxHeight;

		input.style.height = newHeight.px;
		await scroll.setHeight(fixedNewHeight);

		/* eslint-disable no-extra-parens */

		if (isEnd && height !== fixedNewHeight && (await scroll.scrollOffset).top) {
			await scroll.setScrollerPosition({y: 'bottom'});
		}

		/* eslint-enable no-extra-parens */

		return fixedNewHeight;
	}

	/**
	 * Minimizes the component
	 */
	@wait('ready', {label: $$.minimize, defer: true})
	protected async minimize(): Promise<number> {
		const
			{input, scroll} = this.$refs;

		const
			val = this.value,
			[minHeight, maxHeight]: [any, number] = await Promise.all([this.minHeight, this.maxHeight]);

		let newHeight = await this.calcTextHeight();
		newHeight = newHeight < minHeight ? minHeight : newHeight;
		input.style.height = val ? newHeight.px : '';

		if (maxHeight) {
			return scroll.setHeight(newHeight < maxHeight ? newHeight : maxHeight);
		}

		return scroll.setHeight(newHeight);
	}

	/**
	 * Returns real textarea height
	 */
	@wait('ready')
	protected calcTextHeight(): CanPromise<number> {
		const
			{input} = this.$refs;

		const
			tmp = <HTMLElement>this.$el.cloneNode(true),
			tmpInput = <HTMLTextAreaElement>tmp.querySelector(this.block.getElSelector('input'));

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

		(<any>document.body).append(tmp);
		const height = tmpInput.scrollHeight;
		tmp.remove();

		return height;
	}

	/**
	 * Synchronization for the valueStore field
	 * @param [value]
	 */
	@watch('valueStore')
	protected async syncValueStoreWatcher(value: string): Promise<void> {
		await this.calcHeight();
	}

	/** @override */
	protected async mounted(): Promise<void> {
		await super.mounted();
		await this.putInStream(async () => {
			this.minHeight = this.$refs.input.clientHeight;
			await this.calcHeight();
		});
	}
}
