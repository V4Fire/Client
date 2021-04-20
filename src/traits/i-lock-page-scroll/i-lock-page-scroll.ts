/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-lock-page-scroll/README.md]]
 * @packageDocumentation
 */

/* eslint-disable @typescript-eslint/no-unused-vars-experimental */

import symbolGenerator from 'core/symbol';
import { is } from 'core/browser';

import type iBlock from 'super/i-block/i-block';
import type { ModEvent } from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

const
	group = 'lockHelpers';

export default abstract class iLockPageScroll {
	/** @see [[iLockPageScroll.lock]] */
	static lock<T extends iBlock>(component: T, scrollableNode?: Element): Promise<void> {
		const
			{$root: r, $root: {unsafe: {async: $a}}} = component;

		let
			promise = Promise.resolve();

		if (r[$$.isLocked] === true) {
			$a.clearAll({group});
			return promise;
		}

		const lockLabel = {
			group,
			label: $$.lock
		};

		if (is.mobile !== false) {
			if (is.iOS !== false) {
				if (scrollableNode) {
					const
						onTouchStart = (e: TouchEvent) => component[$$.initialY] = e.targetTouches[0].clientY;

					$a.on(scrollableNode, 'touchstart', onTouchStart, {
						group,
						label: $$.touchstart
					});

					const onTouchMove = (e: TouchEvent) => {
						let
							scrollTarget = <HTMLElement>(e.target ?? scrollableNode);

						while (scrollTarget !== scrollableNode) {
							if (scrollTarget.scrollHeight > scrollTarget.clientHeight || !scrollTarget.parentElement) {
								break;
							}

							scrollTarget = scrollTarget.parentElement;
						}

						const {
							scrollTop,
							scrollHeight,
							clientHeight
						} = scrollTarget;

						const
							clientY = e.targetTouches[0].clientY - component[$$.initialY],
							isOnTop = clientY > 0 && scrollTop === 0,
							isOnBottom = clientY < 0 && scrollTop + clientHeight + 1 >= scrollHeight;

						if ((isOnTop || isOnBottom) && e.cancelable) {
							return e.preventDefault();
						}

						e.stopPropagation();
					};

					$a.on(scrollableNode, 'touchmove', onTouchMove, {
						group,
						label: $$.touchmove,
						options: {passive: false}
					});
				}

				$a.on(document, 'touchmove', (e: TouchEvent) => e.cancelable && e.preventDefault(), {
					group,
					label: $$.preventTouchMove,
					options: {passive: false}
				});
			}

			const {
				body,
				documentElement: html
			} = document;

			promise = $a.promise(new Promise((res) => {
				$a.requestAnimationFrame(() => {
					const scrollTop = Object.isTruly(html.scrollTop) ?
						html.scrollTop :
						body.scrollTop;

					component[$$.scrollTop] = scrollTop;
					body.style.top = `-${scrollTop}px`;
					r.setRootMod('lockScrollMobile', true);

					r[$$.isLocked] = true;
					res();

				}, lockLabel);
			}), {join: true, ...lockLabel});

		} else {
			promise = $a.promise(new Promise((res) => {
				$a.requestAnimationFrame(() => {
					const
						{body} = document;

					const
						scrollBarWidth = globalThis.innerWidth - body.clientWidth;

					component[$$.paddingRight] = body.style.paddingRight;
					body.style.paddingRight = `${scrollBarWidth}px`;
					r.setRootMod('lockScrollDesktop', true);

					r[$$.isLocked] = true;
					res();

				}, lockLabel);
			}), {join: true, ...lockLabel});
		}

		return promise;
	}

	/** @see [[iLockPageScroll.unlock]] */
	static unlock<T extends iBlock>(component: T): Promise<void> {
		const
			{$root: r, $root: {unsafe: {async: $a}}} = component.unsafe,
			{body} = document;

		if (r[$$.isLocked] !== true) {
			return Promise.resolve();
		}

		return $a.promise(new Promise((res) => {
			$a.off({group});

			$a.requestAnimationFrame(() => {
				r.removeRootMod('lockScrollMobile', true);
				r.removeRootMod('lockScrollDesktop', true);
				r[$$.isLocked] = false;

				if (is.mobile !== false) {
					globalThis.scrollTo(0, component[$$.scrollTop]);
				}

				body.style.paddingRight = component[$$.paddingRight] ?? '';
				res();

			}, {group, label: $$.unlockRaf, join: true});

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
			{$async: $a, localEmitter: $e} = component.unsafe;

		$e.on('block.mod.*.opened.*', (e: ModEvent) => {
			if (e.type === 'remove' && e.reason !== 'removeMod') {
				return;
			}

			void component[e.value === 'false' || e.type === 'remove' ? 'unlock' : 'lock']();
		});

		$a.worker(() => {
			component.unlock().catch(stderr);
			delete component[$$.paddingRight];
			delete component[$$.scrollTop];
		});
	}

	/**
	 * Locks the document scroll, i.e.,
	 * it prevents any scrolling on the document except withing the specified node
	 *
	 * @param [scrollableNode] - node inside which is allowed to scroll
	 */
	lock(scrollableNode?: Element): Promise<void> {
		return <any>null;
	}

	/**
	 * Unlocks the document scroll
	 */
	unlock(): Promise<void> {
		return <any>null;
	}
}
