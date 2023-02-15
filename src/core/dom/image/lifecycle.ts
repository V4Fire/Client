/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type ImageLoader from 'core/dom/image/loader';

import {

	ID,
	INIT_LOAD,

	IS_LOADED,
	IS_LOADING

} from 'core/dom/image/const';

import type { ImageNode, ImagePlaceholderType } from 'core/dom/image/interface';

/**
 * Helper class that provides API to work with an image lifecycle
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
	 * Initializes lifecycle of the specified element
	 * @param el
	 */
	init(el: ImageNode): void {
		const
			previewShadowState = this.parent.getShadowStateByType(el, 'preview'),
			mainShadowState = this.parent.getShadowStateByType(el, 'main');

		if (mainShadowState?.mainOptions.stageClasses) {
			this.parent.setLifecycleClass(el, mainShadowState, 'initial');
		}

		if (previewShadowState != null) {
			this.initPlaceholderImage(el, 'preview');
		}

		this.initMain(el);
	}

	/**
	 * Initializes the main image
	 * @param el
	 */
	protected initMain(el: ImageNode): void {
		const mainShadowState = this.parent.getShadowStateByType(el, 'main');

		if (mainShadowState == null) {
			return;
		}

		if (mainShadowState.imgNode.complete === true && mainShadowState.imgNode[IS_LOADED] === true) {
			this.onMainImageLoad(el);

		} else {
			const
				$a = mainShadowState.mainOptions.ctx?.unsafe.$async;

			if ($a != null) {
				mainShadowState.loadPromise = $a.promise(mainShadowState.imgNode.init, {group: '[[v-image:main]]', label: el[ID]})
					.then(this.onMainImageLoad.bind(this, el))
					.catch(this.onMainImageLoadError.bind(this, el));

			} else {
				mainShadowState.loadPromise = mainShadowState.imgNode.init
					.then(this.onMainImageLoad.bind(this, el))
					.catch(this.onMainImageLoadError.bind(this, el));
			}
		}
	}

	/**
	 * Initializes a placeholder image
	 *
	 * @param el
	 * @param type
	 */
	protected initPlaceholderImage(el: ImageNode, type: ImagePlaceholderType): void {
		const
			successCallback = this.trySetPlaceholderImage.bind(this, el, type),
			errorCallback = this.onPlaceholderImageError.bind(this, el, type);

		const
			shadowState = this.parent.getShadowStateByType(el, type);

		if (shadowState == null) {
			return;
		}

		const
			{mainOptions} = shadowState,
			{imgNode} = shadowState;

		if (imgNode[IS_LOADED] === true) {
			// If the img is ready – set it to the element
			return successCallback();
		}

		if (imgNode[IS_LOADING] == null) {
			// If the loading hasn't started – this is a broken image that should be loaded lazily
			imgNode[INIT_LOAD]!();
		}

		if (mainOptions.ctx != null) {
			shadowState.loadPromise = mainOptions.ctx.unsafe.$async.promise(
				imgNode.init,

				{
					group: `[[v-image:${type}]]`,
					label: el[ID]
				}

			).then(successCallback, errorCallback);

		} else {
			imgNode.init.then(successCallback, errorCallback);
		}
	}

	/**
	 * Tries to set a placeholder image to the specified element
	 *
	 * @param el
	 * @param type
	 */
	protected trySetPlaceholderImage(el: ImageNode, type: ImagePlaceholderType): void {
		const
			shadowState = this.parent.getShadowStateByType(el, type),
			mainShadowState = this.parent.getShadowStateByType(el, 'main');

		if (shadowState == null || mainShadowState == null) {
			return;
		}

		const {selfOptions} = shadowState;
		selfOptions.load?.(el);

		if (mainShadowState.imgNode.complete === true && mainShadowState.isFailed === false) {
			// If the main image is ready – ignore the preview
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
	protected onPlaceholderImageError(el: ImageNode, type: ImagePlaceholderType): void {
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
			shadowState = this.parent.getShadowStateByType(el, 'main');

		if (shadowState == null) {
			return;
		}

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
			shadowState = this.parent.getShadowStateByType(el, 'main');

		if (shadowState == null) {
			return;
		}

		shadowState.loadPromise = undefined;
		shadowState.selfOptions.error?.(el);
		shadowState.isFailed = true;

		this.initPlaceholderImage(el, 'broken');
	}
}
