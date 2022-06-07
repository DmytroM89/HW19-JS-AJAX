const wrapper = document.querySelector('.wrapper');
const input = document.querySelector('#input');
const list = document.querySelector('#list');

wrapper.addEventListener('click', (e) => {
    let action = e.target.dataset.action;
    let element = e.target;

    switch (action) {
        case 'create':
            let data = JSON.stringify({
                task: input.value,
                complited: false
            });

            createUpdateTodo('', 'POST', data)
                .then((res) => {
                    let newLi = document.createElement('li');
                    newLi.classList.add('in-progress');
                    newLi.dataset.id = res.id;

                    newLi.innerHTML = `<input class="me-1" type="checkbox" value="" data-action="update">${res.task}`;

                    list.append(newLi);
                    input.value = '';
                })
                .catch((err) => console.log('Error: ' + err))

            break;
        case 'delete':
            const conf = confirm('Are you sure?');

            if (conf) {
                deleteTodos(+element.dataset.id)
                    .then((res) => {
                        console.log(res);
                        element.closest('li').remove();
                    })
                    .catch((err) => console.warn('Error: ' + err))
            }

            break;
        case 'update':
            createUpdateTodo(+element.value, 'PATCH', JSON.stringify({complited: element.checked}))
                .then(() => {
                    element.closest('li').classList.toggle('done');
                })
                .catch((err) => console.warn('Error: ' + err))
            break;
    }
});

function renderTodos() {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();

        xhr.open('GET', 'http://localhost:3000/todos/', true);
        xhr.responseType = 'json';

        xhr.onload = function() {
            let status = xhr.status;

            if (status === 200) {
                resolve(xhr.response);
            } else {
                reject(status);
            }
        };
        xhr.send();
    });
};

function createUpdateTodo(todoId, type, data) {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();
        let url = 'http://localhost:3000/todos/';

        if (typeof todoId === 'number') {
            url += todoId;
        }

        xhr.open(type, url, true);
        xhr.setRequestHeader(
            'Content-type', 'application/json; charset=utf-8'
        );

        xhr.responseType = 'json';
        xhr.onload = function() {
            let status = xhr.status;

            if (status === 200) {
                resolve(xhr.response);
            } else {
                reject('Status ' + status);
            }
        };
        xhr.onerror = function(e) {
            reject("Error fetching " + url);
        };

        xhr.send(data);
    });
};

function deleteTodos(id) {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();

        xhr.open('DELETE', 'http://localhost:3000/todos/'+id, true);
        xhr.responseType = 'json';

        xhr.onload = function() {
            let status = xhr.status;

            if (status === 200) {
                resolve('Task deleted');
            } else {
                reject(status);
            }
        };
        xhr.send();
    });
};

renderTodos()
    .then((todos) => {
        let lis = '';
        for (const todo of todos) {
            if (!todo) {
                return;
            }
            lis += `<li ${todo.complited ? 'class="done"' : ''}>
                        <input class="me-1" type="checkbox" value="${todo.id}" data-action="update" ${todo.complited ? 'checked' : ''}>
                        <span class="task-name">${todo.task}</span>
                        <span class="spacer"></span>
                        <span class="material-symbols-outlined text-danger delete" data-action="delete" data-id="${todo.id}">close</span>
                    </li>`;
        }

        list.innerHTML = lis;
    })
    .catch((err) => console.log(err))
