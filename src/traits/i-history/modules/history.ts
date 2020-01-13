/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ModsDecl, ComponentHooks } from 'super/i-block/i-block';

import Block from 'super/i-block/modules/block';
import iHistory from 'traits/i-history/i-history';

import { InView } from 'core/component/directives/in-view';
import Async from 'core/async';

export interface Content {
	el: Element;
	trigger?: HTMLElement;
}

export interface Title {
	el: Nullable<Element>;
	initBoundingRect: CanUndef<DOMRect>;
}

export interface HistoryItem {
	stage: string;
	options: CanUndef<Dictionary>;
	content?: Content;
	title?: Title;
}

export interface HistoryConfig {
	pageTriggers: boolean;
	triggerAttr: string;
	titleThreshold: number;
}

export default class History<T extends iHistory> {
	/**
	 * Default configuration for any history item
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
	 * Linked context
	 */
	protected readonly component: T;

	/**
	 * Transitions stack
	 */
	protected stack: HistoryItem[] = [];

	/**
	 * History instance configuration
	 */
	protected config: HistoryConfig;

	/**
	 * @param component
	 * @param [initial]
	 * @param [config]
	 */
	constructor(
		component: T,
		initial: HistoryItem = {stage: 'index', options: {}},
		config?: HistoryConfig
	) {
		this.component = component;
		this.config = {...History.defaultConfig, ...config};
		this.stack.push(initial);

		this.componentHooks.mounted.push({fn: this.onMounted.bind(this)});
	}

	/**
	 * Hooks of linked component
	 */
	get componentHooks(): ComponentHooks {
		return this.component.unsafe.meta.hooks;
	}

	/**
	 * Linked component block
	 */
	get block(): Block {
		return this.component.unsafe.block;
	}

	/**
	 * Linked component async
	 */
	get async(): Async<T> {
		return this.component.unsafe.async;
	}

	/**
	 * Current stack position
	 */
	get current(): HistoryItem {
		return this.stack[this.stack.length - 1];
	}

	/**
	 * Pages stack
	 */
	get pagesInStack(): ReadonlyArray<HistoryItem> {
		return Object.freeze(this.stack);
	}

	/**
	 * Page count at the history
	 */
	get length(): number {
		return this.stack.length;
	}

	/**
	 * Adds the component stage to the pages stack
	 *
	 * @param stage
	 * @param [options]
	 * @emits history:transition(page: HistoryItem)
	 */
	push(stage: string, options?: Dictionary): void {
		const
			currentPage = this.current?.content?.el;

		const
			els = this.initPage(stage);

		if (els && els.content.el) {
			this.block.setElMod(els.content.el, 'page', 'turning', 'in');
			this.block.setElMod(currentPage, 'page', 'below', true);

			this.component.setMod('blankHistory', false);

			this.stack.push({stage, options, ...els});
			this.scrollToPageTop();
			this.component.emit('history:transition', this.current);

		} else {
			throw new Error(`Page ${stage} is not defined`);
		}
	}

	/**
	 * Navigates back through history
	 * @emits history:back(page: HistoryItem)
	 */
	back(): CanUndef<HistoryItem> {
		if (this.stack.length === 1) {
			return;
		}

		const
			current = this.stack.pop();

		if (current) {
			if (this.stack.length === 1) {
				this.component.setMod('blankHistory', true);
			}

			const
				page = current.content?.el;

			if (current.content?.trigger) {
				this.observeTitleTrigger(current.content.trigger, false);
			}

			if (page) {
				this.block.removeElMod(page, 'page', 'turning');

				const
					pageBelow = this.stack[this.stack.length - 1],
					pageBelowEl = pageBelow.content?.el;

				this.block.removeElMod(pageBelowEl, 'page', 'below');
			}

			this.component.emit('history:back', current);
		}

		return current;
	}

	/**
	 * Creates a trigger element for observing
	 */
	protected createTrigger(): CanUndef<HTMLElement> {
		if (!this.config.pageTriggers) {
			return;
		}

		const t = document.createElement('div');
		t.setAttribute(this.config.triggerAttr, 'true');

		Object.assign(t.style, {
			height: 1,
			width: 1,
			position: 'absolute',
			top: 0,
			zIndex: -1
		});

		return t;
	}

	/**
	 * Handler: page trigger inView visibility change
	 * @param show
	 */
	protected pageTopTriggerVisibilityChange(show: boolean): void {
		if (this.current?.title?.el) {
			this.initTitleInView();
		}

		this.component.unsafe.pageTopTriggerVisibilityChange(show);
	}

	/**
	 * Controls title triggers observing
	 *
	 * @param trigger
	 * @param flag
	 */
	protected observeTitleTrigger(trigger: HTMLElement, flag: boolean): void {
		if (!this.config.pageTriggers) {
			return;
		}

		if (flag) {
			InView.observe(trigger, {
				threshold: this.config.titleThreshold,
				onEnter: () => this.pageTopTriggerVisibilityChange(true),
				onLeave: () => this.pageTopTriggerVisibilityChange(false)
			});

		} else {
			InView.stopObserve(trigger);
		}
	}

	/**
	 * Initializes dom for the current page
	 * @param stage
	 */
	protected initPage(stage: string): {content: Content; title: Title} | void {
		const
			$a = this.async,
			page = this.block?.node?.querySelector(`[data-page=${stage}]`);

		if (!page) {
			return;
		}

		page.classList.add(this.block.getFullElName('page'));

		const
			title = page.querySelector('[data-title]'),
			hasTrigger = page.children[0].getAttribute(this.config.triggerAttr),
			trigger = !hasTrigger ? this.createTrigger() : <HTMLElement>page.children[0];

		if (title) {
			if (trigger) {
				trigger.style.height = title.clientHeight.px;
			}

			$a.on(
				title,
				'click',
				this.onTitleClick.bind(this)
			);
		}

		if (trigger) {
			page.insertAdjacentElement('afterbegin', trigger);
			this.observeTitleTrigger(trigger, true);
		}

		return {
			content: {
				el: page,
				trigger
			},

			title: {
				el: title,
				initBoundingRect: title?.getBoundingClientRect()
			}
		};
	}

	/**
	 * Scrolls page container to top
	 * @param [animate]
	 */
	protected scrollToPageTop(animate: boolean = false): void {
		if (this.current.content) {
			const
				options = {top: 0, left: 0};

			if (animate) {
				Object.assign(options, {behavior: 'smooth'});
			}

			this.current.content.el.scrollTo(options);
		}
	}

	/**
	 * Initializes title in view modifiers
	 * @emits history:titleInView(visible: boolean)
	 */
	protected initTitleInView(): void {
		const
			{current} = this,
			titleH = current?.title?.initBoundingRect?.height || 0,
			scrollTop = current.content?.el?.scrollTop || 0,
			visible = titleH - scrollTop > titleH * this.config.titleThreshold;

		this.block.setElMod(current?.title?.el, 'title', 'in-view', visible);
		this.component.emit('history:titleInView', visible);
	}

	/**
	 * Handler: on linked component mounted hook
	 */
	protected onMounted(): void {
		const
			els = this.initPage(this.current.stage);

		Object.assign(this.current, els);
		this.initTitleInView();
	}

	/**
	 * Handler: click on a page title
	 */
	protected onTitleClick(): void {
		this.scrollToPageTop(true);
	}

	/**
	 * Handler: on scroll inner page
	 */
	protected onPageScroll(): void {
		if (this.current?.title?.el) {
			this.initTitleInView();
		}
	}
}
