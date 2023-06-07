export interface SpyOptions {
	/**
	 * If `true` then the spy will be settled to the prototype method.
	 * The spy will be settled before component creating.
	 */
	proto?: boolean;
}

export interface CompileSpyObject {
	/**
	 * Returns a snapshot of the current spy object state.
	 */
	compile(): Promise<SyncSpyObject>;
}

export interface SpyObject extends CompileSpyObject {
	get calls(): Promise<unknown[][]>;
	get callsLength(): Promise<number>;
	get results(): Promise<unknown[][]>;
	get lastCall(): Promise<unknown[]>;
}

export type SyncSpyObject = {[P in keyof SpyObject]: Awaited<SpyObject[P]>} & CompileSpyObject;
