/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import { componentDataLocalEvents, componentLocalEvents, componentRenderLocalEvents } from 'components/base/b-scrolly/const';
import type { ComponentState, MountedComponentItem } from 'components/base/b-scrolly/interface';
import Friend from 'components/friends/friend';

export class ComponentInternalState extends Friend {

	/**
	 * {@link bScrolly}
	 */
	override readonly C!: bScrolly;

	protected currentLoadPage: number = 0;

	protected currentRenderPage: number = 0;

	protected itemsTillEnd: CanUndef<number> = undefined;

	protected maxViewedIndex: CanUndef<number> = undefined;

	protected data: object[] = [];

	protected lastLoadedData: object[] = [];

	protected lastLoadedRawData: CanUndef<unknown>;

	protected isLastEmpty: boolean = false;

	protected isInitialLoading: boolean = true;

	protected isDone: boolean = false;

	/**
	 * Component items that was rendered
	 */
	protected mountedItems: MountedComponentItem[] = [];

	/**
	 * `True` if the next rendering process will be initial
	 */
	protected isInitialRender: boolean = true;

	/**
	 * @param ctx
	 */
	constructor(ctx: bScrolly) {
		super(ctx);

		const
			{typedLocalEmitter} = ctx;

		typedLocalEmitter.on(componentDataLocalEvents.dataLoadStart, () => this.incrementLoadPage());
		typedLocalEmitter.on(componentDataLocalEvents.dataLoadSuccess, (...args) => this.updateData(...args));
		typedLocalEmitter.on(componentLocalEvents.convertDataToDB, (...args) => this.setRawLastLoaded(...args));
		typedLocalEmitter.on(componentLocalEvents.resetState, (...args) => this.reset(...args));
		typedLocalEmitter.on(componentLocalEvents.done, () => this.setIsDone(true));

		typedLocalEmitter.on(componentRenderLocalEvents.renderStart, () => {
			this.setIsInitialRender(false);
			this.incrementRenderPage();
		});
	}

	/**
	 * Собирает состояние компонента в один объект.
	 */
	compile(): Readonly<ComponentState> {
		return {
			loadPage: this.currentLoadPage,
			renderPage: this.currentRenderPage,
			data: this.data,
			isLastEmpty: this.isLastEmpty,
			isInitialLoading: this.isInitialLoading,
			isInitialRender: this.isInitialRender,
			isDone: this.isDone,
			lastLoaded: this.lastLoadedData,
			lastLoadedRawData: this.lastLoadedRawData,
			maxViewedIndex: this.maxViewedIndex,
			mountedItems: this.mountedItems,
			itemsTillEnd: this.itemsTillEnd
		};
	}

	/**
	 * Обнуляет состояние модуля.
	 */
	reset(): void {
		this.currentLoadPage = 0;
		this.currentRenderPage = 0;
		this.maxViewedIndex = 0;
		this.itemsTillEnd = 0;
		this.data = [];
		this.mountedItems = [];
		this.isLastEmpty = false;
		this.isDone = false;
		this.isInitialLoading = true;
		this.isInitialRender = true;
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

	storeComponentItems(items: MountedComponentItem[]): this {
		this.mountedItems.push(...items);
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

	updateMountedComponents(mountedItems: MountedComponentItem[]): this {
		this.mountedItems.push(...mountedItems);
		return this;
	}

	updateItemsTillEnd(): this {
		if (this.maxViewedIndex == null) {
			throw new Error('Missing max viewed index');
		}

		this.itemsTillEnd = this.mountedItems.length - 1 - this.maxViewedIndex;
		return this;
	}

	/**
	 * Обновляет состояние последних сырых загруженных данных.
	 *
	 * @param data
	 */
	setRawLastLoaded(data: unknown): this {
		this.lastLoadedRawData = data;
		return this;
	}

	setIsDone(v: boolean): this {
		this.isDone = v;
		return this;
	}

	/**
	 * Sets an initial render state
	 *
	 * @param state
	 */
	setIsInitialRender(state: boolean): this {
		this.isInitialRender = state;
		return this;
	}

	setMaxViewedIndex(index: number): this {
		this.maxViewedIndex = index;
		this.updateItemsTillEnd();

		return this;
	}
}
