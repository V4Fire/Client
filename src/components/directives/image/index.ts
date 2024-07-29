/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/directives/image/README.md]]
 * @packageDocumentation
 */

import config from 'config';
import { ComponentEngine, VNode } from 'core/component/engines';

import { setVNodePatchFlags, mergeProps } from 'core/component/render';
import { getDirectiveContext, getElementId } from 'core/component/directives';

import { unsupportedElements } from 'components/directives/image/const';
import { createImageElement, getCurrentSrc } from 'components/directives/image/helpers';
import { window } from 'core/const/browser';

import type { DirectiveParams, ImageOptions, SSRDirectiveParams } from 'components/directives/image/interface';

export * from 'components/directives/image/interface';

export const
	idsCache = new WeakMap<Element, string>();

ComponentEngine.directive('image', {
	beforeCreate(params: DirectiveParams, vnode: VNode): CanUndef<VNode> {
		if (SSR) {
			return;
		}

		if (!Object.isString(vnode.type)) {
			throw new TypeError('The `v-image` directive cannot be applied to a component');
		}

		if (unsupportedElements.has(vnode.type)) {
			throw new TypeError('The `v-image` directive cannot be applied to `img`, `picture`, `object` elements');
		}

		const
			ctx = getDirectiveContext(params, vnode);

		if (ctx == null) {
			return;
		}

		const
			value = normalizeValue(params.value),
			{r} = ctx.$renderEngine;

		const props = normalizeProps(value, vnode.props?.style);

		vnode.type = 'span';
		vnode.props = vnode.props != null ? mergeProps(vnode.props, props) : props;
		vnode.dynamicProps = Array.union(vnode.dynamicProps ?? [], Object.keys(props));

		const imageElement = createImageElement(value).toVNode(r.createVNode.bind(ctx));

		vnode.children = [imageElement];
		vnode.dynamicChildren = Object.cast(vnode.children.slice());
		setVNodePatchFlags(vnode, 'props', 'styles', 'children');
	},

	mounted,
	updated: mounted,

	getSSRProps(params: SSRDirectiveParams) {
		//#if node_js
		const
			value = normalizeValue(params.value),
			props = normalizeProps(value, params.bindings?.style, <typeof globalThis>window),
			imageElement = createImageElement(value).toElement(window.document);

		return {
			...props,
			innerHTML: imageElement.outerHTML
		};

		//#endif
	}
});

function mounted(el: HTMLElement, params: DirectiveParams, vnode: VNode): void {
	const
		p = params.value,
		img = el.querySelector('img'),
		ctx = getDirectiveContext(params, vnode);

	if (img == null || ctx == null) {
		return;
	}

	const {
		async: $a
	} = ctx;

	const group = {
		group: getElementId(el, idsCache)
	};

	$a.clearAll(group);

	switch (img.getAttribute('data-img')) {
		case 'loaded':
			void onLoad();
			break;

		case 'failed':
			onError();
			break;

		default:
			handleDefaultCase();
	}

	function handleDefaultCase() {
		if (img == null) {
			return;
		}

		if (!img.complete) {
			const
				sleepPromise = $a.sleep(50, group),
				loadPromise = new Promise((resolve, reject) => {
					$a.once(img, 'load', resolve, group);
					$a.once(img, 'error', reject, group);
				});

			Promise.all([sleepPromise, loadPromise])
				.then(onLoad)
				.catch((e) => {
					if (e.type !== 'clearAsync') {
						onError();
					}
				});

			return;
		}

		if (img.naturalWidth > 0) {
			void onLoad();

		} else {
			onError();
		}
	}

	function onLoad() {
		$a.off(group);

		if (img == null) {
			return;
		}

		try {
			img.style.opacity = '1';

			el.style['background-image'] = '';
			el.setAttribute('data-image', 'loaded');

			p.onLoad?.(img);

		} catch (err) {
			stderr(err);
		}
	}

	function onError() {
		$a.off(group);

		if (img == null) {
			return;
		}

		img.style.opacity = '0';

		el.style['background-image'] = el.getAttribute('data-broken-image') ?? '';
		el.setAttribute('data-image', 'broken');

		p.onError?.(img);
	}
}

function normalizeValue(value: DirectiveParams['value']): typeof config.image & ImageOptions {
	let
		p = Object.mixin(true, {}, config.image, value);

	if (p.optionsResolver != null) {
		p = p.optionsResolver(p);
	}

	return p;
}

function normalizeProps(params: DirectiveParams['value'], styles: CanUndef<Dictionary<string>>, windowObject: typeof globalThis = globalThis): Dictionary {
	const placeholders = {
		preview: undefined,
		broken: undefined
	};

	Object.keys(placeholders).forEach((kind) => {
		const
			placeholder = params[kind];

		let
			url: CanUndef<string>;

		if (Object.isString(placeholder)) {
			url = `url("${placeholder}")`;

		} else if (Object.isDictionary(placeholder)) {
			url = `url("${getCurrentSrc(createImageElement(placeholder, params).toElement(windowObject.document))}")`;
		}

		if (url != null) {
			placeholders[kind] = url;
		}
	});

	const props: Dictionary<any> = {
		'data-image': 'preview',

		'data-preview-image': placeholders.preview,
		'data-broken-image': placeholders.broken,

		style: {
			'background-image': placeholders.preview
		}
	};

	if (Object.isTruly(placeholders.preview) && !hasDisplay(styles)) {
		props.style = {...props.style, display: 'inline-block'};
	}

	return props;

	function hasDisplay(style: CanUndef<Dictionary<string>>): boolean {
		if (style == null) {
			return false;
		}

		return Object.isTruly(style.display?.trim());
	}
}
