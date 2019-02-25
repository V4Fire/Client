/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iBlock from 'super/i-block/i-block';
import Async from 'core/async';

const
	$$ = symbolGenerator();

export function activate(component: iBlock, force?: boolean): void {
	if (!this.isActivated || force) {
		this.initStateFromRouter();
		this.execCbAfterCreated(() => this.rootEvent.on('onTransition', async (route, type) => {
			try {
				if (type === 'hard') {
					if (route !== this.r.route) {
						await this.rootEvent.promisifyOnce('setRoute', {
							label: $$.activateAfterTransition
						});

					} else {
						await this.nextTick({label: $$.activateAfterHardChange});
					}
				}

				if (!{destroyed: true, inactive: true}[this.componentStatus]) {
					this.initStateFromRouter();
				}

			} catch (err) {
				stderr(err);
			}

		}, {
			label: $$.activate
		}));
	}

	if (this.isBeforeCreate()) {
		return;
	}

	const
		els = new Set();

	const exec = (ctx: iBlock = this) => {
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
		{$el} = this;

	if (this.forceActivation && $el) {
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
 */
export function deactivate(component: iBlock): void {
	if (this.isBeforeCreate()) {
		return;
	}

	const
		els = new Set();

	const exec = (ctx: iBlock = this) => {
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
		{$el} = this;

	if (this.forceActivation && $el) {
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
		// @ts-ignore
		{async: $a} = component;

	if (component.isActivated) {
		return;
	}

	$a.unmuteAll().unsuspendAll();
	component.componentStatus = 'beforeReady';

	if (component.needReInit) {
		$a.setImmediate(() => {
			const
				v = component.reload();

			if (Object.isPromise(v)) {
				v.catch(stderr);
			}

		}, {
			label: $$.activated
		});
	}

	if (!readyEvents[component.componentStatus]) {
		component.componentStatus = 'beforeReady';
	}

	component.componentStatus = 'ready';
	component.isActivated = true;
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
