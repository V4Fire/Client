/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import iProgress from 'traits/i-progress/i-progress';
import iVisible from 'traits/i-visible/i-visible';

import iMessage, { component, prop, wait, hook, ModsDecl } from 'super/i-message/i-message';
export * from 'super/i-message/i-message';

export const
	$$ = symbolGenerator();

@component({functional: true})
export default class bImage extends iMessage implements iProgress, iVisible {
	/**
	 * Target image src
	 */
	@prop({type: String, watch: {fn: 'initOverlay', immediate: true}})
	readonly src!: string;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iProgress.mods,
		...iVisible.mods
	};

	/** @override */
	protected readonly $refs!: {
		img: HTMLImageElement;
	};

	/**
	 * Initializes an image loading process
	 */
	@wait('ready', {label: $$.initOverlay})
	protected initOverlay(): CanPromise<void> {
		const
			tempSrc = <CanUndef<string>>this.tmp[this.src];

		if (!tempSrc) {
			this.setMod('progress', true);

			const img = new Image();
			img.src = this.src;

			this.async
				.promise(img.init, {label: $$.loadImage})
				.then(() => this.onImageLoaded(img), this.onImageError);

			return;
		}

		this.$refs.img.innerHTML = tempSrc;
	}

	/**
	 * Saves image content within a cache and destroy it
	 */
	@hook('beforeDestroy')
	protected destroyImage(): void {
		const
			{img} = this.$refs;

		if (img.innerHTML) {
			this.tmp[this.src] = img.innerHTML;
		}

		img.innerHTML = '';
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}

	/**
	 * Handler: image loaded
	 *
	 * @param img
	 * @emits load
	 */
	protected onImageLoaded(img: HTMLImageElement): void {
		this.setMod('progress', false);
		this.setMod('showError', false);
		this.$refs.img.insertAdjacentElement('afterbegin', img);
		this.emit('load');
	}

	/**
	 * Handler: image load error
	 *
	 * @param err
	 * @emits loadError
	 */
	protected onImageError(err: Error): void {
		this.setMod('progress', false);
		this.setMod('showError', true);
		this.emit('loadError', err);
	}
}
