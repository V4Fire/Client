/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import Async from 'core/async';

import { ModsDecl, ComponentHooks } from 'core/component';
import { InView } from 'core/component/directives/in-view';

import Block from 'super/i-block/modules/block';
import iHistory from 'traits/i-history/i-history';

import { INITIAL_STAGE } from 'traits/i-history/history/const';
import { Page, HistoryItem, HistoryConfig, Transition } from 'traits/i-history/history/interface';

export * from 'traits/i-history/history/const';
export * from 'traits/i-history/history/interface';

export const
	$$ = symbolGenerator();

export default class History<C extends iHistory> {
	/**
	 * Default configuration for a history item
	 */
	static defaultConfig: HistoryConfig = {
		titleThreshold: 0.01,
		triggerAttr: 'data-history-trigger',
		pageTriggers: true
	};

	/**
	 * History modifiers
	 */
	static readonly mods: ModsDecl = {
		blankHistory: [
			'false',
			['true']
		]
	};

	/**
	 * Linked component async
	 */
	get async(): Async<C['unsafe']> {
		return this.component.async;
	}

	/**
	 * Current store position
	 */
	get current(): HistoryItem {
		return this.store[this.store.length - 1];
	}

	/**
	 * History length
	 */
	get length(): number {
		return this.store.length;
	}

	/**
	 * Linked component instance
	 */
	protected readonly component: C['unsafe'];

	/**
	 * List of transitions
	 */
	protected store: HistoryItem[] = [];

	/**
	 * History instance configuration
	 */
	protected config: HistoryConfig;

	/**
	 * @param component
	 * @param [config]
	 */
	constructor(component: C, config?: HistoryConfig) {
		this.component = component.unsafe;
		this.config = {...History.defaultConfig, ...config};
	}

	/**
	 * Hooks of the component instance
	 */
	protected get componentHooks(): ComponentHooks {
		return this.component.meta.hooks;
	}

	/**
	 * Block instance
	 */
	protected get block(): Block {
		return this.component.block;
	}

	/**
	 * Initializes the index page
	 * @param [item] - initial history item
	 */
	initIndex(item: HistoryItem = {stage: INITIAL_STAGE, options: {}}): void {
		this.store.push(item);
		this.calculateCurrentPage();
	}

	/**
	 * Pushes a new stage to the history
	 *
	 * @param stage
	 * @param [opts] - additional options
	 * @emits `history:transition(value: Transition)`
	 */
	push(stage: string, opts?: Dictionary): void {
		const
			currentPage = this.current?.content?.el;

		const
			els = this.initPage(stage);

		if (els?.content.el) {
			const
				isBelow = this.block.getElMod(els.content.el, 'page', 'below') === 'true';

			if (isBelow || currentPage === els.content.el) {
				throw new Error(`A page with the stage "${stage}" is already opened`);
			}

			this.async.requestAnimationFrame(() => {
				this.block.setElMod(els.content.el, 'page', 'turning', 'in');
				this.block.setElMod(currentPage, 'page', 'below', true);
				this.component.setMod('blankHistory', false);
			}, {label: $$.addNewPage});

			this.store.push({stage, options: opts, ...els});
			this.scrollToTop();
			this.component.emit('history:transition', {page: this.current, type: 'push'});

		} else {
			throw new ReferenceError(`A page for the stage "${stage}" is not defined`);
		}
	}

	/**
	 * Navigates back through the history
	 * @emits `history:transition(value: Transition)`
	 */
	back(): CanUndef<HistoryItem> {
		if (this.store.length === 1) {
			return;
		}

		const
			current = this.store.pop();

		if (current) {
			if (this.store.length === 1) {
				this.component.setMod('blankHistory', true);
			}

			this.unwindPage(current);

			const
				pageBelow = this.store[this.store.length - 1],
				pageBelowEl = pageBelow.content?.el;

			this.block.removeElMod(pageBelowEl, 'page', 'below');
			this.component.emit('history:transition', <Transition>{page: current, type: 'back'});
		}

		return current;
	}

	/**
	 * Clears the history
	 * @emits `history:clear`
	 */
	clear(): boolean {
		if (this.store.length === 0) {
			return false;
		}

		for (let i = this.store.length - 1; i >= 0; i--) {
			this.unwindPage(this.store[i]);
		}

		this.store = [];
		this.async.requestAnimationFrame(() => {
			this.block.removeElMod(this.store[0]?.content?.el, 'page', 'below');
		}, {label: $$.pageChange});

		const
			history = <HTMLElement>this.block.element('history');

		if (history.hasAttribute('data-page')) {
			history.removeAttribute('data-page');
		}

		this.async.requestAnimationFrame(() => {
			this.component.setMod('blankHistory', true);
			this.component.emit('history:clear');
		}, {label: $$.historyClear});

		return true;
	}

	/**
	 * Calculates the current page
	 */
	protected calculateCurrentPage(): void {
		this.async.requestAnimationFrame(() => {
			const els = this.initPage(this.current.stage);
			Object.assign(this.current, els);

			const
				titleH = this.current?.title?.initBoundingRect?.height || 0,
				scrollTop = this.current.content?.el?.scrollTop || 0,
				visible = titleH - scrollTop >= titleH * this.config.titleThreshold;

			this.initTitleInView(visible);
		}, {label: $$.calculateCurrentPage});
	}

	/**
	 * Unwinds a history item to the initial state
	 * @param item
	 */
	protected unwindPage(item: HistoryItem): void {
		const
			page = item.content?.el,
			trigger = item.content?.trigger,
			label = {label: $$[`unwindPage${item.stage.camelize()}`]};

		this.async.requestAnimationFrame(() => {
			if (trigger) {
				this.setObserving(trigger, false);
			}

			if (page) {
				this.block.removeElMod(page, 'page', 'turning');
				this.block.removeElMod(page, 'page', 'below');
			}
		}, label);
	}

	/**
	 * Creates a trigger element to observe
	 */
	protected createTrigger(): CanUndef<HTMLElement> {
		if (!this.config.pageTriggers) {
			return;
		}

		const t = document.createElement('div');
		t.setAttribute(this.config.triggerAttr, 'true');

		this.async.requestAnimationFrame(() => {
			Object.assign(t.style, {
				height: (1).px,
				width: '100%',
				position: 'absolute',
				top: 0,
				zIndex: -1
			});
		}, {label: $$.createTrigger});

		return t;
	}

	/**
	 * Sets observing for the specified element
	 *
	 * @param el
	 * @param observe - if false, observing for the element will be stopped
	 */
	protected setObserving(el: HTMLElement, observe: boolean): void {
		if (!this.config.pageTriggers) {
			return;
		}

		const
			label = {label: $$.setObserving};

		if (observe) {
			InView.observe(el, {
				threshold: this.config.titleThreshold,
				onEnter: () => this.onPageTopVisibilityChange(true),
				onLeave: () => this.onPageTopVisibilityChange(false),
				polling: true
			});

			this.async.worker(() => InView.remove(el), label);

		} else {
			this.async.terminateWorker(label);
		}
	}

	/**
	 * Initializes a layout for the specified stage and returns a page object
	 *
	 * @param stage
	 * @emits `history:initPage({content: Content, title: Title})`
	 * @emits `history:initPageFail(stage: string)`
	 */
	protected initPage(stage: string): CanUndef<Page> {
		const
			$a = this.async;

		let
			page = this.block?.node?.querySelector<HTMLElement>(`[data-page=${stage}]`);

		if (!page) {
			this.component.emit('history:initPageFail', stage);

			if (stage !== INITIAL_STAGE) {
				return;
			}

			page = this.block.element<HTMLElement>('history')!;
			page.setAttribute('data-page', stage);
		}

		this.async.requestAnimationFrame(() => {
			if (!page!.classList.contains(this.block.getFullElName('page'))) {
				page!.classList.add(this.block.getFullElName('page'));
			}
		}, {label: $$.initPage});

		const
			title = page.querySelector('[data-title]'),
			hasTrigger = page.children?.[0]?.getAttribute(this.config.triggerAttr),
			trigger = !hasTrigger ? this.createTrigger() : <HTMLElement>page.children[0];

		if (title) {
			if (trigger) {
				this.async.requestAnimationFrame(() => {
					trigger.style.height = title.clientHeight.px;
				}, {label: $$.setTriggerHeight});
			}

			$a.on(title, 'click', this.onTitleClick.bind(this));
		}

		if (trigger) {
			this.async.requestAnimationFrame(() => {
				if (!hasTrigger) {
					(<HTMLElement>page).insertAdjacentElement('afterbegin', trigger);
				}

				this.setObserving(trigger, true);
			}, {label: $$.initTrigger});
		}

		const response = {
			content: {
				el: page,
				initBoundingRect: page.getBoundingClientRect(),
				trigger
			},

			title: {
				el: title,
				initBoundingRect: title?.getBoundingClientRect()
			}
		};

		this.component.emit('history:initPage', response);
		return response;
	}

	/**
	 * Scrolls a content to the top
	 * @param [animate]
	 */
	protected scrollToTop(animate: boolean = false): void {
		const
			{content} = this.current;

		if (content && (content.el.scrollTop !== 0 || content.el.scrollLeft !== 0)) {
			const
				options = {top: 0, left: 0};

			if (animate) {
				Object.assign(options, {behavior: 'smooth'});
			}

			content.el.scrollTo(options);
		}
	}

	/**
	 * Initializes a title in-view state
	 *
	 * @param [visible]
	 * @emits `history:titleInView(visible: boolean)`
	 */
	protected initTitleInView(visible?: boolean): void {
		const
			{current} = this;

		this.block.setElMod(current?.title?.el, 'title', 'in-view', visible);
		this.component.emit('history:titleInView', visible);
	}

	/**
	 * Handler: was changed the visibility state of the top of a content
	 * @param state - if true, the top is visible
	 */
	protected onPageTopVisibilityChange(state: boolean): void {
		if (this.current?.title?.el) {
			this.initTitleInView(state);
		}

		this.component.onPageTopVisibilityChange(state);
	}

	/**
	 * Handler: click on a page title
	 */
	protected onTitleClick(): void {
		this.scrollToTop(true);
	}
}
