/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/image/README.md]]
 * @packageDocumentation
 */

import { ComponentEngine, VNode } from 'core/component/engines';

import { setVNodePatchFlags, mergeProps } from 'core/component/render';
import { getDirectiveContext, getElementId } from 'core/component/directives/helpers';

import { createImageElement, getCurrentSrc } from 'core/component/directives/image/helpers';
import type { DirectiveParams } from 'core/component/directives/image/interface';

export * from 'core/component/directives/image/interface';

export const
	idsCache = new WeakMap<Element, string>();

ComponentEngine.directive('image', {
	beforeCreate(params: DirectiveParams, vnode: VNode): CanUndef<VNode> {
		if (!Object.isString(vnode.type)) {
			throw new TypeError('The `v-image` directive cannot be applied to a component');
		}

		const
			ctx = getDirectiveContext(params, vnode);

		if (ctx == null) {
			return;
		}

		let
			p = params.value;

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
				url;

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

		vnode.children = [createImageElement(p).toVNode(r.createVNode.bind(ctx))];
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
			$a.once(img, 'load', onLoad, group);
			$a.once(img, 'error', onError, group);
	}

	async function onLoad() {
		$a.off(group);

		if (img == null) {
			return;
		}

		try {
			await $a.sleep(50, group);

			// eslint-disable-next-line require-atomic-updates
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

		el.style['background-image'] = el.getAttribute('data-broken-image') ?? '';
		el.setAttribute('data-image', 'broken');

		p.onError?.(img);
	}
}
