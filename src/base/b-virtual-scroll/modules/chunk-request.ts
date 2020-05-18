/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';
import ChunkRender from 'base/b-virtual-scroll/modules/chunk-render';

import { getRequestParams } from 'base/b-virtual-scroll/modules/helpers';
import { RemoteData, RequestMoreParams, UnsafeChunkRequest } from 'base/b-virtual-scroll/modules/interface';

export const $$ =
	symbolGenerator();

export default class ChunkRequest {
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
	 * Last loaded data
	 */
	lastLoadedData: unknown[] = [];

	/**
	 * True if all requests for additional data was requested
	 */
	isDone: boolean = false;

	/**
	 * True if the last request returned an empty array or undefined
	 */
	isLastEmpty: boolean = false;

	/**
	 * Last loaded chunk of data that did not go through processing `dbConverter`
	 */
	rawLastLoadedData: unknown;

	/**
	 * Component instance
	 */
	readonly component: bVirtualScroll['unsafe'];

	/**
	 * API to unsafe invoke of internal properties of the component
	 */
	get unsafe(): UnsafeChunkRequest & this {
		return <any>this;
	}

	/**
	 * Contains data that pending to be rendered
	 */
	protected pendingData: unknown[] = [];

	/**
	 * API for scroll rendering
	 */
	protected get chunkRender(): ChunkRender['unsafe'] {
		return this.component.chunkRender.unsafe;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: bVirtualScroll) {
		this.component = component.unsafe;
	}

	/**
	 * Initializes a request module
	 */
	async init(): Promise<void> {
		const
			{options, chunkSize, dataProvider} = this.component;

		this.pendingData = [...options];

		const initChunkRenderer = () => {
			this.chunkRender.initItems(dataProvider ? this.pendingData.splice(0, chunkSize) : this.pendingData);
		};

		if (!dataProvider) {
			this.onRequestsDone();
		}

		if (this.pendingData.length < chunkSize && dataProvider) {
			if (!this.isDone) {
				await this.try();

			} else {
				initChunkRenderer();
			}

		} else {
			initChunkRenderer();
		}

		this.component.localState = 'ready';
	}

	/**
	 * Resets the current state
	 */
	reset(): void {
		this.total = 0;
		this.page = 1;
		this.data = [];
		this.lastLoadedData = [];
		this.isDone = false;
		this.isLastEmpty = false;
		this.pendingData = [];
	}

	/**
	 * Reloads the last request
	 */
	reloadLast(): void {
		this.isDone = false;
		this.isLastEmpty = false;

		this.chunkRender.setRefVisibility('retry', false);
		this.try();
	}

	/**
	 * Tries to request additional data
	 */
	try(): Promise<void | RemoteData> {
		const
			{component, chunkRender} = this,
			{chunkSize} = component,
			resolved = Promise.resolve();

		const additionParams = {
			lastLoadedData: this.lastLoadedData.length === 0 ? component.options : this.lastLoadedData
		};

		if (this.pendingData.length >= chunkSize) {
			this.chunkRender.initItems(this.pendingData.splice(0, chunkSize));
			this.chunkRender.render();
			return resolved;
		}

		const
			shouldRequest = component.shouldMakeRequest(getRequestParams(this, chunkRender, additionParams));

		if (this.isDone) {
			this.onRequestsDone();
			return resolved;
		}

		const cantRequest = () =>
			this.isDone ||
			!shouldRequest ||
			!component.dataProvider ||
			component.mods.progress === 'true';

		if (cantRequest()) {
			return resolved;
		}

		chunkRender.setLoadersVisibility(true);

		return this.load()
			.then((v) => {
				chunkRender.setLoadersVisibility(false);

				if (!component.field.get('data.length', v)) {
					this.isLastEmpty = true;
					this.shouldStopRequest(getRequestParams(this, chunkRender, {lastLoadedData: []}));
					return;
				}

				const
					{data} = <RemoteData>v;

				this.page++;
				this.isLastEmpty = false;
				this.data = this.data.concat(data);
				this.lastLoadedData = data;
				this.pendingData = this.pendingData.concat(data);

				this.shouldStopRequest(getRequestParams(this, chunkRender));

				if (this.pendingData.length < component.chunkSize) {
					return this.try();
				}

				this.chunkRender.initItems(this.pendingData.splice(0, chunkSize));
				this.chunkRender.render();

			}).catch(stderr);
	}

	/**
	 * Checks possibility of another request for data
	 * @param params
	 */
	shouldStopRequest(params: RequestMoreParams): boolean {
		const {component} = this;
		this.isDone = component.shouldStopRequest(params);

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
			{component} = this;

		component.setMod('progress', true);

		const params = <CanUndef<Dictionary>>(component.getDefaultRequestParams('get') || [])[0];
		Object.assign(params, component.requestQuery?.(getRequestParams(this, this.chunkRender))?.get);

		return component.async.request(component.getData(component, params), {label: $$.request})
			.then((data) => {
				component.removeMod('progress', true);
				this.rawLastLoadedData = data;

				if (!data) {
					this.lastLoadedData = [];
					return;
				}

				const
					converted = component.convertDataToDB<CanUndef<RemoteData>>(data);

				if (!converted?.data?.length) {
					this.lastLoadedData = [];
					return;
				}

				return converted;
			})

			.catch((err) => {
				component.removeMod('progress', true);
				this.chunkRender.setRefVisibility('retry', true);

				stderr(err);
				this.lastLoadedData = [];
				return undefined;
			});
	}

	/**
	 * Handler: all requests are done
	 */
	protected onRequestsDone(): void {
		const
			{chunkSize} = this.component;

		if (this.pendingData.length) {
			this.chunkRender.initItems(this.pendingData.splice(0, chunkSize));
			this.chunkRender.render();

		} else {
			this.onPendingDone();
		}

		this.chunkRender.setLoadersVisibility(false);
	}

	/**
	 * Handler: data to render ended
	 */
	protected onPendingDone(): void {
		this.chunkRender.setRefVisibility('done', true);
	}
}
