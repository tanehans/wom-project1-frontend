document.getElementById('createNoteBtn').addEventListener('click', createNewNote);
const noteContainer = document.getElementById('NoteContainer');

// Variabler för det dragna elementet
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

function createNewNote() {
    const noteDiv = document.createElement('div');
    noteDiv.classList.add('note');

    const textArea = document.createElement('textarea');
    textArea.value = '';
    textArea.addEventListener('input', (e) => {
        // Skicka data till websocket live
    });
    noteDiv.appendChild(textArea);

    const removeButton = document.createElement('button');
    removeButton.innerHTML = 'x';
    removeButton.addEventListener('click', (e) => {
        noteContainer.removeChild(noteDiv);
        // Skicka data till websocket live
    });
    noteDiv.appendChild(removeButton);

    noteDiv.style.top = '50px'; // Standardpositionen
    noteDiv.style.left = '50px';


    noteDiv.addEventListener('mousedown', (event) => startDragging(event, noteDiv));
    document.addEventListener('mouseup', stopDragging);

    noteContainer.appendChild(noteDiv);
}

function startDragging(e, noteDiv) {

    if (e.target.tagName === 'TEXTAREA') { // Ignorera dragning om det man klickar på textarean
        return;
    }

    draggedElement = noteDiv;
    draggedElement.classList.add('dragging');


    const noteRect = noteDiv.getBoundingClientRect();

    offsetX = e.clientX - noteRect.left;
    offsetY = e.clientY - noteRect.top;

    document.addEventListener('mousemove', dragElement);
}

function dragElement(e) {
    if (!draggedElement) return;

    const containerRect = noteContainer.getBoundingClientRect();

    let newX = e.clientX - containerRect.left - offsetX;
    let newY = e.clientY - containerRect.top - offsetY;

    newX = Math.max(0, Math.min(newX, containerRect.width - draggedElement.offsetWidth));
    newY = Math.max(0, Math.min(newY, containerRect.height - draggedElement.offsetHeight));

    draggedElement.style.left = `${newX}px`;
    draggedElement.style.top = `${newY}px`;

    // Skicka data till websocket live
}

function stopDragging() {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement = null;
    }
    document.removeEventListener('mousemove', dragElement);
}


window.onload = function() {
    boardId = new URLSearchParams(window.location.search).get('boardId');
    boardName = new URLSearchParams(window.location.search).get('boardName');
    document.getElementById('title').innerText = boardName;    
};
