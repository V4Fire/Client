/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { getSrcSet } from 'core/html';

import iProgress from 'traits/i-progress/i-progress';
import iVisible from 'traits/i-visible/i-visible';
import iMessage, { component, prop, wait, hook, ModsDecl } from 'super/i-message/i-message';

export * from 'super/i-message/i-message';

export type SizeType =
	'cover' |
	'contain';

export const
	$$ = symbolGenerator();

@component({flyweight: true, functional: true})
export default class bImage extends iMessage implements iProgress, iVisible {
	/**
	 * Target image src (fallback if srcset provided)
	 */
	@prop({
		type: String,
		watch: {fn: 'initOverlay', immediate: true}
	})

	readonly src: string = '';

	/**
	 * Target images srcset
	 */
	@prop({type: Object, required: false})
	readonly srcset?: Dictionary<string>;

	/**
	 * Target sizes HTML attribute
	 */
	@prop({type: String, required: false})
	readonly sizes?: string;

	/**
	 * Alternate text
	 */
	@prop({type: String, required: false})
	readonly alt?: string;

	/**
	 * Background size type
	 */
	@prop({type: String})
	readonly sizeType: SizeType = 'contain';

	/**
	 * Image position
	 */
	@prop({type: String})
	readonly position: string = '50% 50%';

	/**
	 * Image aspect ratio
	 */
	@prop({type: Number, required: false})
	readonly ratio?: number;

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

		if (tempSrc) {
			this.onImageLoaded(tempSrc);
			return;
		}

		this.setMod('progress', true);

		const img = new Image();
		img.src = this.src;

		if (this.srcset) {
			img.srcset = getSrcSet(this.srcset);
		}

		if (this.sizes) {
			img.sizes = this.sizes;
		}

		if (this.alt) {
			img.alt = this.alt;
		}

		this.async
			.promise(img.init, {label: $$.loadImage})
			.then(() => this.onImageLoaded(img), this.onImageError);
	}

	/**
	 * Calculates image aspect ratio
	 * @param img
	 */
	protected computeRatio(img: HTMLImageElement): number {
		const
			{naturalHeight, naturalWidth} = img;

		if (naturalHeight || naturalWidth) {
			return naturalHeight === 0 ? 1 : naturalWidth / naturalHeight;
		}

		return 1;
	}

	/**
	 * Saves image content within a cache and destroys it
	 */
	@hook('beforeDestroy')
	protected destroyImage(): void {
		const
			{img} = this.$refs;

		if (img.style['background-image']) {
			this.tmp[this.src] = img.style['background-image'];
			this.tmp[`${this.src}-padding`] = img.style.paddingBottom;
		}

		img['background-image'] = '';
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
	protected onImageLoaded(img: HTMLImageElement | string): void {
		const
			{img: imgRef} = this.$refs,
			tmpPadding = this.tmp[`${this.src}-padding`];

		this.setMod('progress', false);
		this.setMod('showError', false);

		Object.assign(imgRef.style,
			{
				backgroundImage: Object.isString(img) ? img : `url("${img.currentSrc}")`,
				backgroundSize: this.sizeType,
				backgroundPosition: this.position
			},

			this.ratio ?
				{paddingBottom: Object.isString(img) ? String(tmpPadding) : this.getPadding(img)} :
				{height: '100%'}
		);

		this.emit('load');
	}

	/**
	 * Calculates the padding for emulating aspect ratio
	 * @param img
	 */
	protected getPadding(img: HTMLImageElement): string {
		return this.ratio !== undefined ?
			`${(1 / this.ratio) * 100}%` :
			`${(1 / this.computeRatio(img)) * 100}%`;
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
		this.emitError('loadError', err);
	}
}
