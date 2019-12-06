/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import { AsyncCtx } from 'core/async';
import { getSrcSet } from 'core/html';

import iProgress from 'traits/i-progress/i-progress';
import iVisible from 'traits/i-visible/i-visible';

import iBlock, { component, prop, wait, hook, ModsDecl } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

export type SizeType =
	'cover' |
	'contain';

export const
	$$ = symbolGenerator();

@component({functional: {}})
export default class bImage extends iBlock implements iProgress, iVisible {
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
	@prop(String)
	readonly sizeType: SizeType = 'contain';

	/**
	 * Image position
	 */
	@prop(String)
	readonly position: string = '50% 50%';

	/**
	 * Image aspect ratio
	 */
	@prop({type: Number, required: false})
	readonly ratio?: number;

	/**
	 * Style (backgroundImage) before the image background
	 */
	@prop({type: [String, Array], required: false})
	readonly beforeImg?: CanArray<string>;

	/**
	 * Style (backgroundImage) after the image background
	 */
	@prop({type: [String, Array], required: false})
	readonly afterImg?: CanArray<string>;

	/**
	 * Parameters for a overlay image
	 */
	@prop({type: [String, Object], required: false})
	readonly overlayImg?: string | Dictionary;

	/**
	 * Parameters for a broken image
	 */
	@prop({type: [String, Object], required: false})
	readonly brokenImg?: string | Dictionary;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iProgress.mods,
		...iVisible.mods,

		showError: [
			'true',
			'false'
		]
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
			tmpSrc = <CanUndef<string>>this.tmp[this.src];

		if (tmpSrc) {
			this.updateHeight(tmpSrc);
			this.onImageLoaded(tmpSrc);
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

		this.updateHeight(img);

		this.async
			.promise(img.init, {label: $$.loadImage})
			.then(() => this.onImageLoaded(img), this.onError);
	}

	/**
	 * Sets an image's height according to its ratio
	 * @param img
	 */
	protected updateHeight(img: HTMLImageElement | string): void {
		const
			{img: imgRef} = this.$refs;

		let
			tmpPadding = this.tmp[`${this.src}-padding`];

		if (!tmpPadding) {
			if (this.ratio) {
				tmpPadding = `${(1 / this.ratio) * 100}%`;

			} else if (!Object.isString(img) && this.ratio !== 0) {
				tmpPadding = `${(1 / this.computeRatio(img)) * 100}%`;

			} else {
				tmpPadding = '';
			}
		}

		Object.assign(imgRef.style, tmpPadding ?
			{paddingBottom: tmpPadding} :
			{height: '100%'}
		);
	}

	/**
	 * Calculates the specified image aspect ratio
	 * @param img
	 */
	protected computeRatio(img: CanUndef<HTMLImageElement>): number {
		const
			{naturalHeight = 0, naturalWidth = 0} = img || {};

		if (naturalHeight || naturalWidth) {
			return naturalHeight === 0 ? 1 : naturalWidth / naturalHeight;
		}

		return 1;
	}

	/**
	 * Saves image content within a cache and destroys it
	 */
	@hook('beforeDestroy')
	@wait('loading')
	protected destroyImage(): CanPromise<void> {
		const
			{img} = this.$refs;

		if (img.style.backgroundImage) {
			this.tmp[this.src] = img[$$.img];
			this.tmp[`${this.src}-padding`] = img.style.paddingBottom;
		}

		img.style.backgroundImage = '';
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
	 * @emits loadSuccess()
	 */
	protected onImageLoaded(img: HTMLImageElement | string): void {
		const
			{img: imgRef} = this.$refs,
			cssImg = Object.isString(img) ? img : `url("${img.currentSrc}")`;

		this.setMod('progress', false);
		this.setMod('showError', false);

		imgRef[$$.img] = cssImg;
		Object.assign(imgRef.style, {
			backgroundImage: (<string[]>[]).concat(this.beforeImg || [], cssImg, this.afterImg || []).join(','),
			backgroundSize: this.sizeType,
			backgroundPosition: this.position
		});

		this.emit('loadSuccess');
	}

	/**
	 * Handler: image load error
	 *
	 * @param err
	 * @emits loadFail()
	 */
	protected onError(err: Error | AsyncCtx): void {
		this.setMod('progress', false);

		if ('type' in err && err.type === 'clearAsync') {
			return;
		}

		this.setMod('showError', true);
		this.emitError('loadFail', err);
	}
}
