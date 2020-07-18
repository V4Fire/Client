/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import Friend from 'super/i-block/modules/friend';

import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';
import ChunkRender from 'base/b-virtual-scroll/modules/chunk-render';

import { getRequestParams } from 'base/b-virtual-scroll/modules/helpers';
import { RemoteData, RequestMoreParams, LastLoadedChunk } from 'base/b-virtual-scroll/interface';

export const
	$$ = symbolGenerator();

export default class ChunkRequest extends Friend {
	/* @override */
	readonly C!: bVirtualScroll;

	/**
	 * Current page
	 */
	page: number = 1;

	/**
	 * Total amount of elements being loaded
	 */
	total: number = 0;

	/**
	 * All loaded data
	 */
	data: unknown[] = [];

	/**
	 * Last uploaded chunk of data that was processed with `dbConverter`
	 *
	 * @deprecated
	 * @see [[ScrollRequest.lastLoadedChunk]]
	 */
	lastLoadedData: unknown[] = [];

	/**
	 * Last loaded data chunk
	 */
	lastLoadedChunk: LastLoadedChunk = {
		normalized: [],
		raw: undefined
	};

	/**
	 * True if all requests for additional data was requested
	 */
	isDone: boolean = false;

	/**
	 * True if the last request returned an empty array or undefined
	 */
	isLastEmpty: boolean = false;

	/**
	 * Contains data that pending to be rendered
	 */
	pendingData: unknown[] = [];

	/**
	 * Data that was loaded through the first `try` method call and subsequent recursive calls
	 */
	currentAccumulatedData: CanUndef<unknown> = undefined;

	/**
	 * Merged `currentAccumulatedData` or `ctx.db`
	 */
	currentDataStore: CanUndef<unknown> = undefined;

	/** @see [[ChunkRequest.prototype.currentDataStore]] */
	get currentData(): CanUndef<unknown> {
		return this.currentDataStore;
	}

	/**
	 * @emits dataChange(v: unknown)
	 * @see [[ChunkRequest.prototype.currentDataStore]]
	 */
	set currentData(v: unknown) {
		this.currentDataStore = v;
		this.ctx.emit('dataChange', v);
	}

	/**
	 * API for scroll rendering
	 */
	protected get chunkRender(): ChunkRender {
		return this.ctx.chunkRender;
	}

	/**
	 * Resets the current state
	 */
	reset(): void {
		this.total = 0;
		this.page = 1;
		this.data = [];
		this.lastLoadedChunk = {raw: undefined, normalized: []};
		this.isDone = false;
		this.isLastEmpty = false;
		this.pendingData = [];
		this.currentAccumulatedData = undefined;
		this.currentDataStore = undefined;
		this.async.clearTimeout({label: $$.waitForInitCalls});
	}

	/**
	 * Reloads the last request
	 */
	reloadLast(): void {
		this.isDone = false;
		this.isLastEmpty = false;

		this.chunkRender.setRefVisibility('retry', false);
		this.try().catch(stderr);
	}

	/**
	 * Initializes the request module
	 */
	async init(): Promise<void> {
		await this.async.sleep(50, {label: $$.waitForInitCalls});

		const
			{options, chunkSize, dataProvider} = this.ctx;

		this.pendingData = [...options];

		const initChunkRenderer = () => {
			this.chunkRender.initItems(
				Object.isString(dataProvider) ?
					this.pendingData.splice(0, chunkSize) :
					this.pendingData.splice(0, this.pendingData.length)
			);
		};

		if (dataProvider === undefined) {
			this.onRequestsDone();
		}

		if (this.pendingData.length < chunkSize && Object.isString(dataProvider)) {
			if (!this.isDone) {
				this.currentAccumulatedData = this.ctx.db;
				await this.try(false);

			} else {
				initChunkRenderer();
			}

		} else {
			initChunkRenderer();
		}

		if (
			this.ctx.localState !== 'error' &&
			this.pendingData.length === 0 &&
			this.chunkRender.itemsCount === 0 &&
			this.isDone
		) {
			this.chunkRender.setRefVisibility('empty', true);
		}

		if (this.currentData === undefined && Object.isTruly(this.ctx.db)) {
			this.currentData = this.ctx.db;
		}

		this.ctx.localState = 'ready';
	}

	/**
	 * Tries to request additional data
	 * @param [initialCall]
	 */
	try(initialCall: boolean = true): Promise<CanUndef<RemoteData>> {
		const
			{ctx, chunkRender} = this,
			{chunkSize} = ctx,
			resolved = Promise.resolve(undefined);

		const additionParams = {
			lastLoadedChunk: {
				...this.lastLoadedChunk,
				normalized: this.lastLoadedChunk.normalized
			}
		};

		if (this.pendingData.length >= chunkSize) {
			this.chunkRender.initItems(this.pendingData.splice(0, chunkSize));
			this.chunkRender.render();
			return resolved;
		}

		const updateCurrentData = () => {
			if (this.currentAccumulatedData !== undefined) {
				this.currentData = this.currentAccumulatedData;
				this.currentAccumulatedData = undefined;
			}
		};

		const
			shouldRequest = ctx.shouldMakeRequest(getRequestParams(this, chunkRender, additionParams));

		if (this.isDone) {
			updateCurrentData();
			this.onRequestsDone();
			return resolved;
		}

		const cantRequest = () => this.isDone ||
			!shouldRequest ||
			ctx.dataProvider === undefined ||
			ctx.mods.progress === 'true';

		if (cantRequest()) {
			return resolved;
		}

		if (initialCall) {
			this.currentAccumulatedData = undefined;
		}

		chunkRender.setLoadersVisibility(true);

		return this.load()
			.then((v) => {
				if (!Object.isTruly(ctx.field.get('data.length', v))) {
					this.isLastEmpty = true;
					this.shouldStopRequest(getRequestParams(this, chunkRender, {lastLoadedData: []}));
					chunkRender.setLoadersVisibility(false);
					updateCurrentData();
					return;
				}

				const
					{data} = <RemoteData>v;

				this.page++;
				this.isLastEmpty = false;

				this.data = this.data.concat(data);
				this.lastLoadedChunk.normalized = data!;
				this.pendingData = this.pendingData.concat(data);
				this.currentAccumulatedData = Object.mixin({concatArray: true, deep: true}, {}, this.currentAccumulatedData, v);

				this.shouldStopRequest(getRequestParams(this, chunkRender));

				if (this.pendingData.length < ctx.chunkSize) {
					return this.try(false);
				}

				this.currentData = this.currentAccumulatedData;
				this.currentAccumulatedData = undefined;

				chunkRender.setLoadersVisibility(false);
				this.chunkRender.initItems(this.pendingData.splice(0, chunkSize));
				this.chunkRender.render();

			}).catch((err) => {
				stderr(err);
				return undefined;
			});
	}

	/**
	 * Checks possibility of another request for data
	 * @param params
	 */
	shouldStopRequest(params: RequestMoreParams): boolean {
		const {ctx} = this;
		this.isDone = ctx.shouldStopRequest(params);

		if (this.isDone) {
			this.onRequestsDone();
		}

		return this.isDone;
	}

	/**
	 * Loads additional data
	 */
	protected load(): Promise<CanUndef<RemoteData>> {
		const
			{ctx} = this;

		void ctx.setMod('progress', true);

		const
			defaultRequestParams = ctx.getDefaultRequestParams('get'),
			params = <CanUndef<Dictionary>>(defaultRequestParams !== false ? defaultRequestParams : [])[0];

		Object.assign(params, ctx.requestQuery?.(getRequestParams(this, this.chunkRender))?.get);

		return ctx.async.request(ctx.getData(this.component, params), {label: $$.request})
			.then((data) => {
				void ctx.removeMod('progress', true);
				this.lastLoadedChunk.raw = data;

				if (data == null) {
					this.lastLoadedChunk.normalized = [];
					return;
				}

				const
					converted = ctx.convertDataToDB<CanUndef<RemoteData>>(data);

				if (!Object.isTruly(converted?.data?.length)) {
					this.lastLoadedChunk.normalized = [];
					return;
				}

				return converted;
			})

			.catch((err) => {
				void ctx.removeMod('progress', true);
				this.chunkRender.setRefVisibility('retry', true);
				stderr(err);

				this.lastLoadedChunk.raw = [];
				this.lastLoadedChunk.normalized = [];

				return undefined;
			});
	}

	/**
	 * Handler: all requests are done
	 */
	protected onRequestsDone(): void {
		const
			{chunkSize} = this.ctx;

		if (this.pendingData.length > 0) {
			this.chunkRender.initItems(this.pendingData.splice(0, chunkSize));
			this.chunkRender.render();

		} else {
			this.chunkRender.setRefVisibility('done', true);
		}

		this.async.wait(() => this.ctx.localState === 'ready', {label: $$.requestDoneWaitForReady})
			.then(() => {
				if (this.pendingData.length === 0) {
					this.chunkRender.setRefVisibility('done', true);
				}

				this.chunkRender.setLoadersVisibility(false);
			})
			.catch(stderr);
	}
}
