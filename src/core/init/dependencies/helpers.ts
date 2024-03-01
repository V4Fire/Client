/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { DependencyFn, Dependency } from 'core/init/dependencies/interface';

/**
 * Creates a dependency object based on the passed function and its dependencies
 *
 * @param fn - the dependency function
 * @param [wait] - a list of dependency names that must be resolved before executing the current one
 */
export function dependency(fn: DependencyFn, ...wait: string[]): Dependency;

/**
 * Creates a dependency object based on another dependency.
 * If the `wait` parameter is set, this list will be merged with the dependencies from the source object.
 *
 * @param dep - the dependency function
 * @param [wait] - a list of dependency names that must be resolved before executing the current one
 */
// eslint-disable-next-line @typescript-eslint/unified-signatures
export function dependency(dep: Dependency, ...wait: string[]): Dependency;

// eslint-disable-next-line @typescript-eslint/unified-signatures, @v4fire/require-jsdoc
export function dependency(depOrFn: Dependency | DependencyFn, ...wait: string[]): Dependency;

export function dependency(depOrFn: Dependency | DependencyFn, ...wait: string[]): Dependency {
	if (Object.isFunction(depOrFn)) {
		return {
			fn: depOrFn.once(),
			wait: new Set(wait)
		};
	}

	return {
		...depOrFn,
		wait: new Set([...depOrFn.wait, ...wait])
	};
}

/**
 * Returns an iterator over the specified dependencies sorted in topological order.
 * The iterator produces tuples in the form of (dependencyName, dependencyObject).
 *
 * @param dependencies
 */
export function* createDependencyIterator(
	dependencies: Dictionary<Dependency | DependencyFn>
): IterableIterator<[string, Dependency]> {
	type ExpandedDependency = Overwrite<Dependency, {
		name: string;
		wait: Set<ExpandedDependency>;
	}>;

	const resolvedDeps = Object.fromEntries(Object.entries(dependencies)
		.map(([name, desc]) => {
			if (desc == null) {
				throw new Error(`The dependency named ${name} was not found in the provided dependency dictionary`);
			}

			return [name, dependency(desc)];
		}));

	const nonStarDependencies = Object.entries(resolvedDeps)
		.filter(([_, dependency]) => !dependency.wait.has('*'))
		.map(([name]) => name);

	const visitedDependencies = new Set<string>();

	const expandedDependencies = new Map<Dependency, ExpandedDependency>();
	Object.entries(resolvedDeps).forEach((entry) => expandDependency(...entry));

	for (const [dependency, {name, wait}] of expandedDependencies.entries()) {
		yield [
			name,

			{
				...dependency,

				fn: async (...args) => {
					await Promise.all([...wait].map(({fn}) => fn(...args)));
					return dependency.fn(...args);
				}
			}
		];
	}

	function expandDependency(
		name: string,
		dependency: CanUndef<Dependency> = resolvedDeps[name]
	): ExpandedDependency {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (dependency == null) {
			throw new Error(`The dependency named ${name} was not found in the provided dependency dictionary`);
		}

		let expandedDependency = expandedDependencies.get(dependency);

		if (expandedDependency != null) {
			return expandedDependency;
		}

		if (visitedDependencies.has(name)) {
			throw new Error(`A circular reference was found between "${name}" dependencies`);
		}

		visitedDependencies.add(name);

		const wait = dependency.wait.has('*') ?
			nonStarDependencies :
			[...dependency.wait];

		expandedDependency = {
			...dependency,

			name,
			wait: new Set(wait.map((childName) => {
				const dependency = resolvedDeps[childName];

				if (!expandedDependencies.has(dependency) && visitedDependencies.has(childName)) {
					throw new Error(`A circular reference was found between "${name}" and "${childName}" dependencies`);
				}

				return expandDependency(childName);
			}))
		};

		expandedDependencies.set(dependency, expandedDependency);
		return expandedDependency;
	}
}
