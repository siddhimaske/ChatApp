
const socket = io();

let currentUser = null;
let selectedUser = null;
const userListElement = document.getElementById('user-list');
const messagesElement = document.getElementById('messages');
const chatWithElement = document.getElementById('chat-with');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const searchInput = document.getElementById('search');

const avatars = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/65.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/men/78.jpg',
  'https://randomuser.me/api/portraits/women/55.jpg',
];

// Prompt for user name and assign random avatar
function promptUsername() {
  let name = '';
  while (!name) {
    name = prompt('Enter your name:');
    if (!name) alert('Name cannot be empty.');
  }
  const avatar = avatars[Math.floor(Math.random() * avatars.length)];
  currentUser = { name, avatar };
  document.title = `WhatsApp - ${name}`;
  socket.emit('new-user', currentUser);
}

promptUsername();

let users = [];
let allUsers = []; // To keep track of all users who have joined/left
let currentTab = 'chats';

// Tab switching
document.getElementById('tab-chats').addEventListener('click', () => {
  currentTab = 'chats';
  document.getElementById('tab-chats').classList.add('active');
  document.getElementById('tab-contacts').classList.remove('active');
  document.getElementById('tab-settings').classList.remove('active');
  renderUserList(users);
});

document.getElementById('tab-contacts').addEventListener('click', () => {
  currentTab = 'contacts';
  document.getElementById('tab-contacts').classList.add('active');
  document.getElementById('tab-chats').classList.remove('active');
  document.getElementById('tab-settings').classList.remove('active');
  renderContactsList();
});

document.getElementById('tab-settings').addEventListener('click', () => {
  currentTab = 'settings';
  document.getElementById('tab-settings').classList.add('active');
  document.getElementById('tab-chats').classList.remove('active');
  document.getElementById('tab-contacts').classList.remove('active');
  userListElement.innerHTML = '<li>Settings coming soon...</li>';
});

// Render user list for Chats tab
function renderUserList(usersToRender) {
  userListElement.innerHTML = '';
  usersToRender.forEach((user) => {
    const li = document.createElement('li');
    li.classList.toggle('active', selectedUser && selectedUser.name === user.name);
    li.innerHTML = `
      <img class="avatar" src="${user.avatar}" alt="${user.name}" />
      <div class="user-info">
        <div class="user-name">${user.name}</div>
      </div>
    `;
    li.addEventListener('click', () => {
      selectedUser = user;
      chatWithElement.textContent = 'Chat with ' + user.name;
      renderUserList(users);
      messagesElement.innerHTML = '';
    });
    userListElement.appendChild(li);
  });
}

// Render contacts list for Contacts tab
function renderContactsList() {
  userListElement.innerHTML = '';
  allUsers.forEach((user) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img class="avatar" src="${user.avatar}" alt="${user.name}" />
      <div class="user-info">
        <div class="user-name">${user.name}</div>
        <div class="user-last-message">${user.status}</div>
      </div>
    `;
    li.addEventListener('click', () => {
      selectedUser = user;
      chatWithElement.textContent = 'Chat with ' + user.name;
      currentTab = 'chats';
      document.getElementById('tab-chats').classList.add('active');
      document.getElementById('tab-contacts').classList.remove('active');
      document.getElementById('tab-settings').classList.remove('active');
      renderUserList(users);
      messagesElement.innerHTML = '';
    });
    userListElement.appendChild(li);
  });
}

// Render chat message
function renderMessage({ user, avatar, message, time }, sentByCurrentUser) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.classList.add(sentByCurrentUser ? 'sent' : 'received');
  div.innerHTML = `
    <div class="username">${user}</div>
    <div class="text">${message}</div>
    <img class="avatar" src="${avatar}" alt="${user}" />
    <div class="time">${time}</div>
  `;
  messagesElement.appendChild(div);
  messagesElement.scrollTop = messagesElement.scrollHeight;
}

// Handle incoming user list update
socket.on('user-list', (userList) => {
  const previousUsers = [...users];
  users = userList.filter(u => u.name !== currentUser.name);
  // Update allUsers for Contacts
  userList.forEach(user => {
    if (!allUsers.find(u => u.name === user.name)) {
      allUsers.push({ ...user, status: 'Joined' });
    }
  });
  // Mark left users
  previousUsers.forEach(prevUser => {
    if (!users.find(u => u.name === prevUser.name)) {
      const user = allUsers.find(u => u.name === prevUser.name);
      if (user) user.status = 'Left';
    }
  });
  renderUserList(users);
  if (!selectedUser && users.length > 0) {
    selectedUser = users[0];
    chatWithElement.textContent = 'Chat with ' + selectedUser.name;
    renderUserList(users);
    messagesElement.innerHTML = '';
  }
  // Show join/leave notifications
  if (userList.length > previousUsers.length + 1) { // +1 for current user
    showNotification('A user has joined the chat');
  } else if (userList.length < previousUsers.length + 1) {
    showNotification('A user has left the chat');
  }
});

// Handle incoming chat message
socket.on('chat-message', (msg) => {
  // Render message only if it is from or to the selected user
  if (selectedUser && (msg.user === selectedUser.name || msg.user === currentUser.name)) {
    const sentByCurrentUser = msg.user === currentUser.name;
    renderMessage(msg, sentByCurrentUser);
  }
});

// Handle typing indicator
socket.on('typing', (data) => {
  if (selectedUser && data.user === selectedUser.name) {
    chatWithElement.textContent = `${selectedUser.name} is typing...`;
  }
});

socket.on('stop-typing', (data) => {
  if (selectedUser && data.user === selectedUser.name) {
    chatWithElement.textContent = 'Chat with ' + selectedUser.name;
  }
});

// Show notification message
function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Send message
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (!message || !selectedUser) return;
  // Send message with recipient info
  socket.emit('chat-message', { message, to: selectedUser.name });
  socket.emit('stop-typing', { to: selectedUser.name });
  messageInput.value = '';
});

// Typing indicator
let typingTimeout;
messageInput.addEventListener('input', () => {
  if (selectedUser) {
    socket.emit('typing', { to: selectedUser.name });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('stop-typing', { to: selectedUser.name });
    }, 1000);
  }
});

// Search users
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(query));
  renderUserList(filteredUsers);
});
