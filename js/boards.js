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
        console.log(data);
        data.forEach(user => {
            const listItem = document.createElement('li');
            if (user.name === localStorage.getItem('username')) {
                listItem.textContent = user.name + ' (You)';
            }
            listItem.textContent = user.name;
            usersList.appendChild(listItem);
            listItem.addEventListener('click', () => {
                if (user.name === localStorage.getItem('username')) {
                    alert('You cannot add yourself as a friend');
                    return;
                }
                alert('User clicked: ' + user.name);
                addFriend(user.id);
            });
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function addFriend(userId) {
    fetch(`https://wom-projekt-ezgcbya0hfdthsby.westeurope-01.azurewebsites.net/api/friends/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            friendId: userId
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        alert('Friend request sent');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getFriends() {
    const friendsList = document.getElementById('friendsList');
    fetch('https://wom-projekt-ezgcbya0hfdthsby.westeurope-01.azurewebsites.net/api/friends', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        data.forEach(friend => {
            if(friend.friend.name === localStorage.getItem('username')) {
                console.log("friend: " + friend.user.name);
                const listItem = document.createElement('li');
                listItem.textContent = friend.user.name;
                friendsList.appendChild(listItem);
            }
            else {
                console.log("friend: " + friend.friend.name);
                const listItem = document.createElement('li');
                listItem.textContent = friend.friend.name;
                friendsList.appendChild(listItem);
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getPendingRequests() {
    const requestsList = document.getElementById('requestsList');
    fetch('https://wom-projekt-ezgcbya0hfdthsby.westeurope-01.azurewebsites.net/api/friends/pending', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        data.forEach(request => {
            if (request.friendId == localStorage.getItem('userId')) {
                const listItem = document.createElement('li');
                listItem.textContent = request.user.name;
                const acceptButton = document.createElement('button');
                acceptButton.textContent = 'Accept';
                acceptButton.addEventListener('click', () => {
                    console.log('Accepting friend request:', request.userId);
                    acceptFriend(request.userId);
                });
                listItem.appendChild(acceptButton);
                const rejectButton = document.createElement('button');
                rejectButton.textContent = 'Reject';
                rejectButton.addEventListener('click', () => {
                    console.log('Rejecting friend request:', request.userId);
                    rejectFriend(request.userId);
                });
                listItem.appendChild(rejectButton);
                requestsList.appendChild(listItem);
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
function acceptFriend(friendId) {
    fetch(`https://wom-projekt-ezgcbya0hfdthsby.westeurope-01.azurewebsites.net/api/friends/respond`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            friendId: friendId,
            response: 'accepted'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Friend request accepted:', data);
        location.reload();
    })
    .catch(error => {
        console.error('Error accepting friend request:', error);
    });
}    
function rejectFriend(friendId) {
    fetch(`https://wom-projekt-ezgcbya0hfdthsby.westeurope-01.azurewebsites.net/api/friends/respond`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            friendId: friendId,
            response: 'rejected'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Friend request rejected:', data);
        location.reload();
    })
    .catch(error => {
        console.error('Error rejecting friend request:', error);
    });
}

getFriends();
getUsers();
getPendingRequests();