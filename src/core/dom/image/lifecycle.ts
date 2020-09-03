/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import ImageLoader from 'core/dom/image/image';

import {

	ImageNode,
	ImageHelperType,

	SHADOW_PREVIEW,
	SHADOW_MAIN,
	IMG_IS_LOADED,
	INIT_LOAD,
	LOADING_STARTED,
	ID

} from 'core/dom/image';

/**
 * Helper class, provides an API to work with image lifecycle
 */
export default class Lifecycle {
	/**
	 * Parent class
	 */
	protected parent: ImageLoader;

	/**
	 * @param parent
	 */
	constructor(parent: ImageLoader) {
		this.parent = parent;
	}

	/**
	 * Initializes lifecycle of the specified el
	 * @param el
	 */
	init(el: ImageNode): void {
		const
			previewShadowState = el[SHADOW_PREVIEW];

		this.parent.setClasses(el, el[SHADOW_MAIN], 'initial');

		if (previewShadowState != null) {
			this.initHelperImage(el, 'preview');
		}

		this.initMain(el);
	}

	/**
	 * Initializes a main image
	 * @param el
	 */
	protected initMain(el: ImageNode): void {
		const mainShadowState = this.parent.getShadowStateByType(el, 'main');

		if (mainShadowState == null) {
			return;
		}

		if (mainShadowState.imgNode.complete === true && mainShadowState.imgNode[IMG_IS_LOADED] === true) {
			this.onMainImageLoad(el);

		} else {
			const $a = mainShadowState.mainOptions.ctx?.unsafe.async;

			if ($a) {
				mainShadowState.loadPromise = $a.promise(mainShadowState.imgNode.init, {group: '[[v-image:main]]', label: el[ID]})
					.then(this.onMainImageLoad.bind(this, el))
					.catch(this.onMainImageLoadError.bind(this, el));

			} else {
				mainShadowState.imgNode.init
					.then(this.onMainImageLoad.bind(this, el))
					.catch(this.onMainImageLoadError.bind(this, el));
			}
		}
	}

	/**
	 * Initializes a preview image
	 *
	 * @param el
	 * @param type
	 */
	protected initHelperImage(el: ImageNode, type: ImageHelperType): void {
		const
			successCallback = this.trySetHelperImage.bind(this, el, type),
			errorCallback = this.onHelperImageError.bind(this, el, type);

		const
			shadowState = this.parent.getShadowStateByType(el, type);

		if (shadowState == null) {
			return;
		}

		const
			{mainOptions} = shadowState,
			{imgNode} = shadowState;

		if (imgNode[IMG_IS_LOADED] === true) {
			/*
			 * If an img is ready – set it to the element
			 */
			return successCallback();
		}

		if (imgNode[LOADING_STARTED] == null) {
			/*
			 * If loading was not started – this is a `broken` image that should be loaded lazy
			 */
			imgNode[INIT_LOAD]!();
		}

		if (mainOptions.ctx) {
			shadowState.loadPromise = mainOptions.ctx.unsafe.async.promise(
				imgNode.init, {group: `[[v-image:${type}]]`, label: el[ID]}
			).then(successCallback, errorCallback);

		} else {
			imgNode.init.then(successCallback, errorCallback);
		}
	}

	/**
	 * Tries to set a preview image to the specified element
	 *
	 * @param el
	 * @param type
	 */
	protected trySetHelperImage(el: ImageNode, type: ImageHelperType): void {
		const
			shadowState = this.parent.getShadowStateByType(el, type),
			mainShadowState = this.parent.getShadowStateByType(el, 'main');

		if (shadowState == null || mainShadowState == null) {
			return;
		}

		const {selfOptions} = shadowState;
		selfOptions.load?.(el);

		if (mainShadowState.imgNode.complete === true && mainShadowState.isFailed === false) {
			/*
			 * If a main image are ready – ignore preview
			 */
			return;
		}

		this.parent.render(el, shadowState);
	}

	/**
	 * Handler: helper image error occurs
	 *
	 * @param el
	 * @param type
	 */
	protected onHelperImageError(el: ImageNode, type: ImageHelperType): void {
		const shadowState = this.parent.getShadowStateByType(el, type);

		if (shadowState == null) {
			return;
		}

		shadowState.isFailed = true;
		shadowState.selfOptions.error?.(el);
		shadowState.loadPromise = undefined;
	}

	/**
	 * Handler: main image load complete
	 * @param el
	 */
	protected onMainImageLoad(el: ImageNode): void {
		const
			shadowState = el[SHADOW_MAIN];

		this.parent.render(el, shadowState);

		shadowState.loadPromise = undefined;
		shadowState.selfOptions.load?.(el);
	}

	/**
	 * Handler: main image loading error
	 * @param el
	 */
	protected onMainImageLoadError(el: ImageNode): void {
		const
			shadowState = el[SHADOW_MAIN];

		shadowState.loadPromise = undefined;
		shadowState.selfOptions.error?.(el);
		shadowState.isFailed = true;

		this.initHelperImage(el, 'broken');
	}
}
