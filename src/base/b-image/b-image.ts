/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:base/b-image/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import { getSrcSet } from 'core/html';
import type { TaskCtx } from 'core/async';

import iProgress from 'traits/i-progress/i-progress';
import iVisible from 'traits/i-visible/i-visible';

import iBlock, { component, prop, hook, wait, ModsDecl } from 'super/i-block/i-block';
import type { SizeType } from 'base/b-image/interface';

export * from 'super/i-block/i-block';
export * from 'base/b-image/interface';

export const
	$$ = symbolGenerator();

@component({functional: {}})
export default class bImage extends iBlock implements iProgress, iVisible {
	/** @override */
	readonly rootTag: string = 'span';

	/** @override */
	rootAttrs: Dictionary = {
		role: 'img',
		'aria-label': 'alt'
	};

	/**
	 * Image src (a fallback if `srcset` provided)
	 */
	@prop({
		type: String,
		watch: {handler: 'init', immediate: true}
	})

	readonly src: string = '';

	/**
	 * Image `srcset` attribute
	 */
	@prop({type: Object, required: false})
	readonly srcset?: Dictionary<string>;

	/**
	 * Image `sizes` attribute
	 */
	@prop({type: String, required: false})
	readonly sizes?: string;

	/**
	 * Alternate text for the image
	 */
	@prop({type: String, required: false})
	readonly alt?: string;

	/**
	 * Image background size type
	 */
	@prop(String)
	readonly sizeType: SizeType = 'contain';

	/**
	 * Image background position
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
	 * Parameters for an overlay image
	 * (when the image is loading)
	 */
	@prop({type: [String, Object], required: false})
	readonly overlayImg?: string | Dictionary;

	/**
	 * Parameters for a broken image
	 * (when the image loading was failed)
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
	 * Initializes the image loading process
	 */
	@wait('ready', {label: $$.init})
	protected init(): CanPromise<void> {
		const
			tmpSrc = <CanUndef<string>>this.tmp[this.src];

		if (tmpSrc != null) {
			this.updateHeight(tmpSrc);
			this.onImageLoadSuccess(tmpSrc);
			return;
		}

		void this.setMod('progress', true);

		const img = new Image();
		img.src = this.src;

		if (this.srcset) {
			img.srcset = getSrcSet(this.srcset);
		}

		if (this.sizes != null) {
			img.sizes = this.sizes;
		}

		if (this.alt != null) {
			img.alt = this.alt;
		}

		this.updateHeight(img);

		this.async
			.promise(img.init, {label: $$.loadImage})
			.then(() => this.onImageLoadSuccess(img), this.onImageLoadFailed.bind(this));
	}

	/**
	 * Updates an image height according to its ratio
	 * @param img
	 */
	protected updateHeight(img: HTMLImageElement | string): void {
		const
			{img: imgRef} = this.$refs;

		let
			tmpPadding = this.tmp[`${this.src}-padding`];

		if (!Object.isTruly(tmpPadding)) {
			if (this.ratio != null && this.ratio !== 0) {
				tmpPadding = `${(1 / this.ratio) * 100}%`;

			} else if (!Object.isString(img) && this.ratio !== 0) {
				tmpPadding = '100%';

			} else {
				tmpPadding = '';
			}
		}

		Object.assign(imgRef.style, Object.isTruly(tmpPadding) ?
			{paddingBottom: tmpPadding} :
			{height: '100%'});
	}

	/**
	 * Updates an image ratio according to its height and width
	 * @param img
	 */
	protected updateCalculatedImageRatio(img: HTMLImageElement): void {
		const
			{img: imgRef} = this.$refs;

		if (img.naturalHeight !== 0 || img.naturalWidth !== 0) {
			const ratio = img.naturalHeight === 0 ? 1 : img.naturalWidth / img.naturalHeight;
			imgRef.style.paddingBottom = `${(1 / ratio) * 100}%`;
		}
	}

	/**
	 * Saves image styles to the cache
	 */
	@hook('beforeDestroy')
	@wait('loading', {label: $$.memoizeImage})
	protected memoizeImage(): CanPromise<void> {
		const
			{img} = this.$refs;

		if (Object.isTruly(img.style.backgroundImage)) {
			this.tmp[this.src] = img[$$.img];
			this.tmp[`${this.src}-padding`] = img.style.paddingBottom;
		}
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iProgress.initModEvents(this);
		iVisible.initModEvents(this);
	}

	/**
	 * Handler: image loading has successfully completed
	 *
	 * @param img
	 * @emits `loadSuccess()`
	 */
	protected onImageLoadSuccess(img: HTMLImageElement | string): void {
		let
			cssImg = '';

		if (!Object.isString(img)) {
			if (this.ratio == null) {
				this.updateCalculatedImageRatio(img);
			}

			const
				// IE has no currentSrc in HTMLImageElement so its type from lib.dom.d.ts is incorrect
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				imgUrl = img.currentSrc ?? img.src;

			cssImg = `url("${imgUrl}")`;

		} else {
			cssImg = img;
		}

		const
			{img: imgRef} = this.$refs;

		void this.setMod('progress', false);
		void this.setMod('showError', false);

		imgRef[$$.img] = cssImg;
		Object.assign(imgRef.style, {
			backgroundImage: Array.concat([], this.beforeImg, cssImg, this.afterImg).join(','),
			backgroundSize: this.sizeType,
			backgroundPosition: this.position
		});

		this.emit('loadSuccess');
	}

	/**
	 * Handler: image loading has failed
	 *
	 * @param err
	 * @emits `loadFail(err: Error)`
	 */
	protected onImageLoadFailed(err: CanUndef<Error | TaskCtx>): void {
		void this.setMod('progress', false);

		if (err && 'type' in err && err.type === 'clearAsync') {
			return;
		}

		void this.setMod('showError', true);
		this.emitError('loadFail', err);
	}

	/** @override */
	protected beforeDestroy(): void {
		this.$refs.img.style.backgroundImage = '';
		super.beforeDestroy();
	}
}
