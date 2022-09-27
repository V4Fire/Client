import type iBlock from 'super/i-block/i-block';
import type { UnsafeIBlock } from 'super/i-block/i-block';
import type { DebugData } from 'super/i-block/modules/debug-mode/interface';
import type { ComponentElement } from 'core/component';

/**
 *
 * @param debugData
 * @param rootComponent
 * @param context
 * @param renderComponent
 */
export default function bottomBlockRenderEngine(
	debugData: DebugData,
	rootComponent: iBlock,
	context: UnsafeIBlock,
	renderComponent?: string
): void {
	const vNode = context.$createElement(renderComponent, {
		attrs: {
			data: debugData
		}
	});

	const
		node = rootComponent.vdom.render(vNode),
		root = <ComponentElement<iBlock>>rootComponent.$el;

	context.dom.appendChild(root, node);
}
