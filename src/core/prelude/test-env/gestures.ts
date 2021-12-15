/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';

/**
 * Class to create touch gestures
 */
export default class Gestures {
	/** @see [[TouchGesturesCreateOptions]] */
	readonly options: TouchGesturesCreateOptions;

	/** @see [[Async]] */
	readonly async: Async = new Async();

	/**
	 * Styled element that represents a touch position
	 */
	readonly cursor: HTMLDivElement = document.createElement('div');

	/**
	 * Steps to perform
	 */
	 steps: Array<Required<TouchGesturePoint>> = [];

	/**
	 * @param options
	 */
	constructor(options: TouchGesturesCreateOptions) {
		this.options = options;

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
	 * Emits a touch event
	 *
	 * @param step
	 * @param type
	 */
	protected emit(step: Required<TouchGesturePoint>, type: 'touchstart' | 'touchmove' | 'touchend'): void {
		const
			{dispatchEl, targetEl, x, y} = step;

		const
			resolvedDispatchEl = dispatchEl instanceof Element ? dispatchEl : document.querySelector(dispatchEl),
			resolvedTargetEl = targetEl instanceof Element ? targetEl : document.querySelector(targetEl);

		const touchEvent = new TouchEvent(type, {
			touches: [
				new Touch({
					identifier: Math.random(),
					target: resolvedTargetEl!,
					clientX: x,
					clientY: y
				})
			]
		});

		Object.assign(this.cursor.style, {
			left: x.px,
			top: y.px
		});

		resolvedDispatchEl?.dispatchEvent(touchEvent);
	}

	/**
	 * Fills an array with steps of points
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
				pause: 5,
				...options,
				...point
			};

			this.steps.push(newPoint);
		});
	}
}

globalThis._Gestures = Gestures;
