/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import type { AsyncOptions } from 'core/async';

import Friend from 'components/friends/friend';
import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import { componentDataLocalEvents, componentLocalEvents } from 'components/base/b-scrolly/const';
import type { SlotsStateObj } from 'components/base/b-scrolly/modules/slots/interface';

export * from 'components/base/b-scrolly/modules/slots/interface';

export const
	$$ = symbolGenerator(),
	slotsStateControllerAsyncGroup = 'slotsStateController';

/**
 * Класс реализующий показ нужных слотов в нужный момент времени.
 */
export class SlotsStateController extends Friend {

	/**
	 * {@link bScrolly}
	 */
	override readonly C!: bScrolly;

	/**
	 * Опции для асинхронной функции обновление состояния отображения слотов.
	 */
	protected readonly asyncUpdateLabel: AsyncOptions = {
		label: $$.updateSlotsVisibility,
		group: slotsStateControllerAsyncGroup
	};

	/**
	 * @param ctx
	 */
	constructor(ctx: bScrolly) {
		super(ctx);

		const
			{typedLocalEmitter} = ctx;

		typedLocalEmitter.on(componentDataLocalEvents.dataLoadError, () => this.loadingFailedState());
		typedLocalEmitter.on(componentDataLocalEvents.dataLoadStart, () => this.loadingProgressState());
		typedLocalEmitter.on(componentDataLocalEvents.dataLoadSuccess, () => this.loadingSuccessState());
		typedLocalEmitter.on(componentDataLocalEvents.dataEmpty, () => this.emptyState());
		typedLocalEmitter.on(componentLocalEvents.done, () => this.doneState());
		typedLocalEmitter.on(componentLocalEvents.resetState, () => this.reset());
	}

	/**
	 * Отображает слоты которые должны отображаться при пустом состоянии.
	 */
	emptyState(): void {
		this.setSlotsVisibility({
			container: true,
			done: true,
			empty: true,
			loader: false,
			renderNext: false,
			retry: false,
			tombstones: false
		});
	}

	doneState(): void {
		this.setSlotsVisibility({
			container: true,
			done: true,
			empty: false,
			loader: false,
			renderNext: false,
			retry: false,
			tombstones: false
		});
	}

	/**
	 * Отображает слоты которые должны отображаться в момент загрузки данных.
	 */
	loadingProgressState(): void {
		this.setSlotsVisibility({
			container: true,
			loader: true,
			tombstones: true,
			done: false,
			empty: false,
			renderNext: false,
			retry: false
		});
	}

	/**
	 * Отображает слоты которые должны отображаться в момент неудачной загрузки.
	 */
	loadingFailedState(): void {
		this.setSlotsVisibility({
			container: true,
			retry: true,
			done: false,
			empty: false,
			loader: false,
			renderNext: false,
			tombstones: false
		});
	}

	/**
	 * Отображает слоты которые должны отображаться в момент успешной загрузки данных.
	 */
	loadingSuccessState(): void {
		// Здесь нужно не loadingSuccessState а какое-то другое событие так как LoadingSuccess может происходить много раз
		this.setSlotsVisibility({
			container: true,
			done: false,
			empty: false,
			loader: false,
			renderNext: false,
			retry: false,
			tombstones: false
		});
	}

	/**
	 * Очищает состояние модуля.
	 */
	reset(): void {
		this.async.clearAll({group: new RegExp(slotsStateControllerAsyncGroup)});
	}

	/**
	 * Устанавливает состояние слотов.
	 *
	 * @param stateObj
	 */
	protected setSlotsVisibility(stateObj: Required<SlotsStateObj>): void {
		this.async.cancelAnimationFrame(this.asyncUpdateLabel);

		this.async.requestAnimationFrame(() => {
			for (const [name, state] of Object.entries(stateObj)) {
				this.setDisplayState(<keyof SlotsStateObj>name, state);
			}

		}, this.asyncUpdateLabel);
	}

	/**
	 * Устанавливает состояние слота.
	 *
	 * @param name
	 * @param state
	 */
	protected setDisplayState(name: keyof SlotsStateObj, state: boolean): void {
		const
			ref = this.ctx.$refs[name];

		if (ref) {
			ref.style.display = state ? '' : 'none';
		}
	}
}
