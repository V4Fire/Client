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

		componentEmitter.on(componentRenderLocalEvents.renderStart, () => {
			this.setIsInitialRender(false);
			this.incrementRenderPage();
		});

		componentEmitter.on(componentRenderLocalEvents.renderDone, () => {
			this.updateIsRenderDone();
		});

		componentEmitter.on(componentDataLocalEvents.dataLoadSuccess, () => {
			this.updateIsRenderDone();
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

	storeComponentItems(items: MountedComponentItem[]): this {
		(<MountedComponentItem[]>this.state.items).push(...items);
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

	updateMountedComponents(mountedItems: MountedComponentItem[]): this {
		(<MountedComponentItem[]>this.state.items).push(...mountedItems);
		return this;
	}

	updateItemsTillEnd(): this {
		if (this.state.maxViewedIndex == null) {
			throw new Error('Missing max viewed index');
		}

		this.state.itemsTillEnd = this.state.items.length - 1 - this.state.maxViewedIndex;
		return this;
	}

	updateIsRenderDone(): this {
		const
			{ctx} = this,
			state = ctx.getComponentState();

		if (
			!state.isLoadingInProgress &&
			state.isRequestsStopped &&
			state.data.length === state.items.length
		) {
			ctx.componentInternalState.setIsRenderingDone(true);

		} else {
			ctx.componentInternalState.setIsRenderingDone(false);
		}

		return this;
	}

	updateIsLifecycleDone(): this {
		const
			{ctx} = this,
			state = ctx.getComponentState();

		if (state.isLifecycleDone) {
			return this;
		}

		if (
			state.isRequestsStopped &&
			state.isRenderingDone
		) {
			ctx.componentInternalState.setIsLifecycleDone(true);
		}

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
		this.updateIsRenderDone();
		this.updateIsLifecycleDone();

		return this;
	}

	setIsRenderingDone(state: boolean): this {
		this.state.isRenderingDone = state;
		this.updateIsLifecycleDone();

		return this;
	}

	setIsLifecycleDone(state: boolean): this {
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

	setMaxViewedIndex(index: number): this {
		this.state.maxViewedIndex = index;
		this.updateItemsTillEnd();

		return this;
	}
}
