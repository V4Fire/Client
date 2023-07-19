/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

interface TransitionDetails<T> {
	href: string;
	target: T;
	data: Dictionary<string>;
}

export class HrefTransitionEvent<T extends Element = Element> extends CustomEvent<TransitionDetails<T>> {
	/**
	 * If this parameter is true, the router will not handle the transition associated with this event
	 */
	transitionPrevented: boolean = false;

	constructor(target: T) {
		super('hrefTransition', {
			cancelable: true,
			detail: {
				target,
				href: target.getAttribute('href') ?? '',
				data: getRouterDataAttrs()
			}
		});

		function getRouterDataAttrs() {
			const
				targetAttrs = target.attributes;

			const routerAttrs = Object.getOwnPropertyNames(targetAttrs)
				.filter((attr) => attr.startsWith('data-router-'));

			return Object.fromArray(routerAttrs, {
				key: (attr: string) => attr.replace(/data-router-/, '').camelize(false),
				value: (attr: string) => Object.parse(targetAttrs[attr].value)
			});
		}
	}

	/**
	 * Cancels the router's handling of the transition associated with this event.
	 * Unlike the `preventDefault` method, this method does not cancel the browser's own transition handling.
	 */
	preventRouterTransition(): void {
		this.transitionPrevented = true;
	}
}
