/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import symbolGenerator from 'core/symbol';
import iBlock from 'super/i-block/i-block';
import { runHook, ComponentElement } from 'core/component';

const
	$$ = symbolGenerator();

const inactiveStatuses = {
	destroyed: true,
	inactive: true
};

/**
 * Activates the component
 *
 * @param component
 * @param [force]
 */
export function activate(component: iBlock, force?: boolean): void {
	const
		c = component,
		// @ts-ignore
		event = c.rootEvent;

	if (!c.isActivated || force) {
		c.state.initStateFromRouter();
		c.lfc.execCbAfterComponentCreated(() => event.on('onTransition', async (route, type) => {
			try {
				if (type === 'hard') {
					if (route !== c.r.route) {
						await event.promisifyOnce('setRoute', {
							label: $$.activateAfterTransition
						});

					} else {
						await c.nextTick({label: $$.activateAfterHardChange});
					}
				}

				if (!inactiveStatuses[c.componentStatus]) {
					c.state.initStateFromRouter();
				}

			} catch (err) {
				stderr(err);
			}

		}, {
			label: $$.activate
		}));
	}

	if (c.lfc.isBeforeCreate()) {
		return;
	}

	const
		els = new Set();

	const exec = (ctx: iBlock = c) => {
		els.add(ctx);

		const
			children = ctx.$children;

		if (children) {
			for (let i = 0; i < children.length; i++) {
				exec(children[i]);
			}
		}
	};

	exec();

	const
		{$el} = c;

	if (c.forceActivation && $el) {
		const
			domEls = $el.querySelectorAll('.i-block-helper');

		for (let i = 0; i < domEls.length; i++) {
			const
				el = (<ComponentElement>domEls[i]).component;

			if (el) {
				els.add(el);
			}
		}
	}

	for (let w = els.values(), el = w.next(); !el.done; el = w.next()) {
		const
			ctx = el.value;

		if (!ctx.isActivated) {
			runHook('activated', ctx.meta, ctx).then(() => ctx.activated(), stderr);
		}
	}
}

/**
 * Deactivates the component
 * @param component
 */
export function deactivate(component: iBlock): void {
	const
		c = component;

	if (c.lfc.isBeforeCreate()) {
		return;
	}

	const
		els = new Set();

	const exec = (ctx: iBlock = c) => {
		els.add(ctx);

		const
			children = ctx.$children;

		if (children) {
			for (let i = 0; i < children.length; i++) {
				exec(children[i]);
			}
		}
	};

	exec();

	const
		{$el} = c;

	if (c.forceActivation && $el) {
		const
			domEls = $el.querySelectorAll('.i-block-helper');

		for (let i = 0; i < domEls.length; i++) {
			const
				el = (<ComponentElement>domEls[i]).component;

			if (el) {
				els.add(el);
			}
		}
	}

	for (let w = els.values(), el = w.next(); !el.done; el = w.next()) {
		const
			ctx = el.value;

		if (ctx.isActivated) {
			runHook('deactivated', ctx.meta, ctx).then(() => ctx.deactivated(), stderr);
		}
	}
}

const readyEvents = {
	beforeReady: true,
	ready: true
};

/**
 * Handler: component activated hook
 * @param component
 */
export function onActivated(component: iBlock): void {
	const
		c = component,

		// @ts-ignore
		{async: $a} = c;

	if (c.isActivated) {
		return;
	}

	$a.unmuteAll().unsuspendAll();
	c.componentStatus = 'beforeReady';

	if (c.needReInit) {
		$a.setImmediate(() => {
			const
				v = c.reload();

			if (Object.isPromise(v)) {
				v.catch(stderr);
			}

		}, {
			label: $$.activated
		});
	}

	if (!readyEvents[c.componentStatus]) {
		c.componentStatus = 'beforeReady';
	}

	c.componentStatus = 'ready';
	c.isActivated = true;
}

const
	suspendRgxp = /:suspend(?:\b|$)/,
	asyncNames = Async.linkNames;

const nonMuteAsync = {
	[asyncNames.promise]: true,
	[asyncNames.request]: true
};

/**
 * Handler: component deactivated hook
 * @param component
 */
export function onDeactivated(component: iBlock): void {
	const
		// @ts-ignore
		{async: $a} = component;

	for (let keys = Object.keys(asyncNames), i = 0; i < keys.length; i++) {
		const
			key = keys[i];

		if (nonMuteAsync[key]) {
			continue;
		}

		const
			fn = $a[`mute-${asyncNames[key]}`.camelize(false)];

		if (Object.isFunction(fn)) {
			fn.call($a);
		}
	}

	$a
		.unmuteAll({group: suspendRgxp})
		.suspendAll();

	component.componentStatus = 'inactive';
	component.isActivated = false;
}
