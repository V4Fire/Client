/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'components/super/i-block/i-block';

interface ComponentInfo {
	componentName: string;
	componentId: string;
	isFunctional: boolean;
	children: ComponentInfo[];
	testId?: string;
}

/**
 * Trims multiline string: removes excess tabulation and new line symbols
 * @param strings
 */
export function trim(strings: TemplateStringsArray): string {
	const
		lines = strings[0].split('\n').filter((x) => x !== '');

	const
		excessTabs = /^(\t+)/.exec(lines[0]),
		tabCount = excessTabs ? excessTabs[0].length : 1;

	const regex = new RegExp(`^\\t{1,${tabCount}}`);
	return lines.map((line) => line.replace(regex, '')).filter((x) => x !== '').join('\n');
}

/**
 * Serializes tree to the string
 *
 * @param items
 * @param level
 */
export function treeToString(items: ComponentInfo[], level: number = 0): string {
	let result = '';
	const offset = Array(level).fill('\t').join('');

	for (const item of items) {
		let serializedItem = offset;

		serializedItem += item.componentName;

		if (item.testId != null) {
			serializedItem += `:${item.testId}`;
		}

		if (item.isFunctional) {
			serializedItem += ' <func>';
		}

		serializedItem += '\n';

		result += serializedItem;

		if (item.children.length > 0) {
			result += treeToString(item.children, level + 1);
		}
	}

	return level === 0 ? result.trim() : result;
}

/**
 * Creates component tree from DOM
 */
export function evalTree(): ComponentInfo[] {
	const nodes: Array<{component: iBlock}> = Array.prototype.filter.call(
		document.getElementsByClassName('i-block-helper'),
		(node) => node.component !== undefined
	);

	const map = new Map();

	const createDescriptor = (component: iBlock) => {
		const
			{meta} = component.unsafe,
			{componentId, isFunctional} = component,
			{componentName} = meta,
			testId = component.$el?.getAttribute('data-testid');

		return {
			componentName,
			componentId,
			isFunctional,
			children: [],
			testId
		};
	};

	const
		rootNodeIndex = nodes.findIndex(({component}) => component.unsafe.meta.params.root),
		rootNode = nodes[rootNodeIndex];

	nodes.splice(rootNodeIndex, 1);
	map.set(rootNode.component.componentId, createDescriptor(rootNode.component));

	const buffer: Function[] = [];

	// Build tree
	nodes.forEach(({component}) => {
		const descriptor = createDescriptor(component);

		// Teleported components may appear more than once
		if (map.has(component.componentId)) {
			return;
		}

		map.set(component.componentId, descriptor);

		const parentId = component.$parent?.componentId;

		if (parentId != null) {
			if (!map.has(parentId)) {
				buffer.push(() => {
					const item = map.get(parentId);

					if (item != null) {
						item.children.push(descriptor);

					} else {
						stderr(`Missing parent, component: ${component.componentName}, parent id: ${parentId}`);
					}
				});

			} else {
				map.get(parentId).children.push(descriptor);
			}
		}
	});

	buffer.forEach((cb) => cb());

	const root = map.values().next().value;

	return root != null ? [root] : [];
}
