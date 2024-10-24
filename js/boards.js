const token = localStorage.getItem('token');

if (!token) {
    alert('Please login to view boards');
    window.location.href = '/';  
} else {
    getBoards();
}
document.getElementById('createBoardForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const boardName = document.getElementById('boardName').value;

    try {
        const response = await fetch('https://wom-projekt-ezgcbya0hfdthsby.westeurope-01.azurewebsites.net/api/boards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: boardName
            })
        });

        const data = await response.json();

        if (response.status === 201) {
            alert('Board created successfully');
            getBoards(); 
        } else {
            alert('Error creating board: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

async function getBoards() {
    try {
        const response = await fetch('https://wom-projekt-ezgcbya0hfdthsby.westeurope-01.azurewebsites.net/api/boards', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            const boards = await response.json();
            displayBoards(boards);
        } else {
            const data = await response.json();
            alert('Error fetching boards: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayBoards(boards) {
    const boardsList = document.getElementById('boardsList');
    boardsList.innerHTML = ''; 

    boards.forEach(board => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `board.html?boardId=${board.id}&boardName=${board.name}`;  
        link.textContent = board.name;  
        listItem.appendChild(link);
        boardsList.appendChild(listItem);
    });
}

/* function getUsers() {
    const usersList = document.getElementById('usersList');
    fetch('https://wom-projekt-ezgcbya0hfdthsby.westeurope-01.azurewebsites.net/api/users/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        data.forEach(user => {
            const listItem = document.createElement('li');
            listItem.textContent = user.name;
            usersList.appendChild(listItem);
            listItem.
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
} */

/* function addFriend() {
    fetch

 */
getUsers();