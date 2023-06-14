/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import { componentDataLocalEvents, componentLocalEvents, componentRenderLocalEvents } from 'components/base/b-scrolly/const';
import type { MountedChild, ComponentState, MountedItem } from 'components/base/b-scrolly/interface';
import { createInitialState } from 'components/base/b-scrolly/modules/state/helpers';
import Friend from 'components/friends/friend';

export class ComponentInternalState extends Friend {

	/**
	 * {@link bScrolly}
	 */
	override readonly C!: bScrolly;

	protected state: ComponentState = createInitialState();

	/**
	 * @param ctx
	 */
	constructor(ctx: bScrolly) {
		super(ctx);

		const
			{componentEmitter} = ctx;

		componentEmitter.on(componentDataLocalEvents.dataLoadStart, () => this.incrementLoadPage());
		componentEmitter.on(componentLocalEvents.convertDataToDB, (...args) => this.setRawLastLoaded(...args));
		componentEmitter.on(componentLocalEvents.resetState, (...args) => this.reset(...args));

		componentEmitter.on(componentRenderLocalEvents.domInsertStart, () => {
			this.setIsInitialRender(false);
			this.incrementRenderPage();
		});
	}

	/**
	 * Собирает состояние компонента в один объект.
	 */
	compile(): Readonly<ComponentState> {
		return {
			...this.state
		};
	}

	/**
	 * Обнуляет состояние модуля.
	 */
	reset(): void {
		this.state = createInitialState();
	}

	/**
	 * Обновляет указатель последней загруженной страницы.
	 */
	incrementLoadPage(): this {
		this.state.loadPage++;
		return this;
	}

	/**
	 * Обновляет указать последней отрисованной страницы.
	 */
	incrementRenderPage(): this {
		this.state.renderPage++;
		return this;
	}

	storeComponentItems(items: MountedItem[]): this {
		(<MountedItem[]>this.state.items).push(...items);
		return this;
	}

	/**
	 * Обновляет состояние загруженных данных.
	 *
	 * @param data
	 * @param isInitialLoading
	 */
	updateData(data: object[], isInitialLoading: boolean): this {
		this.state.data = this.state.data.concat(data);
		this.state.isLastEmpty = data.length === 0;
		this.state.isInitialLoading = isInitialLoading;
		this.state.lastLoadedData = data;

		return this;
	}

	updateMountedItems(mounted: MountedItem[]): this {
		(<MountedItem[]>this.state.items).push(...mounted);
		return this;
	}

	updateChildList(mounted: MountedChild[]): this {
		(<MountedChild[]>this.state.childList).push(...mounted);
		return this;
	}

	updateItemsTillEnd(): this {
		if (this.state.maxViewedItem == null) {
			throw new Error('Missing max viewed item index');
		}

		this.state.itemsTillEnd = this.state.items.length - 1 - this.state.maxViewedItem;
		return this;
	}

	updateChildTillEnd(): this {
		if (this.state.maxViewedChild == null) {
			throw new Error('Missing max viewed child index');
		}

		this.state.childTillEnd = this.state.childList.length - 1 - this.state.maxViewedChild;
		return this;
	}

	/**
	 * Обновляет состояние последних сырых загруженных данных.
	 *
	 * @param data
	 */
	setRawLastLoaded(data: unknown): this {
		this.state.lastLoadedRawData = data;
		return this;
	}

	/**
	 * Sets an initial render state
	 *
	 * @param state
	 */
	setIsInitialRender(state: boolean): this {
		this.state.isInitialRender = state;
		return this;
	}

	setIsRequestsStopped(state: boolean): this {
		this.state.isRequestsStopped = state;
		return this;
	}

	setIsLifecycleDone(state: boolean): this {
		if (this.state.isLifecycleDone === state) {
			return this;
		}

		const
			{ctx} = this;

		this.state.isLifecycleDone = state;

		if (state) {
			ctx.componentEmitter.emit(componentLocalEvents.lifecycleDone);
		}

		return this;
	}

	setIsLoadingInProgress(state: boolean): this {
		this.state.isLoadingInProgress = state;
		return this;
	}

	setMaxViewedItemIndex(itemIndex: number): this {
		this.state.maxViewedItem = itemIndex;
		this.updateItemsTillEnd();

		return this;
	}

	setMaxViewedChildIndex(childIndex: number): this {
		this.state.maxViewedChild = childIndex;
		this.updateChildTillEnd();

		return this;
	}
}
