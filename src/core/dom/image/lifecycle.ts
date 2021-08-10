/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { memoize } from 'core/promise/sync';
import type ImageLoader from 'core/dom/image/loader';
import type { InViewAdapter } from 'core/dom/in-view';

import {

	ImageNode,
	ImagePlaceholderType,

	IS_LOADED,
	INIT_LOAD,
	IS_LOADING,
	SHADOW_MAIN,
	ID

} from 'core/dom/image';

/**
 * Helper class that provides API to work with an image lifecycle
 */
export default class Lifecycle {
	/** @see [[InViewAdapter]] */
	protected static get inView(): Promise<InViewAdapter> {
		if (this.inViewStore) {
			return this.inViewStore;
		}

		return this.inViewStore = memoize('core/dom/in-view', () => import('core/dom/in-view')).then(({inViewFactory}) => inViewFactory());
	}

	/** @see [[InViewAdapter]] */
	protected static inViewStore?: Promise<InViewAdapter>;

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

		if (mainShadowState?.mainOptions.lazy) {
			this.initLazyMain(el);

		} else {
			this.initMain(el);
		}
	}

	/**
	 * Initializes the main image
	 * @param el
	 */
	protected initMain(el: ImageNode): void {
		const
			mainShadowState = this.parent.getShadowStateByType(el, 'main');

		if (mainShadowState == null) {
			return;
		}

		if (mainShadowState.imgNode.complete === true && mainShadowState.imgNode[IS_LOADED] === true) {
			this.onMainImageLoad(el);

		} else {

			if (mainShadowState.mainOptions.lazy) {
				mainShadowState.imgNode[INIT_LOAD]();
			}

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
	 * Initializes the main image lazily
	 * @param el
	 */
	protected initLazyMain(el: ImageNode): void {
		const wrapIntoAsyncIfNeeded = (pr) => {
			const
				state = this.parent.getShadowStateByType(el, 'main'),
				ctx = state?.mainOptions.ctx;

			if (ctx) {
				const
					{async} = ctx.unsafe;

				return el[SHADOW_MAIN].lazyPromise = async.promise(pr, {group: '[[v-image:main:lazy]]', label: el[ID]});
			}

			return pr;
		};

		wrapIntoAsyncIfNeeded(Lifecycle.inView.then((inView) => {
			inView.observe(el, {
				threshold: 0.0001,
				onEnter: () => this.initMain(el),
				once: true
			});

		})).catch(stderr);
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
		console.log('try set placeholder');

		const
			shadowState = this.parent.getShadowStateByType(el, type),
			mainShadowState = this.parent.getShadowStateByType(el, 'main'),
			imgNode = mainShadowState?.imgNode;

		console.log(shadowState, mainShadowState);
		if (shadowState == null || mainShadowState == null) {
			return;
		}

		const {selfOptions} = shadowState;
		selfOptions.load?.(el);

		console.log(mainShadowState.imgNode.complete, mainShadowState.isFailed);

		if (
			mainShadowState.imgNode.complete === true &&
			mainShadowState.isFailed === false &&
			imgNode?.[IS_LOADED] === true
		) {
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
