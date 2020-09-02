/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-invalid-this */

import symbolGenerator from 'core/symbol';
import Async from 'core/async';

import Factory from 'core/component/directives/image/factory';
import Lifecycle from 'core/component/directives/image/lifecycle';

import {

	ImageHelperOptions,
	ImageHelperType,
	DirectiveValue,
	ShadowElState,
	ImageOptions,
	ImageNode,
	ImageType,

	SHADOW_BROKEN,
	SHADOW_PREVIEW,
	SHADOW_MAIN,
	ID

} from 'core/component/directives/image';

export const
	$$ = symbolGenerator();

export default class ImageLoader {
	/** @see [[Factory]] */
	readonly factory: Factory = new Factory(this);

	/** @see [[Lifecycle]] */
	readonly lifecycle: Lifecycle = new Lifecycle(this);

	/**
	 * Async instance
	 */
	readonly async: Async<this> = new Async(this);

	/**
	 * Normalizes the specified directive value
	 * @param value
	 */
	static normalizeOptions<T extends ImageOptions | ImageHelperOptions = ImageOptions>(value: DirectiveValue): T {
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
	protected defaultBrokenImageOptions?: ImageOptions['broken'];

	/**
	 * Default `preview` image options
	 */
	protected defaultPreviewImageOptions?: ImageOptions['preview'];

	/**
	 * Default `preview` fake element
	 */
	protected defaultPreviewShadowState?: ShadowElState;

	/**
	 * Default `broken` fake element
	 */
	protected defaultBrokenShadowState?: ShadowElState;

	/**
	 * Sets a default `broken` image
	 * @param imageOptions
	 */
	setDefaultBrokenImage(imageOptions: string | ImageHelperOptions): void {
		this.defaultBrokenImageOptions = ImageLoader.normalizeOptions<ImageHelperOptions>(imageOptions);
		this.defaultBrokenImageOptions.isDefault = true;

		this.cacheDefaultImage(this.defaultBrokenImageOptions, 'broken');
	}

	/**
	 * Sets a default `preview` image
	 * @param imageOptions
	 */
	setDefaultPreviewImage(imageOptions: string | ImageHelperOptions): void {
		this.defaultPreviewImageOptions = ImageLoader.normalizeOptions<ImageHelperOptions>(imageOptions);
		this.defaultPreviewImageOptions.isDefault = true;

		this.cacheDefaultImage(this.defaultPreviewImageOptions, 'preview');
	}

	/**
	 * Initializes `v-image`
	 *
	 * @param el
	 * @param value
	 */
	init(el: HTMLElement, value: DirectiveValue): void {
		const mainOpts: ImageOptions = {
			preview: this.defaultPreviewImageOptions,
			broken: this.defaultBrokenImageOptions,
			...ImageLoader.normalizeOptions(value)
		};

		const
			typedEl = <ImageNode>el;

		if (mainOpts.preview != null) {
			const normalized = ImageLoader.normalizeOptions<ImageHelperOptions>(mainOpts.preview);

			/*
			 * If the provided `preview` image are same as default – reuse default `preview` shadow state
			 */
			typedEl[SHADOW_PREVIEW] = Object.isTruly(normalized.isDefault) ?
				this.mergeDefaultShadowState(mainOpts, 'preview') :
				this.factory.shadowState(el, normalized, mainOpts, 'preview');
		}

		if (mainOpts.broken != null) {
			const normalized = ImageLoader.normalizeOptions<ImageHelperOptions>(mainOpts.broken);

			/*
			 * If the provided `broken` image are same as default – reuse default `broken` shadow state
			 */
			typedEl[SHADOW_BROKEN] = Object.isTruly(normalized.isDefault) ?
				this.mergeDefaultShadowState(mainOpts, 'broken') :
				this.factory.shadowState(el, normalized, mainOpts, 'broken');
		}

		typedEl[SHADOW_MAIN] = this.factory.shadowState(el, mainOpts, mainOpts, 'main');
		typedEl[ID] = String(Math.random());

		this.setAltAttr(el, mainOpts.alt);
		this.lifecycle.init(typedEl);
	}

	/**
	 * Updates state of the specified element
	 *
	 * @param el
	 * @param [value]
	 * @param [oldValue]
	 */
	update(el: HTMLElement, value?: DirectiveValue, oldValue?: DirectiveValue): void {
		value = value != null ? ImageLoader.normalizeOptions(value) : undefined;
		oldValue = oldValue != null ? ImageLoader.normalizeOptions(oldValue) : undefined;

		if (value?.handleUpdate == null) {
			return;
		}

		if (this.compare(value, oldValue)) {
			return;
		}

		this.clearShadowState(<ImageNode>el);
		this.init(el, value);
	}

	/**
	 * Sets a background image style for the specified element
	 *
	 * @param el
	 * @param imageSrc
	 */
	setBackgroundImage(el: HTMLElement, imageSrc: string): void {
		el.style.backgroundImage = `url('${imageSrc}')`;
	}

	/**
	 * Returns `true` if the specified element is an instance of `HTMLImageElement`
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
		this.setClasses(el, state);

		if (this.isImg(el)) {
			this.setImgProps(el, state);

		} else {
			this.setBackgroundProps(el, state);
		}
	}

	getShadowStateByType(el: ImageNode, type: ImageType): CanUndef<ShadowElState> {
		if (type === 'main') {
			return el[SHADOW_MAIN];
		}

		return el[type === 'preview' ? SHADOW_PREVIEW : SHADOW_BROKEN];
	}

	/**
	 * Sets a lifecycle classes to the specified el
	 *
	 * @param el
	 * @param state
	 * @param type – If the `type` is not specified when `type` from `state` will be used
	 */
	setClasses(el: ImageNode, state: ShadowElState, type?: ImageType | 'initial'): void {
		const
			{mainOptions} = state,
			ctx = state.mainOptions.ctx.unsafe;

		if (mainOptions.stateClasses === true) {
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
			el.classList.add(classMap[type ?? state.type]);
		}
	}

	/**
	 * Merges default image state with the provided options
	 *
	 * @param el
	 * @param selfImageOptions
	 * @param mainImageOptions
	 * @param type
	 */
	protected mergeDefaultShadowState(
		mainImageOptions: ImageOptions,
		type: ImageHelperType
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
	 * Creates a cache for a default image
	 *
	 * @param options
	 * @param type
	 */
	protected cacheDefaultImage(options: ImageHelperOptions, type: ImageHelperType): void {
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
	 * Clears shadow state of the specified element
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
	 * Sets an `img` tag props to the specified element
	 *
	 * @param el
	 * @param state
	 */
	protected setImgProps(el: ImageNode, state: ShadowElState): void {
		if (!this.isImg(el)) {
			return;
		}

		el.src = state.imgNode.currentSrc;
		el.sizes = state.imgNode.sizes;
		el.width = state.imgNode.width;
		el.height = state.imgNode.height;
	}

	/**
	 * Sets a background CSS properties to the specified element
	 *
	 * @param el
	 * @param state
	 */
	protected setBackgroundProps(el: ImageNode, state: ShadowElState): void {
		const
			{bgOptions} = state.selfOptions;

		const
			beforeImg = bgOptions?.beforeImg ?? [],
			afterImg = bgOptions?.afterImg ?? [],
			img = `url("${state.imgNode.currentSrc}")`;

		const
			backgroundImage = Array.concat([], beforeImg, img, afterImg).join(','),
			backgroundPosition = bgOptions?.position ?? '',
			backgroundSize = bgOptions?.size ?? '',
			paddingBottom = this.calculatePaddingByRatio(state, bgOptions?.ratio);

		Object.assign(el.style, {
			backgroundImage,
			backgroundSize,
			backgroundPosition,
			paddingBottom
		});
	}

	/**
	 * Calculates a `padding-bottom` based on the specified ratio
	 *
	 * @param state
	 * @param ratio
	 */
	protected calculatePaddingByRatio(state: ShadowElState, ratio: CanUndef<number>): string {
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
	 * Sets an `alt` attribute for an image or `aria-label` for other types of `HTMLElement`
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
	 * Returns `true` if the specified `val` is equal to `oldVal`
	 *
	 * @param val
	 * @param oldVal
	 */
	protected compare(val: CanUndef<ImageOptions>, oldVal: CanUndef<ImageOptions>): boolean {
		return Object.fastCompare(val, oldVal);
	}
}
