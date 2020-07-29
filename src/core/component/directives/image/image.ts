/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-invalid-this */

import symbolGenerator from 'core/symbol';

import Factory from 'core/component/directives/image/factory';
import Lifecycle from 'core/component/directives/image/lifecycle';

import {

	ImageHelperOptions,
	ImageHelperType,
	DirectiveValue,
	ShadowElState,
	ImageOptions,
	ImageNode,

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
			typedEl[SHADOW_PREVIEW] = normalized.isDefault ?
				this.mergeDefaultShadowState(mainOpts, 'preview') :
				this.factory.shadowState(el, normalized, mainOpts, 'preview');
		}

		if (mainOpts.broken != null) {
			const normalized = ImageLoader.normalizeOptions<ImageHelperOptions>(mainOpts.broken);

			/*
			 * If the provided `broken` image are same as default – reuse default `broken` shadow state
			 */
			typedEl[SHADOW_BROKEN] = normalized.isDefault ?
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

		if (defaultShadowState) {
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
			{backgroundOptions} = state.selfOptions;

		const
			beforeImg = backgroundOptions?.beforeImg ?? [],
			afterImg = backgroundOptions?.afterImg ?? [],
			img = `url("${state.imgNode.currentSrc}")`;

		const
			backgroundImage = Array.concat([], beforeImg, img, afterImg).join(','),
			backgroundPosition = backgroundOptions?.position ?? '',
			backgroundSize = backgroundOptions?.size ?? '',
			paddingBottom = this.calculatePaddingByRatio(backgroundOptions?.ratio);

		Object.assign(el.style, {
			backgroundImage,
			backgroundSize,
			backgroundPosition,
			paddingBottom
		});
	}

	/**
	 * Calculates a `padding-bottom` based on the specified ratio
	 * @param ratio
	 */
	protected calculatePaddingByRatio(ratio: CanUndef<number>): string {
		if (ratio == null) {
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
	 * Sets a lifecycle classes to the specified el
	 *
	 * @param el
	 * @param state
	 */
	protected setClasses(el: ImageNode, state: ShadowElState): void {
		const
			{mainOptions} = state,
			ctx = state.mainOptions.ctx.unsafe;

		if (mainOptions.stateClasses === true) {
			if (!ctx.block) {
				return;
			}

			const classMap = {
				main: ctx.block.getFullElName('v-image', 'main', 'true'),
				preview: ctx.block.getFullElName('v-image', 'preview', 'true'),
				broken: ctx.block.getFullElName('v-image', 'broken', 'true')
			};

			el.classList.remove(classMap.preview, classMap.main, classMap.broken);
			el.classList.add(classMap[state.type]);
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

/**
 * Если `div`
 * 1. Если не указаны `sources` то используем просто img
 * 2. Если указаны `sources` то используем `shadow picture` но не делаем рантайм обновлений
 *
 * Если `img`
 * 1. Если не указаны `sources` то используем просто переданный тег
 * 2. Если указаны sources то используем `picture`, забираем все классы с элемента и переносим его на `img` внутри
 */
