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
import { getDirectiveContext } from 'core/component/directives/helpers';

import { createImageElement, getCurrentSrc } from 'core/component/directives/image/helpers';
import type { DirectiveParams } from 'core/component/directives/image/interface';

export * from 'core/component/directives/image/interface';

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

		Object.keys(placeholders).forEach((nm) => {
			const
				placeholder = p[nm];

			let
				url;

			if (Object.isString(placeholder)) {
				url = `url("${placeholder}")`;

			} else if (Object.isDictionary(placeholder)) {
				url = `url("${getCurrentSrc(createImageElement(placeholder, p).toElement())}")`;
			}

			if (url != null) {
				placeholders[nm] = url;
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

	const
		{async: $a} = ctx;

	switch (img.getAttribute('data-img')) {
		case 'loaded':
			onLoad();
			break;

		case 'failed':
			onError();
			break;

		default:
			$a.once(img, 'load', onLoad);
			$a.once(img, 'error', onError);
	}

	function onLoad() {
		if (img == null) {
			return;
		}

		img.style.opacity = '1';

		el.style['background-image'] = '';
		el.setAttribute('data-image', 'loaded');

		p.onLoad?.(img);
	}

	function onError() {
		if (img == null) {
			return;
		}

		el.style['background-image'] = el.getAttribute('data-broken-image') ?? '';
		el.setAttribute('data-image', 'broken');

		p.onError?.(img);
	}
}
