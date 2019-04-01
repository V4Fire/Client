/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iBlock, { component, system, hook, watch, wait, prop } from 'super/i-block/i-block';

export * from 'super/i-block/i-block';

/**
 * -1 - Предыдущий
 * 0 - Не изменилось
 * 1 - Следующий
 */
export type SlideDirection = number;
export type Mode = 'slider' | 'scroll';

export interface SlideRect extends ClientRect {
	offsetLeft: number;
}

export const
	$$ = symbolGenerator();

export const alignTypes = {
	start: true,
	center: true,
	end: true,
	none: true
};

export type AlignType = keyof typeof alignTypes;

/**
 * Вернет true если переданное значение находится в диапазоне X > 0 && X <= 1
 * @param v
 */
export function isBetweenZeroAndOne(v: number): boolean {
	return v > 0 && v <= 1;
}

/**
 * Вернет true если переданное значение больше 0 и конечно
 * @param v
 */
export function isNotInfinitePositiveNumber(v: number): boolean {
	return v > 0 && Number.isFinite(v);
}

@component({functional: true})
export default class bSlider extends iBlock {
	/**
	 * Режим работы слайдера
	 *   *) scroll - будет использоваться скролл
	 *   *) slider - будет использоваться реализация слайдера (невозможно пропускать слайды)
	 */
	@prop({type: String, validator: (v) => Boolean({slider: true, scroll: true}[v])})
	readonly mode: Mode = 'slider';

	/**
	 * Тип выравнивания слайдов
	 *   *) none - работает только для mode === 'scroll'
	 */
	@prop({type: String, validator: (v) => Boolean(alignTypes[v])})
	readonly align: AlignType = 'center';

	/**
	 * На сколько сдвиг по оси X соответствует движению пальца
	 */
	@prop({type: Number, validator: isBetweenZeroAndOne})
	readonly deltaX: number = 0.9;

	/**
	 * Минимально необходимый процент для прокрутки слайдера на другой слайд
	 */
	@prop({type: Number, validator: isBetweenZeroAndOne})
	readonly threshold: number = 0.3;

	/**
	 * Минимально необходимый процент для прокрутки слайдера на другой слайд
	 * при быстром свайпе по слайдеру
	 */
	@prop({type: Number, validator: isBetweenZeroAndOne})
	readonly fastSwipeThreshold: number = 0.05;

	/**
	 * Время (в секундах) после которого можно засчитывать что это был быстрый свайп
	 */
	@prop({type: Number, validator: isNotInfinitePositiveNumber})
	readonly fastSwipeDelay: number = (0.3).seconds();

	/**
	 * Минимальный порог смещения по оси X при котором будет считаться что пользовать двигает слайдер (в px)
	 */
	@prop({type: Number, validator: isNotInfinitePositiveNumber})
	readonly swipeToleranceX: number = 10;

	/**
	 * Минимальный порог смещения по оси Y при котором будет считаться что пользовать двигает слайдер (в px)
	 */
	@prop({type: Number, validator: isNotInfinitePositiveNumber})
	readonly swipeToleranceY: number = 50;

	/**
	 * Количество слайдов в элементе
	 */
	@system()
	length: number = 0;

	/**
	 * Текущий слайд
	 */
	@system()
	current: number = 0;

	/**
	 * true, если mode === 'slider'
	 */
	get isSlider(): boolean {
		return this.mode === 'slider';
	}

	/**
	 * Вернет текущую прокрутку слайдера
	 */
	get currentOffset(): number {
		const
			{slidesRects, current, align, viewRect} = this,
			slideRect = slidesRects[current];

		if (!slideRect || !viewRect) {
			return 0;
		}

		if (current === 0) {
			return 0;
		}

		switch (align) {
			case 'center':
				return slideRect.offsetLeft - (viewRect.width - slideRect.width) / 2;
			case 'start':
				return  slideRect.offsetLeft;
			case 'end':
				return slideRect.offsetLeft + slideRect.width;
			default:
				return 0;
		}
	}

	/** @override */
	protected $refs!: {
		view?: HTMLElement;
		wrapper?: HTMLElement;
	};

	/**
	 * X позиция первого касания на слайдере
	 */
	@system()
	protected startX: number = 0;

	/**
	 * Y позиция первого касания на слайдере
	 */
	@system()
	protected startY: number = 0;

	/**
	 * Разница между положения касания по оси X при начале слайдинг и в конце
	 */
	@system()
	protected diffX: number = 0;

	/**
	 * Пройден ли минимальный порог для начала слайдинга слайдов
	 * @see swipeTolerance
	 */
	@system()
	protected isTolerancePassed: boolean = false;

	/**
	 * Позиции элементов
	 */
	@system()
	protected slidesRects: SlideRect[] = [];

	/**
	 * Размер и позиция слайдера
	 */
	@system()
	protected viewRect?: ClientRect;

	/**
	 * Хранит временную метку начала касания на слайдере
	 */
	@system()
	protected startTime: number = 0;

	/**
	 * Вернет true если пользователь начал прокрутку страницы
	 */
	@system()
	protected scrolling: boolean = true;

	/** @override */
	protected tmp: {swiping?: boolean} = {};

	/**
	 * Обновляет состояние слайдера
	 */
	syncState(): void {
		const
			{view, wrapper} = this.$refs;

		if (!view || !wrapper || !this.isSlider) {
			return;
		}

		const
			{children} = wrapper,
			viewRect = view.getBoundingClientRect();

		this.viewRect = viewRect;
		this.length = children.length;
		this.slidesRects = [];

		for (let i = 0; i < children.length; i++) {
			const
				child = <HTMLElement>children[i];

			this.slidesRects[i] = Object.assign(child.getBoundingClientRect(), {
				offsetLeft: child.offsetLeft
			});
		}
	}

	/**
	 * @see syncState
	 */
	@hook('mounted')
	@watch('?window:resize')
	@wait('ready')
	syncStateAsync(): CanPromise<void> {
		if (!this.isSlider) {
			return;
		}

		const
			{wrapper} = this.$refs;

		if (!wrapper) {
			return;
		}

		this.async.setTimeout(async ()  => {
			this.syncState();
			wrapper.style.setProperty('--offset', `${this.currentOffset}px`);
		}, 50, {label: $$.syncStateAsync, join: true});
	}

	/**
	 * Переключение на следующий слайд
	 * @param dir - направление
	 */
	changeSlide(dir: SlideDirection): boolean {
		const
			{current, length, $refs} = this;

		if (dir < 0 && current > 0 || dir > 0 && current < length - 1) {
			const
				{wrapper} = $refs;

			if (!wrapper) {
				return false;
			}

			this.current += dir;
			wrapper.style.setProperty('--offset', `${this.currentOffset}px`);
			return true;
		}

		return false;
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('mode', 'mode', String);
		this.sync.mod('align', 'align', String);
	}

	/** @override */
	protected initGlobalEvents(): void {
		super.initGlobalEvents();

		if (this.isSlider) {
			this.async.on(document, 'scroll', () => this.scrolling = true, {label: $$.setScrolling});
		}
	}

	/**
	 * Обработчик: сохраняет позицию начального нажатия на экране
	 * @param e
	 */
	protected onStart(e: TouchEvent): void {
		this.scrolling = false;

		const
			touch = e.touches[0],
			{clientX, clientY} = touch,
			{wrapper} = this.$refs;

		if (!wrapper) {
			return;
		}

		this.startX = clientX;
		this.startY = clientY;

		this.syncState();
		this.setMod('swipe', true);

		this.startTime = performance.now();
	}

	/**
	 * Обработчик: отменяет скролл если пытаются просвайпить слайдер вбок, устанавливает изменение
	 * положения слайдера
	 *
	 * @param e
	 * @emits swipeStart()
	 */
	protected onMove(e: TouchEvent): void {
		if (this.scrolling) {
			return;
		}

		const
			{startX, startY, tmp} = this,
			{wrapper} = this.$refs;

		const
			touch = e.touches[0],
			isTolerancePassed = this.isTolerancePassed ||
				Math.abs(startX - touch.clientX) > this.swipeToleranceX && Math.abs(startY - touch.clientY) < this.swipeToleranceY,
			diffX = startX - touch.clientX;

		if (!wrapper || !isTolerancePassed) {
			return;
		}

		if (!tmp.swiping) {
			this.emit('swipeStart');
		}

		e.preventDefault();
		e.stopPropagation();

		tmp.swiping = true;
		this.isTolerancePassed = true;
		this.diffX = diffX;

		const
			transform = this.diffX * this.deltaX;

		wrapper.style.setProperty('--transform', `${transform}px`);
	}

	/**
	 * Обработчик: устанавливает нужную позицию слайдеру
	 *
	 * @emits swipeEnd(dir: SwipeDirection, isSwiped: boolean)
	 */
	protected onRelease(): void {
		if (this.scrolling) {
			this.scrolling = false;
			return;
		}

		const {
			slidesRects,
			diffX,
			viewRect,
			threshold,
			startTime,
			fastSwipeDelay,
			fastSwipeThreshold,
			tmp
		} = this;

		const
			{wrapper} = this.$refs,
			dir: SlideDirection = Math.sign(diffX);

		let
			isSwiped = false;

		if (!wrapper || !slidesRects || !viewRect) {
			return;
		}

		const
			timestamp = performance.now(),
			passedValue = Number(Math.abs(dir * diffX / viewRect.width).toFixed(2)),
			isFastSwiped = timestamp - startTime < fastSwipeDelay && passedValue > fastSwipeThreshold,
			isThresholdPassed = passedValue > threshold;

		if (isThresholdPassed || isFastSwiped) {
			isSwiped = this.changeSlide(dir);
		}

		this.diffX = 0;
		wrapper.style.setProperty('--transform', '0px');
		this.removeMod('swipe', true);
		this.emit('swipeEnd', dir, isSwiped);
		this.isTolerancePassed = false;
		tmp.swiping = false;
	}
}
