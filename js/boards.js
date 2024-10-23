const boardName = document.getElementById('boardName').value;
const token = localStorage.getItem('token');

document.getElementById('createBoardForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    console.log('boardName:', boardName, 'token:', token);
    getBoards();
});

async function getBoards() {
    try {
        const response = await fetch('http://localhost:3000/api/boards', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if(response.status === 200) {
            alert('Boards fetched successfully');
            const boards = await response.json();
            displayBoards(boards);
        } else {
            const data = await response.json();
            alert('Error fetching boards: '+ data.message);
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
if (token){
    getBoards();
} else {
    alert('Please login to view boards');
    window.location.href = '/login.html';
}
