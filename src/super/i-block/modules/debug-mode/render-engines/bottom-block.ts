import type iBlock from 'super/i-block/i-block';
import type { UnsafeIBlock } from 'super/i-block/i-block';
// import type { ComponentElement } from 'core/component';

/**
 *
 * @param rootComponent
 * @param context
 */
export default async function bottomBlockRenderEngine(
	rootComponent: iBlock,
	context: UnsafeIBlock
): Promise<boolean> {
	const
		data = Object.fastClone(context.storage.get('DebugModeData'));

	return true;
	// TODO:
	// Перебор объектов ->
	// У тех, которые с одинаковым компонентом вывода (напр. b-debug-data), собирать дату в один объект ->
	// Пройти по итоговым объектам (их столько, сколько компонентов вывода) ->
	// Вызвать на каждом функцию рендера через Promise.all

	/*const vNode = context.$createElement(data[0].component, {
		attrs: {
			data: data[0].data
		}
	});

	const
		node = rootComponent.vdom.render(vNode),
		root = <ComponentElement<iBlock>>rootComponent.$el;

	context.dom.appendChild(root, node);*/
}
