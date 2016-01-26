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
		    inpInput = todo.querySelector('.todo__input-value');

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
	constructor (storage) {
		this.storage = storage || 'todo';

		addEventListener('controller:create', this.add.bind(this));
		addEventListener('controller:set', this.set.bind(this));
		addEventListener('controller:remove', this.remove.bind(this));

		let data = this.restore();

		if (data) {
			data.forEach(function (item) {
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

		data = data.map(function (item) {
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

		data = data.filter(function (item) {
			return item.id !== event.detail.id;
		});

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

		this.elemList.addEventListener('click', function (event) {
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
		let clone = document.importNode(this.tplRow.content, true);

		clone.querySelector('.todo').dataset.id = event.detail.id;

		clone.querySelector('.todo__checkbox-label').htmlFor = `todo__checkbox_id_${event.detail.id}`;
		clone.querySelector('.todo__checkbox').id = `todo__checkbox_id_${event.detail.id}`;
		clone.querySelector('.todo__checkbox').checked = event.detail.completed;
		componentHandler.upgradeElement(clone.querySelector('.todo__checkbox-label'));

		clone.querySelector('.todo__input-label').htmlFor = `todo__input_id_${event.detail.id}`;
		clone.querySelector('.todo__input-value').id = `todo__input_id_${event.detail.id}`;
		clone.querySelector('.todo__input-value').value = event.detail.value;
		componentHandler.upgradeElement(clone.querySelector('.todo__input-container'));

		this.elemList.appendChild(clone);
	}

	set (event) {
		let list = document.querySelectorAll('.todo');

		list = Array.prototype.filter.call(list, function (item) {
			return item.dataset.id == event.detail.id;
		});

		list.forEach(function (item) {
			//
		});
	}

	remove (event) {
		let list = document.querySelectorAll('.todo');

		list = Array.prototype.filter.call(list, function (item) {
			return item.dataset.id == event.detail.id;
		});

		list.forEach(function (item) {
			item.remove();
		});
	}
}

var controller = new mainController(),
    view = new mainView(),
    model = new mainModel();
