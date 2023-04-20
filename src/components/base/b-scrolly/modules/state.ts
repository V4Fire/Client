/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import { componentDataLocalEvents, componentLocalEvents } from 'components/base/b-scrolly/const';
import type { ComponentState } from 'components/base/b-scrolly/interface';
import Friend from 'components/friends/friend';

export class ComponentInternalState extends Friend {

	/**
	 * {@link bScrolly}
	 */
	override readonly C!: bScrolly;

	protected currentLoadPage: number = 0;

	protected currentRenderPage: number = 0;

	protected data: object[] = [];

	protected lastLoadedData: object[] = [];

	protected lastLoadedRawData: CanUndef<unknown>;

	protected isLastEmpty: boolean = false;

	protected isInitialLoading: boolean = true;

	/**
	 * @param ctx
	 */
	constructor(ctx: bScrolly) {
		super(ctx);

		const
			{typedLocalEmitter} = ctx;

		typedLocalEmitter.on(componentDataLocalEvents.dataLoadStart, () => this.incrementLoadPage());
		typedLocalEmitter.on(componentDataLocalEvents.dataLoadSuccess, (...args) => this.updateData(...args));
		typedLocalEmitter.on(componentLocalEvents.convertDataToDB, (...args) => this.updateRawLastLoaded(...args));
		typedLocalEmitter.on(componentLocalEvents.resetState, (...args) => this.reset(...args));
	}

	/**
	 * Собирает состояние компонента в один объект.
	 */
	compile(): ComponentState {
		return {
			loadPage: this.currentLoadPage,
			renderPage: this.currentRenderPage,
			data: this.data,
			isLastEmpty: this.isLastEmpty,
			isInitialLoading: this.isInitialLoading,
			lastLoaded: this.lastLoadedData,
			lastLoadedRawData: this.lastLoadedRawData
		};
	}

	/**
	 * Обнуляет состояние модуля.
	 */
	reset(): void {
		this.currentLoadPage = -1;
		this.currentRenderPage = -1;
		this.data = [];
		this.isLastEmpty = false;
		this.isInitialLoading = true;
	}

	/**
	 * Обновляет указатель последней загруженной страницы.
	 */
	incrementLoadPage(): this {
		this.currentLoadPage++;
		return this;
	}

	/**
	 * Обновляет указать последней отрисованной страницы.
	 */
	incrementRenderPage(): this {
		this.currentRenderPage++;
		return this;
	}

	/**
	 * Обновляет состояние последних сырых загруженных данных.
	 *
	 * @param data
	 */
	updateRawLastLoaded(data: unknown): this {
		this.lastLoadedRawData = data;
		return this;
	}

	/**
	 * Обновляет состояние загруженных данных.
	 *
	 * @param data
	 * @param isInitialLoading
	 */
	updateData(data: object[], isInitialLoading: boolean): this {
		this.data = this.data.concat(data);
		this.isLastEmpty = data.length === 0;
		this.isInitialLoading = isInitialLoading;
		this.lastLoadedData = data;

		return this;
	}
}
