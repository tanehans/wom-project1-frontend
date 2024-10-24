document.getElementById('createTicketBtn').addEventListener('click', createNewTicket);
const ticketContainer = document.getElementById('TicketContainer');
const boardId = new URLSearchParams(window.location.search).get('boardId');
const boardName = new URLSearchParams(window.location.search).get('boardName');
const token = localStorage.getItem('token');

let draggedElement = null;
let draggedTicket = null;
let offsetX = 0;
let offsetY = 0;

// Initialisera websocket anslutningen
const socket = new WebSocket('ws://localhost:3000');

socket.onopen = function() {
    const joinMsg = {
        type: 'join',
        token: token,
        boardId: boardId
    };
    socket.send(JSON.stringify(joinMsg));
};

socket.onmessage = function(event) {
    const msg = JSON.parse(event.data);
    switch (msg.type) {
        case 'init':
            // Laddar alla tickets som finns i websocketen
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
    }
};

function createNewTicket() {
    const ticketId = generateUniqueId();
    const ticket = {
        id: ticketId,
        content: '',
        position: { top: 50, left: 50 }
    };

    createTicketElement(ticket);

    const msg = {
        type: 'createTicket',
        ticket: ticket
    };
    socket.send(JSON.stringify(msg));
}

function createTicketElement(ticket) {
    const ticketDiv = document.createElement('div');
    ticketDiv.classList.add('ticket');
    ticketDiv.dataset.ticketId = ticket.id;

    const textArea = document.createElement('textarea');
    textArea.value = ticket.content;
    textArea.addEventListener('input', () => {
        ticket.content = textArea.value;
        const msg = {
            type: 'updateTicket',
            ticket: ticket
        };
        socket.send(JSON.stringify(msg));
    });
    ticketDiv.appendChild(textArea);

    const removeButton = document.createElement('button');
    removeButton.innerHTML = 'x';
    removeButton.addEventListener('click', () => {
        ticketContainer.removeChild(ticketDiv);
        const msg = {
            type: 'deleteTicket',
            ticketId: ticket.id
        };
        socket.send(JSON.stringify(msg));
    });
    ticketDiv.appendChild(removeButton);

    ticketDiv.style.top = `${ticket.position.top}px`;
    ticketDiv.style.left = `${ticket.position.left}px`;

    ticketDiv.addEventListener('mousedown', (event) => startDragging(event, ticketDiv, ticket));
    document.addEventListener('mouseup', stopDragging);

    ticketContainer.appendChild(ticketDiv);
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

    const msg = {
        type: 'moveTicket',
        ticket: draggedTicket
    };
    socket.send(JSON.stringify(msg));
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
    const ticketDiv = document.querySelector(`.ticket[data-ticket-id='${ticketId}']`);
    if (ticketDiv) {
        ticketContainer.removeChild(ticketDiv);
    }
}

function moveTicketElement(ticket) {
    const ticketDiv = document.querySelector(`.ticket[data-ticket-id='${ticket.id}']`);
    if (ticketDiv) {
        ticketDiv.style.top = `${ticket.position.top}px`;
        ticketDiv.style.left = `${ticket.position.left}px`;
    }
}

// Temporär lösning för att generera unika id:n
function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

window.onload = function() {
    document.getElementById('title').innerText = boardName;
};
