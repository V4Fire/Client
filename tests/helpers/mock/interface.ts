import type { JSHandle } from '@playwright/test';
import type { ModuleMocker } from 'jest-mock';

export interface SpyCtor<CTX, ARGS extends any[]> {
	(ctx: CTX, ...args: ARGS): ReturnType<ModuleMocker['spyOn']>;
}

export type ExtractFromJSHandle<T> = T extends JSHandle<infer V> ? V : never;
