/**
 * common
 */
void function (global) {
	'use strict';

	class mainController {
		constructor () {
			let btnAdd = document.querySelector('.main__add'),
			    elemList = document.querySelector('.list');

			this.counter = 0;

			btnAdd.addEventListener('click', this.add.bind(this));
			elemList.addEventListener('change', this.change.bind(this));
			elemList.addEventListener('input', this.change.bind(this));

			addEventListener('model:restore', this.restore.bind(this));
			addEventListener('view:remove', this.remove.bind(this));
		}

		add (event) {
			this.counter++;

			dispatchEvent(new CustomEvent('controller:create', {
				detail: {
					id: this.counter,
					completed: false,
					value: ''
				}
			}));
		}

		change (event) {
			let todo = event.target.closest('.todo'),
			    cbxComplete = todo.querySelector('.todo__checkbox'),
			    inpInput = todo.querySelector('.todo__value');

			dispatchEvent(new CustomEvent('controller:set', {
				detail: {
					id: parseInt(todo.dataset.id),
					completed: Boolean(cbxComplete.checked),
					value: String(inpInput.value)
				}
			}));
		}

		restore (event) {
			this.counter = this.counter > event.detail.id
				? this.counter
				: event.detail.id;
		}

		remove (event) {
			dispatchEvent(new CustomEvent('controller:remove', {
				detail: {
					id: event.detail.id
				}
			}));
		}
	}

	class mainModel {
		constructor (storage = 'todo') {
			this.storage = storage;

			addEventListener('controller:create', this.add.bind(this));
			addEventListener('controller:set', this.set.bind(this));
			addEventListener('controller:remove', this.remove.bind(this));
		}

		initialize () {
			let data = this.restore();

			if (data) {
				data.forEach(item => {
					dispatchEvent(new CustomEvent('model:restore', {
						detail: item
					}));
				});
			} else {
				this.store([]);
			}
		}

		add (event) {
			let data = this.restore();

			data.push(event.detail);
			this.store(data);

			dispatchEvent(new CustomEvent('model:create', {
				detail: event.detail
			}))
		}

		set (event) {
			let data = this.restore();

			data = data.map(item => {
				return item.id === event.detail.id
					? event.detail
					: item;
			});

			this.store(data);

			dispatchEvent(new CustomEvent('model:set', {
				detail: event.detail
			}))
		}

		remove (event) {
			let data = this.restore();

			data = data.filter(item => item.id !== event.detail.id);

			this.store(data);

			dispatchEvent(new CustomEvent('model:remove', {
				detail: event.detail
			}));
		}

		store (data) {
			localStorage.setItem(this.storage, JSON.stringify(data));
		}

		restore () {
			return JSON.parse(localStorage.getItem(this.storage));
		}
	}

	class mainView {
		constructor () {
			addEventListener('model:create', this.add.bind(this));
			addEventListener('model:restore', this.add.bind(this));
			addEventListener('model:set', this.set.bind(this));
			addEventListener('model:remove', this.remove.bind(this));

			this.elemList = document.querySelector('.list');
			this.tplRow = document.querySelector('.template__row');

			this.elemList.addEventListener('click', event => {
				let todo = event.target.closest('.todo'),
				    control = event.target;

				if (control.classList.contains('todo__remove')) {
					dispatchEvent(new CustomEvent('view:remove', {
						detail: {
							id: parseInt(todo.dataset.id)
						}
					}))
				}
			});
		}

		add (event) {
			const clone = document.importNode(this.tplRow.content, true);

			clone.querySelector('.todo').dataset.id = event.detail.id;

			clone.querySelector('.todo__checkbox').id =  bem({
				block: 'todo',
				elem: 'checkbox',
				modName: 'id',
				modVal: event.detail.id
			});

			clone.querySelector('.todo__value').id = bem({
				block: 'todo',
				elem: 'input',
				modName: 'id',
				modVal: event.detail.id
			});

			clone.querySelector('.todo__checkbox').checked = event.detail.completed;
			clone.querySelector('.todo__value').value = event.detail.value;

			this.elemList.appendChild(clone);
		}

		set (event) {
			let list = Array.from(document.querySelectorAll('.todo'));

			list
				.filter(item => item.dataset.id == event.detail.id)
				.forEach(item => {
					/**
					 * @todo:
					 */
				});
		}

		remove (event) {
			let list = Array.from(document.querySelectorAll('.todo'));

			list
				.filter(item => item.dataset.id == event.detail.id)
				.forEach(item => {
					item.remove();
				});
		}
	}

	function buildClass(className) {
		return `.${className}`;
	}

	function bem(definition) {
		return global.bemNaming.stringify(definition)
	}

	const controller = new mainController(),
	      view = new mainView(),
	      model = new mainModel();

	model.initialize();
}(window);
