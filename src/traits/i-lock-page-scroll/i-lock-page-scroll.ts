/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { is } from 'core/browser';
import symbolGenerator from 'core/symbol';
import iBlock, { ModEvent } from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

const
	group = 'lockHelpers';

export default abstract class iLockPageScroll {
	/**
	 * Locks the document scroll
	 *
	 * @param component
	 * @param [scrollableNode] - node inside which is allowed to scroll
	 */
	static lock<T extends iBlock>(component: T, scrollableNode?: Element): Promise<void> {
		const
			// @ts-ignore (access)
			{async, $root: r, $root: {async: rootAsync}} = component;

		let
			promise = Promise.resolve();

		if (r[$$.isLocked]) {
			rootAsync.clearAll({group});
			return promise;
		}

		if (is.iOS) {
			if (scrollableNode) {
				async.on(
					scrollableNode,
					'touchstart',

					(e: TouchEvent) =>
						component[$$.initialY] = e.targetTouches[0].clientY,

					{
						group,
						label: $$.touchstart
					}
				);

				async.on(scrollableNode, 'touchmove', (e: TouchEvent) => {
					const {
						scrollTop,
						scrollHeight,
						clientHeight
					} = scrollableNode;

					const
						clientY = e.targetTouches[0].clientY - component[$$.initialY],
						isOnTop = clientY > 0 && scrollTop  === 0,
						isOnBottom = clientY < 0 && scrollTop + clientHeight + 1 >= scrollHeight;

					if ((isOnTop || isOnBottom) && e.cancelable) {
						return e.preventDefault();
					}

					e.stopPropagation();

				}, {
					group,
					label: $$.touchmove,
					options: {passive: false}
				});
			}

			async.on(document, 'touchmove', (e) => e.cancelable && e.preventDefault(), {
				group,
				label: $$.preventTouchMove,
				options: {passive: false}
			});

		} else if (is.Android) {
			const
				html = document.documentElement,
				body = document.body;

			promise = async.promise(new Promise((res) => {
				async.requestAnimationFrame(() => {
					const
						scrollTop = html.scrollTop || body.scrollTop;

					component[$$.scrollTop] = scrollTop;
					body.style.top = `-${scrollTop}px`;
					r.setRootMod('lockScrollMobile', true, r);

					res();

				}, {group, label: $$.lock});
			}), {group, label: $$.lock, join: true});

		} else {
			promise = async.promise(new Promise((res) => {
				async.requestAnimationFrame(() => {
					const
						{body} = document,
						scrollBarWidth = window.innerWidth - body.clientWidth;

					component[$$.paddingRight] = body.style.paddingRight;
					body.style.paddingRight = `${scrollBarWidth}px`;
					r.setRootMod('lockScrollDesktop', true, r);

					res();

				}, {group, label: $$.lock});
			}), {group, label: $$.lock, join: true});
		}

		r[$$.isLocked] = true;
		return promise;
	}

	/**
	 * Unlocks the document scroll
	 * @param component
	 */
	static unlock<T extends iBlock>(component: T): Promise<void> {
		const
			// @ts-ignore (access)
			{async, $root: r, $root: {async: rootAsync}} = component,
			{body} = document;

		if (!r[$$.isLocked]) {
			return Promise.resolve();
		}

		return rootAsync.promise(new Promise((res) => {
			async.off({group});

			rootAsync.requestAnimationFrame(() => {
				r.removeRootMod('lockScrollMobile', true, r);
				r.removeRootMod('lockScrollDesktop', true, r);
				r[$$.isLocked] = false;

				if (is.Android) {
					window.scrollTo(0, component[$$.scrollTop]);
				}

				body.style.paddingRight = component[$$.paddingRight] || '';
				res();

			}, {group, label: $$.unlock});

		}), {
			group,
			label: $$.unlock,
			join: true
		});
	}

	/**
	 * Initializes modifier event listeners
	 * @param component
	 */
	static initModEvents<T extends iBlock>(component: T & iLockPageScroll): void {
		const
			// @ts-ignore (access)
			{$async: $a, localEvent: $e} = component;

		$e.on('block.mod.*.opened.*', (e: ModEvent) => {
			if (e.type === 'remove' && e.reason !== 'removeMod') {
				return;
			}

			component[e.value === 'false' || e.type === 'remove' ? 'unlock' : 'lock']();
		});

		$a.worker(() => {
			component.unlock().catch(stderr);
			delete component[$$.paddingRight];
			delete component[$$.scrollTop];
		});
	}

	/**
	 * Locks the document scroll
	 */
	abstract lock(): Promise<void>;

	/**
	 * Unlocks the document scroll
	 */
	abstract unlock(force?: boolean): Promise<void>;
}
