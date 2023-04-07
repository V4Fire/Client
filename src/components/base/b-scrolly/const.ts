/**
 * Стратегия отрисовки компонентов.
 */
export const RenderStrategy = <const>{
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

