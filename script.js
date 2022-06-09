const wrapper = document.querySelector('.wrapper');
const input = document.querySelector('#input');
const list = document.querySelector('#list');

wrapper.addEventListener('click', handleClick);

async function handleClick(e) {
    let action = e.target.dataset.action;
    let element = e.target;

    switch (action) {
        case 'create':
            try {
                const data = JSON.stringify({
                    task: input.value,
                    complited: false
                });

                const result = await createUpdateTodo('POST','', data);
                renderNewTodo(result);
            } catch(err) {
                console.error('Error: ' + err);
            }
            break;
        case 'delete':
            try {
                const conf = confirm('Are you sure?');

                if (conf) {
                    await deleteTodos(+element.dataset.id);
                    element.closest('li').remove();
                }
            } catch(err) {
                console.error('Error: ' + err);
            }
            break;
        case 'update':
            try {
                await createUpdateTodo('PATCH', +element.value, JSON.stringify({complited: element.checked}));
                element.closest('li').classList.toggle('done');
            } catch(err) {
                console.error('Error: ' + err);
            }
            break;
    }
}

async function getTodos() {
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

async function createUpdateTodo(type, todoId, data) {
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

            if (status === 201 || status === 200) {
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

async function deleteTodos(id) {
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

async function renderTodos() {
    try {
        const todos = await getTodos();

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
    } catch (err) {
        console.error('Error: ' + err);
    }

}

function renderNewTodo(data) {
    let newLi = document.createElement('li');
    newLi.classList.add('in-progress');

    newLi.innerHTML = `<input class="me-1" type="checkbox" value="${data.id}" data-action="update">
                    <span class="task-name">${data.task}</span>
                    <span class="spacer"></span>
                    <span class="material-symbols-outlined text-danger delete" data-action="delete" data-id="${data.id}">close</span>`;

    list.append(newLi);
    input.value = '';
}

renderTodos();
