/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';

export default class Gestures {
	/** {@link globalThis.TouchGesturesCreateOptions} */
	readonly options: Required<TouchGesturesCreateOptions>;

	/** {@link Async} */
	readonly async: Async = new Async();

	/**
	 * A styled element that represents the touch position
	 */
	readonly cursor: HTMLDivElement = document.createElement('div');

	/**
	 * Steps to perform
	 */
	steps: Array<Required<TouchGesturePoint>> = [];

	/**
	 * @param opts
	 */
	constructor(opts?: TouchGesturesCreateOptions) {
		this.options = {
			pause: 5,
			targetEl: null,
			dispatchEl: null,
			...opts
		};

		Object.assign(this.cursor.style, {
			height: '20px',
			width: '20px',
			backgroundColor: 'red',
			borderRadius: '50%',
			position: 'absolute',
			display: 'none',
			zIndex: '10000'
		});

		document.body.appendChild(this.cursor);
	}

	/**
	 * Performs a swipe gesture
	 *
	 * @param points
	 * @param [emitTouchEnd]
	 */
	async swipe(points: TouchGesturePoint[], emitTouchEnd: boolean = true): Promise<void> {
		this.fillSteps(points);
		this.cursor.style.display = 'block';

		const
			firstStep = this.steps.shift(),
			lastStep = this.steps.pop();

		if (!firstStep || !lastStep) {
			return;
		}

		this.emit(firstStep, 'touchstart');
		this.emit(firstStep, 'touchmove');

		for (let i = 0; i < this.steps.length; i++) {
			const
				step = this.steps[i];

			await this.async.sleep(step.pause);
			this.emit(step, 'touchmove');
		}

		await this.async.sleep(lastStep.pause);
		this.emit(lastStep, 'touchmove');

		if (emitTouchEnd) {
			this.emit(lastStep, 'touchend');
		}

		this.cursor.style.display = 'none';
	}

	/**
	 * Generates steps for a swipe method
	 *
	 * @param count
	 * @param initialX
	 * @param initialY
	 * @param xChangePerStep
	 * @param yChangePerStep
	 * @param [opts]
	 */
	buildSteps(
		count: number,
		initialX: number,
		initialY: number,
		xChangePerStep: number,
		yChangePerStep: number,
		opts: Partial<TouchGesturesCreateOptions> = {}
	): TouchGesturePoint[] {
		const res: TouchGesturePoint[] = [
			{
				x: initialX,
				y: initialY
			}
		];

		count--;

		for (let i = 0; i < count; i++) {
			const
				prev = res[res.length - 1];

			res.push({
				x: prev.x + xChangePerStep,
				y: prev.y + yChangePerStep,
				...opts
			});
		}

		return res;
	}

	/**
	 * Dispatches a touch event
	 *
	 * @param eventType - the type of the event
	 * @param touchPoints - a point or an array of points for touches
	 * @param [targetEl] - the target element, defaults to `document.documentElement`
	 * @param [dispatchEl] - the dispatch element, defaults to `document.elementFromPoint(<first point>)`
	 */
	dispatchTouchEvent(
		eventType: 'touchstart' | 'touchmove' | 'touchend',
		touchPoints: CanArray<{ x: number; y: number }>,
		targetEl: CanNull<Element> = null,
		dispatchEl: CanNull<Element> = null
	): void {
		if (!Object.isArray(touchPoints)) {
			touchPoints = [touchPoints];
		}

		if (targetEl == null) {
			targetEl = document.documentElement;
		}

		if (dispatchEl == null) {
			const {x, y} = touchPoints[0];
			dispatchEl = document.elementFromPoint(x, y);
		}

		const event = new TouchEvent(eventType, {
			bubbles: true,
			cancelable: true,
			composed: true,
			touches: touchPoints.map<Touch>(({x: clientX, y: clientY}, identifier) => new Touch({
				identifier,
				clientX,
				clientY,
				target: targetEl!
			}))
		});

		dispatchEl!.dispatchEvent(event);
	}

	/**
	 * Emits the specified touch event
	 *
	 * @param step
	 * @param type
	 */
	protected emit(step: Required<TouchGesturePoint>, type: 'touchstart' | 'touchmove' | 'touchend'): void {
		const
			{dispatchEl, targetEl, x, y} = step;

		const
			resolvedDispatchEl = this.resolveEl(dispatchEl),
			resolvedTargetEl = this.resolveEl(targetEl);

		Object.assign(this.cursor.style, {
			left: x.px,
			top: y.px
		});

		this.dispatchTouchEvent(type, {x, y}, resolvedTargetEl, resolvedDispatchEl);
	}

	/**
	 * Fills the passed array with the steps of points
	 * @param points
	 */
	protected fillSteps(points: TouchGesturePoint[]): void {
		this.steps = [];

		points.forEach((point) => {
			const
				lastStackEl = <CanUndef<TouchGesturePoint>>this.steps[this.steps.length - 1],
				options = {...this.options};

			if (lastStackEl) {
				Object.assign(options, Object.select(lastStackEl, ['dispatchEl', 'targetEl', 'pause']));
			}

			const newPoint = {
				...options,
				...point
			};

			this.steps.push(newPoint);
		});
	}

	/**
	 * Resolves provided element
	 * @param el - an element to resolve
	 */
	protected resolveEl(el: Required<TouchGesturesCreateOptions>['targetEl']): CanNull<Element> {
		if (el == null || el instanceof Element) {
			return el;
		}

		return document.querySelector(el);
	}

}

globalThis._Gestures = Gestures;
