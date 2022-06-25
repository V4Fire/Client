import type { DirectiveHookParams, AriaRoleEngine } from 'core/component/directives/aria/interface';
import type iBlock from 'super/i-block/i-block';
import * as ariaRoles from 'core/component/directives/aria/roles-engines/index';

export function setAriaLabel({el, opts, vnode}: DirectiveHookParams): void {
	const
		{dom, vdom, $createElement: createElem} = Object.cast<iBlock['unsafe']>(vnode.fakeContext),
		value = opts.value ?? <any>{};

	for (const mod in opts.modifiers) {
		if (!mod.startsWith('#')) {
			continue;
		}

		const
			title = mod.slice(1),
			id = dom.getId(title);

		if ('labelledby' in opts.modifiers) {
			el.setAttribute('aria-labelledby', id);

		} else {
			el.setAttribute('id', id);

			const
				labelNode = createElem.call(vnode.fakeContext,
					'label',
					{
						attrs: {for: id}
					});

			const
				labelElem = vdom.render(labelNode);

			el.prepend(labelElem);
		}
	}

	if (value.label != null) {
		el.setAttribute('aria-label', value.label);

	} else if (value.labelledby != null) {
		el.setAttribute('aria-labelledby', dom.getId(value.labelledby));
	}

	if (value.description != null) {
		el.setAttribute('aria-description', value.description);

	} else if (value.describedby != null) {
		el.setAttribute('aria-describedby', dom.getId(value.describedby));
	}
}

export function setAriaTabIndex({opts, vnode}: DirectiveHookParams): void {
	if (opts.value == null) {
		return;
	}

	const
		names = opts.value.children,
		{block} = Object.cast<iBlock['unsafe']>(vnode.fakeContext);

	for (const name of names) {
		const
			elems = block?.elements(name);

		elems?.forEach((el: Element) => {
			el.setAttribute('tabindex', '0');
		});
	}
}

export function setAriaRole(options: DirectiveHookParams): CanUndef<AriaRoleEngine> {
	const
		{arg: role} = options.opts;

	if (role == null) {
		return;
	}

	return new ariaRoles[role](options);
}
