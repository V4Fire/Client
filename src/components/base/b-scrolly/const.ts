/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { ComponentState } from 'components/base/b-scrolly/interface';

/**
 * Render strategy for producing the components.
 */
export const componentRenderStrategy = <const>{
	/**
	 * Данная стратегия реализует отрисовку с помощью создания инстанса `Vue` и в дальнейшем переиспользует
	 * его для отрисовки компонент через `forceRender`.
	 */
	forceRenderChunk: 'forceRenderChunk',

	/**
	 * Данная стратегия реализует отрисовку с помощью `vdom.create` и `vdom.render`.
	 */
	default: 'default'
};

/**
 * Стратегии возможных вариантов работы компонента.
 */
export const componentStrategy = <const>{
	/**
	 * Стратегия, при которой определение вхождение элемента
	 * в область видимости, будет происходить с помощью `intersectionObserver`.
	 *
	 * При это узлы из DOM дерева удаляться не будут
	 */
	intersectionObserver: 'intersectionObserver',

	/**
	 * Стратегия, при которой определение вхождение элемента
	 * в область видимости, будет происходить с помощью прослушивания события `scroll`.
	 *
	 * При это узлы из DOM дерева удаляться не будут
	 */
	scroll: 'scroll',

	/**
	 * Стратегия, при которой определение вхождение элемента
	 * в область видимости, будет происходить с помощью прослушивания события `scroll`.
	 *
	 * При это узлы из DOM дерева буду удаляться и возвращаться
	 */
	scrollWithDropNodes: 'scrollWithDropNodes',

	/**
	 * Стратегия, при которой определение вхождение элемента
	 * в область видимости, будет происходить с помощью прослушивания события `scroll`.
	 *
	 * При это узлы из DOM дерева будут переиспользоваться.
	 */
	scrollWithRecycleNodes: 'scrollWithRecycleNodes'
};

/**
 * События компонента связанные с данными. (эмитятся в `localEmitter`)
 */
export const componentDataLocalEvents = <const>{
	/**
	 * Загрузка данных началась.
	 */
	dataLoadStart: 'dataLoadStart',

	/**
	 * Загрузка данных завершена.
	 */
	dataLoadFinish: 'dataLoadFinish',

	/**
	 * Возникла ошибка при загрузки данных.
	 */
	dataLoadError: 'dataLoadError',

	/**
	 * Данные успешно загружены.
	 */
	dataLoadSuccess: 'dataLoadSuccess',

	/**
	 * Успешная загрузка в которых нет данных.
	 */
	dataEmpty: 'dataEmpty'
};

/**
 * События компонента.
 */
export const componentLocalEvents = <const>{
	/**
	 * Сброс состояние компонента.
	 */
	resetState: 'resetState',

	/**
	 * Вызов конвертации данных в `DB`.
	 */
	convertDataToDB: 'convertDataToDB',

	/**
	 * This event will be emitted then all of the component data is rendered and all of the component data was loaded
	 */
	done: 'done'
};

/**
 * События отрисовки компонента.
 */
export const componentRenderLocalEvents = <const>{
	/**
	 * Начался рендеринг элементов.
	 */
	renderStart: 'renderStart',

	/**
	 * Закончился рендеринг элементов.
	 */
	renderDone: 'renderDone',

	/**
	 * Начался рендеринг элементов движком отрисовки.
	 */
	renderEngineStart: 'renderEngineStart',

	/**
	 * Закончился рендеринг элементов движком отрисовки.
	 */
	renderEngineDone: 'renderEngineDone',

	/**
	 * Началась вставка элементов `DOM`.
	 */
	domInsertStart: 'domInsertStart',

	/**
	 * Завершилась вставка элементов в `DOM`.
	 */
	domInsertDone: 'domInsertDone'
};

export const canPerformRenderRejectionReason = <const>{
	notEnoughData: 'notEnoughData',
	clientRejection: 'clientRejection'
};

/**
 * События наблюдателя за элементами.
 */
export const componentObserverLocalEvents = <const>{
	elementEnter: 'elementEnter',
	elementOut: 'elementOut'
};

export const componentItemType = <const>{
	item: 'item',
	separator: 'separator'
};

/**
 * `should` свойства компонента по умолчанию.
 */
export const defaultProps = <const>{
	/** {@link bScrolly.shouldStopRequestingData} */
	shouldStopRequestingData: (_state: ComponentState, _ctx: bScrolly): boolean => false,

	/** {@link bScrolly.shouldPerformRequest} */
	shouldPerformDataRequest: (state: ComponentState, _ctx: bScrolly): boolean => {
		const isLastRequestNotEmpty = () => state.lastLoaded.length > 0;

		if (state.isInitialRender) {
			return isLastRequestNotEmpty();
		}

		return false;
	},

	/** {@link bScrolly.shouldPerformRender} */
	shouldPerformDataRender: (_state: ComponentState, _ctx: bScrolly): boolean => false
};

