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
import { getDirectiveContext, getElementId } from 'core/component/directives/helpers';

import { unsupportedElements } from 'components/directives/image/const';
import { createImageElement, getCurrentSrc } from 'components/directives/image/helpers';

import type { DirectiveParams } from 'components/directives/image/interface';

export * from 'components/directives/image/interface';

export const
	idsCache = new WeakMap<Element, string>();

ComponentEngine.directive('image', {
	beforeCreate(params: DirectiveParams, vnode: VNode): CanUndef<VNode> {
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

		let
			p = Object.mixin(true, {}, config.image, params.value);

		if (p.optionsResolver != null) {
			p = p.optionsResolver(p);
		}

		const
			{r} = ctx.$renderEngine;

		const placeholders = {
			preview: undefined,
			broken: undefined
		};

		Object.keys(placeholders).forEach((kind) => {
			const
				placeholder = p[kind];

			let
				url: CanUndef<string>;

			if (Object.isString(placeholder)) {
				url = `url("${placeholder}")`;

			} else if (Object.isDictionary(placeholder)) {
				url = `url("${getCurrentSrc(createImageElement(placeholder, p).toElement())}")`;
			}

			if (url != null) {
				placeholders[kind] = url;
			}
		});

		const props = {
			'data-image': 'preview',

			'data-preview-image': placeholders.preview,
			'data-broken-image': placeholders.broken,

			style: {
				'background-image': placeholders.preview
			}
		};

		vnode.type = 'span';
		vnode.props = vnode.props != null ? mergeProps(vnode.props, props) : props;
		vnode.dynamicProps = Array.union(vnode.dynamicProps ?? [], Object.keys(props));

		if (Object.isTruly(placeholders.preview) && !hasDisplay(vnode.props.style)) {
			vnode.props.style.display = 'inline-block';
		}

		const imageElement = createImageElement(p).toVNode(r.createVNode.bind(ctx));

		vnode.children = [imageElement];
		vnode.dynamicChildren = Object.cast(vnode.children.slice());
		setVNodePatchFlags(vnode, 'props', 'styles', 'children');

		function hasDisplay(style: CanUndef<Dictionary<string>>): boolean {
			if (style == null) {
				return false;
			}

			return Object.isTruly(style.display?.trim());
		}
	},

	mounted,
	updated: mounted
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

		if (p.backgroundSize == null) {
			el.style['background-size'] = 'contain';
		}

		if (Object.isString(p.backgroundSize) && p.backgroundSize !== 'false') {
			el.style['background-size'] = p.backgroundSize;
		}

		p.onError?.(img);
	}
}
