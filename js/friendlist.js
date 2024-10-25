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
            const option = document.createElement('option');
            if(friend.friend.name === localStorage.getItem('username')) {
                console.log("friend: " + friend.user.name);
                option.value = friend.user.id;
                option.textContent = friend.user.name;
                friendsList.appendChild(option);
            }
            else {
                console.log("friend: " + friend.friend.name);
                option.value = friend.friend.id;
                option.textContent = friend.friend.name;
                friendsList.appendChild(option);
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
// if invitefriendbutton is clicked, add friend to board
function addFriendToBoard() {
    const friendId = document.getElementById('friendsList').value;
    fetch(`https://wom-projekt-ezgcbya0hfdthsby.westeurope-01.azurewebsites.net/api/boards/${boardId}/share`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            friendId: friendId
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        alert('Friend added to board');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
document.getElementById('inviteFriendBtn').addEventListener('click', addFriendToBoard);
getFriends();