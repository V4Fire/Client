/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iMessage, { component, prop, wait, hook } from 'super/i-message/i-message';
export * from 'super/i-message/i-message';

export const
	$$ = symbolGenerator();

@component({functional: true})
export default class bImage extends iMessage {
	/**
	 * Target image src
	 */
	@prop({type: String, watch: {fn: 'initOverlay', immediate: true}})
	readonly src!: string;

	/** @override */
	protected readonly $refs!: {
		img: HTMLImageElement;
	};

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
	 * @emits loadError
	 */
	protected onImageError(): void {
		this.setMod('progress', false);
		this.setMod('showError', true);
		this.emit('loadError');
	}

	/** @override */
	protected initCloseHelpers(): void {
		return;
	}

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
	 * Caches and destroys an image content
	 */
	@hook('beforeDestroy')
	protected destroyImage(): void {
		const {img} = this.$refs;

		if (img.innerHTML) {
			this.tmp[this.src] = img.innerHTML;
		}

		img.innerHTML = '';
	}
}
