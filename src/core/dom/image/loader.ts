/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-invalid-this */

import symbolGenerator from 'core/symbol';

import {

	DefaultImagePlaceholderOptions,
	ImagePlaceholderOptions,
	ImagePlaceholderType,
	InitValue,
	ShadowElState,
	ImageOptions,
	ImageNode,
	ImageStage,

	SHADOW_BROKEN,
	SHADOW_PREVIEW,
	SHADOW_MAIN,
	ID

} from 'core/dom/image';

import Factory from 'core/dom/image/factory';
import Lifecycle from 'core/dom/image/lifecycle';

export const
	$$ = symbolGenerator();

export default class ImageLoader {
	/** @see [[Factory]] */
	readonly factory: Factory = new Factory();

	/** @see [[Lifecycle]] */
	readonly lifecycle: Lifecycle = new Lifecycle(this);

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
	protected defaultPreviewShadowState?: ShadowElState;

	/**
	 * Default `broken` fake element
	 */
	protected defaultBrokenShadowState?: ShadowElState;

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
		const
			normalized = ImageLoader.normalizeOptions(value);

		const mainOpts: ImageOptions = {
			preview: 'preview' in normalized ? normalized.preview : this.defaultPreviewImageOptions,
			broken: 'broken' in normalized ? normalized.broken : this.defaultBrokenImageOptions,
			...normalized
		};

		const
			typedEl = <ImageNode>el;

		if (mainOpts.preview != null) {
			const
				previewPlaceholderOptions = ImageLoader.normalizeOptions<ImagePlaceholderOptions>(mainOpts.preview),
				isDefault = Object.isTruly((<DefaultImagePlaceholderOptions>previewPlaceholderOptions).isDefault);

			// If the provided `preview` image matches with the default – reuse the default `preview` shadow state
			typedEl[SHADOW_PREVIEW] = isDefault ?
				this.mergeDefaultShadowState(mainOpts, 'preview') :
				this.factory.shadowState(el, previewPlaceholderOptions, mainOpts, 'preview');
		}

		if (mainOpts.broken != null) {
			const
				brokenPlaceholderOptions = ImageLoader.normalizeOptions<ImagePlaceholderOptions>(mainOpts.broken),
				isDefault = Object.isTruly((<DefaultImagePlaceholderOptions>brokenPlaceholderOptions).isDefault);

			// If the provided `broken` image matches with the default – reuse the default `broken` shadow state
			typedEl[SHADOW_BROKEN] = isDefault ?
				this.mergeDefaultShadowState(mainOpts, 'broken') :
				this.factory.shadowState(el, brokenPlaceholderOptions, mainOpts, 'broken');
		}

		typedEl[SHADOW_MAIN] = this.factory.shadowState(el, mainOpts, mainOpts, 'main');
		typedEl[ID] = String(Math.random());

		this.setAltAttr(el, mainOpts.alt);

		if (!this.isImg(el)) {
			this.setInitialBackgroundSizeAttrs(el, typedEl[SHADOW_MAIN], typedEl[SHADOW_PREVIEW]);
		}

		this.lifecycle.init(typedEl);
	}

	/**
	 * Updates the state of the specified element
	 *
	 * @param el
	 * @param [value]
	 * @param [oldValue]
	 */
	update(el: HTMLElement, value?: InitValue, oldValue?: InitValue): void {
		value = value != null ? ImageLoader.normalizeOptions(value) : undefined;
		oldValue = oldValue != null ? ImageLoader.normalizeOptions(oldValue) : undefined;

		if (value?.handleUpdate == null) {
			return;
		}

		if (this.isEqual(value, oldValue)) {
			return;
		}

		this.clearShadowState(<ImageNode>el);
		this.init(el, value);
	}

	/**
	 * Sets background CSS properties to the specified element
	 *
	 * @param el
	 * @param imageSrc
	 */
	setBackgroundImage(el: HTMLElement, imageSrc: string): void {
		el.style.backgroundImage = `url('${imageSrc}')`;
	}

	/**
	 * Returns true if the specified element is an instance of `HTMLImageElement`
	 * @param el
	 */
	isImg(el: HTMLElement): el is HTMLImageElement {
		return el instanceof HTMLImageElement;
	}

	/**
	 * Clears the specified element state
	 * @param el
	 */
	clearElement(el: HTMLElement): void {
		if (this.isImg(el)) {
			el.src = '';

		} else {
			this.setBackgroundImage(el, '');
		}

		this.clearShadowState(el);
		return this.setAltAttr(el, '');
	}

	/**
	 * Renders an image to the specified element
	 *
	 * @param el
	 * @param state
	 */
	render(el: ImageNode, state: ShadowElState): void {
		this.setLifecycleClass(el, state);

		if (this.isImg(el)) {
			this.setImgProps(el, state);

		} else {
			this.setBackgroundStyles(el, state);
		}
	}

	/**
	 * Returns a shadow state of the element by the specified type
	 *
	 * @param el
	 * @param type
	 */
	getShadowStateByType(el: ImageNode, type: ImageStage): CanUndef<ShadowElState> {
		if (type === 'main') {
			return el[SHADOW_MAIN];
		}

		return el[type === 'preview' ? SHADOW_PREVIEW : SHADOW_BROKEN];
	}

	/**
	 * Sets lifecycle class to the specified element
	 *
	 * @param el
	 * @param state
	 * @param [type] – if not specified, the value will be taken from `state`
	 */
	setLifecycleClass(el: ImageNode, state: ShadowElState, type?: ImageStage): void {
		const
			{mainOptions} = state,
			ctx = state.mainOptions.ctx?.unsafe;

		if (ctx == null) {
			return;
		}

		if (mainOptions.stageClasses === true) {
			if (ctx.block == null) {
				return;
			}

			const classMap = {
				initial: ctx.block.getFullElName('v-image', 'initial', 'true'),
				preview: ctx.block.getFullElName('v-image', 'preview', 'true'),
				main: ctx.block.getFullElName('v-image', 'main', 'true'),
				broken: ctx.block.getFullElName('v-image', 'broken', 'true')
			};

			el.classList.remove(classMap.preview, classMap.main, classMap.broken, classMap.initial);
			el.classList.add(classMap[type ?? state.stageType]);
		}
	}

	/**
	 * Merges the default image state with the provided options
	 *
	 * @param mainImageOptions
	 * @param type
	 */
	protected mergeDefaultShadowState(
		mainImageOptions: ImageOptions,
		type: ImagePlaceholderType
	): CanUndef<ShadowElState> {
		const
			defaultShadowState = type === 'preview' ? this.defaultPreviewShadowState : this.defaultBrokenShadowState;

		if (defaultShadowState != null) {
			return {
				...defaultShadowState,
				mainOptions: mainImageOptions
			};
		}
	}

	/**
	 * Creates a cache for the default image
	 *
	 * @param options
	 * @param type
	 */
	protected cacheDefaultImage(options: ImagePlaceholderOptions, type: ImagePlaceholderType): void {
		const
			dummy = document.createElement('div'),
			state = this.factory.shadowState(dummy, options, options, type);

		if (type === 'broken') {
			this.defaultBrokenShadowState = state;
		}

		if (type === 'preview') {
			this.defaultPreviewShadowState = state;
		}
	}

	/**
	 * Clears a shadow state of the specified element
	 * @param el
	 */
	protected clearShadowState(el: HTMLElement | ImageNode): void {
		if (el[SHADOW_MAIN] == null) {
			return;
		}

		const {async} = el[SHADOW_MAIN].mainOptions.ctx.unsafe;

		for (let i = 0, shadows = [SHADOW_PREVIEW, SHADOW_MAIN, SHADOW_BROKEN]; i < shadows.length; i++) {
			const shadow = shadows[i];

			if (el[shadow] != null) {
				el[shadow]?.loadPromise != null && async.clearPromise(el[shadow].loadPromise);
				delete el[shadow];
			}
		}
	}

	/**
	 * Sets an image attributes to the specified el
	 *
	 * @param el
	 * @param state
	 */
	protected setImgProps(el: ImageNode, state: ShadowElState): void {
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
	protected setBackgroundStyles(el: ImageNode, state: ShadowElState): void {
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
	 * Sets initially calculated padding to the specified element
	 *
	 * @param el
	 * @param mainState
	 * @param previewState
	 */
	protected setInitialBackgroundSizeAttrs(
		el: HTMLElement,
		mainState: ShadowElState,
		previewState?: ShadowElState
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
	protected calculatePaddingByRatio(state: ShadowElState, ratio?: number): string {
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

	/**
	 * Returns true if the specified options are equal
	 *
	 * @param a
	 * @param b
	 */
	protected isEqual(a: CanUndef<ImageOptions>, b: CanUndef<ImageOptions>): boolean {
		return Object.fastCompare(a, b);
	}
}
