let users = [];
document.getElementById('loginForm').addEventListener('submit', async function (event) {
    localStorage.clear();
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('username:', username, 'password:', password);

    try {
        const response = await fetch('https://wom-projekt-ezgcbya0hfdthsby.westeurope-01.azurewebsites.net/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: username,
                password: password
            })
        });

        const data = await response.json();
        
        if (response.status === 200) {
            console.log(data.message);
            console.log("Token: ", data.token);
            localStorage.setItem('username', username);
            localStorage.setItem('token', data.token);
            const user = users.find(user => user.name === username);
            localStorage.setItem('userId', user.id);

            window.location.href = '/boards.html'; 
        } else {
            alert(data.message);
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
});

function getUsers() {
    const usersList = document.getElementById('usersList');
    fetch('https://wom-projekt-ezgcbya0hfdthsby.westeurope-01.azurewebsites.net/api/users/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        users = data;
        console.log(data);
        data.forEach(user => {
            const listItem = document.createElement('li');
            listItem.textContent = user.name;
            usersList.appendChild(listItem);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
getUsers();