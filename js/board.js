document.getElementById('exitBtn').addEventListener('click', exitBoard);
document.getElementById('createTicketBtn').addEventListener('click', createNewTicket);
const ticketContainer = document.getElementById('TicketContainer');
const boardId = new URLSearchParams(window.location.search).get('boardId');
const boardName = new URLSearchParams(window.location.search).get('boardName');
const token = localStorage.getItem('token');

let draggedElement = null;
let draggedTicket = null;
let offsetX = 0;
let offsetY = 0;
let tickets = [];

const socket = new WebSocket('https://wom-projekt-ezgcbya0hfdthsby.westeurope-01.azurewebsites.net');  

socket.onopen = function () {
    const joinMsg = {
        type: 'join',
        token: token,
        boardId: boardId
    };
    socket.send(JSON.stringify(joinMsg));
};

socket.onmessage = function (event) {
    const msg = JSON.parse(event.data);
    switch (msg.type) {
        case 'init':
            msg.tickets.forEach(ticket => {
                createTicketElement(ticket);
            });
            break;
        case 'createTicket':
            createTicketElement(msg.ticket);
            break;
        case 'updateTicket':
            updateTicketElement(msg.ticket);
            break;
        case 'deleteTicket':
            deleteTicketElement(msg.ticketId);
            break;
        case 'moveTicket':
            moveTicketElement(msg.ticket);
            break;
        case 'batchUpdate':
            msg.tickets.forEach(ticket => {
                moveTicketElement(ticket);
            });
            break;
        case 'ackCreate':
            console.log(`Ticket ${msg.ticket.id} created successfully.`);
            break;
        case 'ackUpdate':
            console.log(`Ticket ${msg.ticket.id} updated successfully.`);
            break;
        case 'ackDelete':
            console.log(`Ticket ${msg.ticketId} deleted successfully.`);
            break;
    }
};


function exitBoard() {
    window.location.href = '/boards.html';
}

function createNewTicket() {
    const ticket = {
        id: generateUniqueId(),
        content: '',
        position: { top: 50, left: 50 } 
    };

    createTicketElement(ticket);

    const msg = {
        type: 'createTicket',
        ticket: ticket
    };
    console.log('Sending message:', msg);
    socket.send(JSON.stringify(msg));
}


function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const debouncedUpdate = debounce((action, ticket) => {
    let msg;
    if (action === 'update') {
        msg = {
            type: 'updateTicket',
            ticket: ticket
        };
    } else if (action === 'delete') {
        msg = {
            type: 'deleteTicket',
            ticketId: ticket.id
        };
    }
    socket.send(JSON.stringify(msg));
}, 500);

function createTicketElement(ticket) {
    const ticketDiv = document.createElement('div');
    ticketDiv.classList.add('ticket');
    ticketDiv.dataset.ticketId = ticket.id;

    const textArea = document.createElement('textarea');
    textArea.classList.add('textarea');
    textArea.value = ticket.content || '';

    textArea.addEventListener('input', () => {
        ticket.content = textArea.value;
        debouncedUpdate('update', ticket);  
    });
    ticketDiv.appendChild(textArea);

    const removeButton = document.createElement('button');
    removeButton.classList.add('ticketbutton');
    removeButton.innerHTML = 'x';
    removeButton.addEventListener('click', () => {
        debouncedUpdate('delete', ticket); 
        setTimeout(() => {
            ticketContainer.removeChild(ticketDiv);
        }, 500); 
    });
    ticketDiv.appendChild(removeButton);

    const top = ticket.position?.top ?? 50;
    const left = ticket.position?.left ?? 50;

    ticketDiv.style.top = `${top}px`;
    ticketDiv.style.left = `${left}px`;
    ticketDiv.addEventListener('mousedown', (event) => startDragging(event, ticketDiv, ticket));
    document.addEventListener('mouseup', stopDragging);

    ticketContainer.appendChild(ticketDiv);
}

function dragElement(e) {
    if (!draggedElement) return;

    const containerRect = ticketContainer.getBoundingClientRect();
    let newX = e.clientX - containerRect.left - offsetX;
    let newY = e.clientY - containerRect.top - offsetY;

    newX = Math.max(0, Math.min(newX, containerRect.width - draggedElement.offsetWidth));
    newY = Math.max(0, Math.min(newY, containerRect.height - draggedElement.offsetHeight));

    draggedElement.style.left = `${newX}px`;
    draggedElement.style.top = `${newY}px`;

    draggedTicket.position.top = newY;
    draggedTicket.position.left = newX;

    debouncedUpdate('update', draggedTicket);  
}

function startDragging(e, ticketDiv, ticket) {
    if (e.target.tagName === 'TEXTAREA') return;

    draggedElement = ticketDiv;
    draggedTicket = ticket;
    draggedElement.classList.add('dragging');

    const ticketRect = ticketDiv.getBoundingClientRect();
    offsetX = e.clientX - ticketRect.left;
    offsetY = e.clientY - ticketRect.top;

    document.addEventListener('mousemove', dragElement);
}

function stopDragging() {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement = null;
        draggedTicket = null;
    }
    document.removeEventListener('mousemove', dragElement);
}



function updateTicketElement(ticket) {
    const ticketDiv = document.querySelector(`.ticket[data-ticket-id='${ticket.id}']`);
    if (ticketDiv) {
        const textArea = ticketDiv.querySelector('textarea');
        textArea.value = ticket.content;
    }
}

function deleteTicketElement(ticketId) {
    console.log('Deleting ticket with ID:', ticketId); 
    const ticketDiv = document.querySelector(`.ticket[data-ticket-id='${ticketId}']`);
    if (ticketDiv) {
        ticketContainer.removeChild(ticketDiv);
    }
}

function moveTicketElement(ticket) {
    const ticketDiv = document.querySelector(`.ticket[data-ticket-id='${ticket.id}']`);
    if (ticketDiv) {
        const top = ticket.position?.top ?? 50;
        const left = ticket.position?.left ?? 50;

        ticketDiv.style.top = `${top}px`;
        ticketDiv.style.left = `${left}px`;
    }
}

function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

window.onload = function () {
    document.getElementById('title').innerText = boardName;
};
