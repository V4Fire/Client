import type iBlock from 'super/i-block/i-block';
import type { UnsafeIBlock } from 'super/i-block/i-block';
import type { ComponentDebugData } from 'super/i-block/modules/debug-mode/interface';
import type { ComponentElement } from 'core/component';

const
	renderComponent = 'b-debug-data';

/**
 *
 * @param rootComponent
 * @param context
 */
export default function bottomBlockRender(
	rootComponent: iBlock,
	context: UnsafeIBlock
): Promise<void> {
	return new Promise(async (resolve, reject) => {
		const
			componentDebugData: CanUndef<ComponentDebugData> = await context.storage.get('ComponentDebugData');

		if (Object.isNullable(componentDebugData)) {
			stderr('here is no data in the ComponentDebugData field');
			return reject();
		}

		const
			bottomBlockData = componentDebugData.get('bottom-block');

		if (Object.isNullable(bottomBlockData)) {
			stderr('There is no debug data to render in the bottom block');
			return reject();
		}

		try {
			const vNode = context.$createElement(renderComponent, {
				attrs: {
					data: bottomBlockData
				}
			});

			const
				node = rootComponent.vdom.render(vNode),
				root = <ComponentElement<iBlock>>rootComponent.$el;

			context.dom.appendChild(root, node);

			return resolve();

		} catch {
			stderr(`Failed to render the ${renderComponent} component`);
			return reject();
		}
	});
}
