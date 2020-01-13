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

import iBlock, { component, prop, hook, wait, ModsDecl } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

export type SizeType =
	'cover' |
	'contain';

export const
	$$ = symbolGenerator();

@component({functional: {}})
export default class bImage extends iBlock implements iProgress, iVisible {
	/**
	 * Image src (fallback if srcset provided)
	 */
	@prop({
		type: String,
		watch: {fn: 'init', immediate: true}
	})

	readonly src: string = '';

	/**
	 * Image "srcset" attribute
	 */
	@prop({type: Object, required: false})
	readonly srcset?: Dictionary<string>;

	/**
	 * Image "sizes" attribute
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
	 * Initializes an image loading process
	 */
	@wait('ready', {label: $$.init})
	protected init(): CanPromise<void> {
		const
			tmpSrc = <CanUndef<string>>this.tmp[this.src];

		if (tmpSrc) {
			this.updateHeight(tmpSrc);
			this.onImageLoadSuccess(tmpSrc);
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
			.then(() => this.onImageLoadSuccess(img), this.onImageLoadFailed);
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

		if (!tmpPadding) {
			if (this.ratio) {
				tmpPadding = `${(1 / this.ratio) * 100}%`;

			} else if (!Object.isString(img) && this.ratio !== 0) {
				let
					ratio = 1;

				if (img && (img.naturalHeight || img.naturalWidth)) {
					ratio = img.naturalHeight === 0 ? 1 : img.naturalWidth / img.naturalHeight;
				}

				tmpPadding = `${(1 / ratio) * 100}%`;

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
	 * Saves an image style to the cache
	 */
	@hook('beforeDestroy')
	@wait('loading')
	protected memoizeImage(): CanPromise<void> {
		const
			{img} = this.$refs;

		if (img.style.backgroundImage) {
			this.tmp[this.src] = img[$$.img];
			this.tmp[`${this.src}-padding`] = img.style.paddingBottom;
		}
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}

	/**
	 * Handler: image loading successfully completed
	 *
	 * @param img
	 * @emits loadSuccess()
	 */
	protected onImageLoadSuccess(img: HTMLImageElement | string): void {
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
	 * Handler: image loading failed
	 *
	 * @param err
	 * @emits loadFail()
	 */
	protected onImageLoadFailed(err: CanUndef<Error | AsyncCtx>): void {
		this.setMod('progress', false);

		if (err && 'type' in err && err.type === 'clearAsync') {
			return;
		}

		this.setMod('showError', true);
		this.emitError('loadFail', err);
	}

	/** @override */
	protected beforeDestroy(): void {
		this.memoizeImage();
		this.$refs.img.style.backgroundImage = '';
		super.beforeDestroy();
	}
}
