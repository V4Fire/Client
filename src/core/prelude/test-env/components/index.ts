/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { app, ComponentInterface } from 'core/component';
import { normalizeComponentForceUpdateProps } from 'core/component';
import { render, create } from 'components/friends/vdom';

import type iBlock from 'components/super/i-block/i-block';
import type { ComponentElement } from 'components/super/i-static-page/i-static-page';

import { expandedParse } from 'core/prelude/test-env/components/json';

const
	createdComponents = Symbol('A set of created components');

globalThis.renderComponents = (
	componentName: string,
	scheme: RenderComponentsScheme
) => {
	if (Object.isString(scheme)) {
		scheme = expandedParse<RenderComponentsVnodeDescriptor[]>(scheme);

		if (!Object.isArray(scheme)) {
			throw new TypeError('The scheme for rendering is set incorrectly');
		}
	}

	const
		ID_ATTR = 'data-dynamic-component-id';

	const
		ctx = <Nullable<iBlock['unsafe']>>app.component;

	if (ctx == null) {
		throw new ReferenceError('The root context for rendering is not defined');
	}

	if (!(ctx.instance instanceof ComponentInterface) || !('vdom' in ctx)) {
		throw new TypeError('The root context does not implement the iBlock interface');
	}

	const ids = scheme.map(() => Math.random().toString(16).slice(2));

	const vnodes = create.call(ctx.vdom, scheme.map(({attrs, children}, i) => ({
		type: componentName,

		attrs: {
			...(attrs != null ? normalizeComponentForceUpdateProps(app.component!, componentName, attrs) : {}),
			[ID_ATTR]: ids[i]
		},

		children
	})));

	const nodes = render.call(ctx.vdom, vnodes);
	ctx.$el?.append(...nodes);

	const components = globalThis[createdComponents] ?? new Set();
	globalThis[createdComponents] = components;

	ids.forEach((id) => {
		components.add(document.querySelector(`[${ID_ATTR}="${id}"]`));
	});
};

globalThis.removeCreatedComponents = () => {
	const
		components = globalThis[createdComponents];

	if (Object.isSet(components)) {
		Object.cast<Set<ComponentElement>>(components).forEach((node) => {
			node.component?.unsafe.$destroy();
			node.remove();
		});

		components.clear();
	}
};
