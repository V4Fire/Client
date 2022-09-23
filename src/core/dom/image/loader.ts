/* eslint-disable @typescript-eslint/no-invalid-this */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import {

	DefaultImagePlaceholderOptions,
	ImagePlaceholderOptions,
	ImagePlaceholderRole,
	OptionsResolver,

	InitValue,
	ImageState,

	ImageOptions,
	ImageNode,
	ImageRole,

	SHADOW_BROKEN,
	SHADOW_PREVIEW,
	SHADOW_MAIN,
	ID

} from 'core/dom/image';

export const
	$$ = symbolGenerator();

export default class ImageLoader {

	/**
	 * Normalizes the specified directive value
	 * @param value
	 */
	static normalizeOptions<T extends ImageOptions | ImagePlaceholderOptions = ImageOptions>(value: InitValue): T {
		if (Object.isString(value)) {
			return <T>{
				src: value
			};
		}

		return <T>value;
	}

	/**
	 * Default `broken` image options
	 */
	protected defaultBrokenImageOptions?: DefaultImagePlaceholderOptions;

	/**
	 * Default `preview` image options
	 */
	protected defaultPreviewImageOptions?: DefaultImagePlaceholderOptions;

	/**
	 * Default `preview` fake element
	 */
	protected defaultPreviewShadowState?: ImageState;

	/**
	 * Default `broken` fake element
	 */
	protected defaultBrokenShadowState?: ImageState;

	/**
	 * Default `optionsResolver` function
	 */
	 defaultOptionsResolver?: OptionsResolver = (opts) => opts;

	/**
	 * Sets the default `broken` image
	 * @param opts
	 */
	setDefaultBrokenImage(opts: string | ImagePlaceholderOptions): void {
		this.defaultBrokenImageOptions = ImageLoader.normalizeOptions<ImagePlaceholderOptions>(opts);
		this.defaultBrokenImageOptions.isDefault = true;

		this.cacheDefaultImage(this.defaultBrokenImageOptions, 'broken');
	}

	/**
	 * Sets the default `preview` image
	 * @param opts
	 */
	setDefaultPreviewImage(opts: string | ImagePlaceholderOptions): void {
		this.defaultPreviewImageOptions = ImageLoader.normalizeOptions<ImagePlaceholderOptions>(opts);
		this.defaultPreviewImageOptions.isDefault = true;

		this.cacheDefaultImage(this.defaultPreviewImageOptions, 'preview');
	}

	/**
	 * Initializes rendering of an image to the specified element
	 *
	 * @param el
	 * @param value
	 */
	init(el: HTMLElement, value: InitValue): void {

	}

	/**
	 * Returns true if the specified element is an instance of `HTMLImageElement`
	 * @param el
	 */
	isImg(el: HTMLElement): el is HTMLImageElement {
		return el instanceof HTMLImageElement;
	}

	/**
	 * Renders an image to the specified element
	 *
	 * @param el
	 * @param state
	 */
	render(el: ImageNode, state: ImageState): void {
		this.setLifecycleClass(el, state);

		if (this.isImg(el)) {
			this.setImgProps(el, state);

		} else {
			this.setBackgroundStyles(el, state);
		}
	}

	/**
	 * Resolves the given operation options
	 * @param opts
	 */
	protected resolveOptions(opts: ImageOptions): ImageOptions {
		if (opts.optionsResolver != null) {
			return opts.optionsResolver(opts);
		}

		return opts;
	}

	/**
	 * Sets an image attributes to the specified el
	 *
	 * @param el
	 * @param state
	 */
	protected setImgProps(el: ImageNode, state: ImageState): void {
		if (!this.isImg(el)) {
			return;
		}

		el.src = state.imgNode.currentSrc;
	}

	/**
	 * Sets background CSS styles to the specified element
	 *
	 * @param el
	 * @param state
	 */
	protected setBackgroundStyles(el: ImageNode, state: ImageState): void {
		const
			{bgOptions} = state.selfOptions;

		const
			beforeImg = bgOptions?.beforeImg ?? [],
			afterImg = bgOptions?.afterImg ?? [],
			img = `url("${state.imgNode.currentSrc}")`;

		const
			backgroundImage = Array.concat([], beforeImg, img, afterImg).join(','),
			backgroundPosition = bgOptions?.position ?? '',
			backgroundRepeat = bgOptions?.repeat ?? '',
			backgroundSize = bgOptions?.size ?? '',
			paddingBottom = this.calculatePaddingByRatio(state, bgOptions?.ratio);

		Object.assign(el.style, {
			backgroundImage,
			backgroundSize,
			backgroundPosition,
			backgroundRepeat,
			paddingBottom
		});
	}

	/**
	 * Clears background CSS styles of the specified element
	 * @param el
	 */
	protected clearBackgroundStyles(el: HTMLElement): void {
		Object.assign(el.style, {
			backgroundImage: '',
			backgroundSize: '',
			backgroundPosition: '',
			backgroundRepeat: '',
			paddingBottom: ''
		});
	}

	/**
	 * Sets initially calculated padding to the specified element
	 *
	 * @param el
	 * @param mainState
	 * @param previewState
	 */
	protected setInitialBackgroundSizeAttrs(
		el: HTMLElement,
		mainState: ImageState,
		previewState?: ImageState
	): void {
		const
			ratio = previewState?.selfOptions.bgOptions?.ratio ?? mainState.selfOptions.bgOptions?.ratio;

		if (ratio == null) {
			return;
		}

		el.style.paddingBottom = this.calculatePaddingByRatio(mainState, ratio);
	}

	/**
	 * Calculates `padding-bottom` based on the specified ratio
	 *
	 * @param state
	 * @param [ratio]
	 */
	protected calculatePaddingByRatio(state: ImageState, ratio?: number): string {
		if (ratio == null) {
			const
				{imgNode} = state,
				{naturalHeight, naturalWidth} = imgNode;

			if (naturalHeight > 0 || naturalWidth > 0) {
				const calculated = naturalHeight === 0 ? 1 : naturalWidth / naturalHeight;
				return `${(1 / calculated) * 100}`;
			}

			return '';
		}

		return `${(1 / ratio) * 100}%`;
	}

	/**
	 * Sets an `alt` attribute or `aria-label` for the specified element
	 *
	 * @param el
	 * @param alt
	 */
	protected setAltAttr(el: HTMLElement, alt: CanUndef<string>): void {
		if (this.isImg(el)) {
			el.alt = alt ?? '';
			return;
		}

		if (alt == null || alt === '') {
			el.removeAttribute('role');
			el.removeAttribute('aria-label');

		} else {
			el.setAttribute('role', 'img');
			el.setAttribute('aria-label', alt);
		}
	}
}
