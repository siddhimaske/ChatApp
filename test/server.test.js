
const io = require('socket.io-client');
const { spawn } = require('child_process');

const SERVER_URL = 'http://localhost:3000';

let serverProcess;

beforeAll((done) => {
  serverProcess = spawn('node', ['server.js']);
  serverProcess.stdout.on('data', (data) => {
    if (data.toString().includes('Server running on port')) {
      done();
    }
  });
  serverProcess.stderr.on('data', (data) => {
    console.error('Server error:', data.toString());
  });
});

afterAll(() => {
  serverProcess.kill();
});

describe('Socket.IO Server', () => {
  let client1, client2;

  beforeEach((done) => {
    client1 = io(SERVER_URL);
    client2 = io(SERVER_URL);
    let connectedCount = 0;
    const onConnect = () => {
      connectedCount++;
      if (connectedCount === 2) done();
    };
    client1.on('connect', onConnect);
    client2.on('connect', onConnect);
  });

  afterEach(() => {
    if (client1.connected) client1.disconnect();
    if (client2.connected) client2.disconnect();
  });

  test('should broadcast user list on new user connection', (done) => {
    client1.emit('new-user', { name: 'Alice', avatar: 'avatar1.png' });
    client2.emit('new-user', { name: 'Bob', avatar: 'avatar2.png' });

    let userListCount = 0;
    client1.on('user-list', (users) => {
      userListCount++;
      if (userListCount === 2) {
        expect(users).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'Alice' }),
            expect.objectContaining({ name: 'Bob' }),
          ])
        );
        done();
      }
    });
  });

  test('should broadcast chat messages to all clients', (done) => {
    const message = 'Hello, world!';
    client1.emit('new-user', { name: 'Alice', avatar: 'avatar1.png' });
    client2.emit('new-user', { name: 'Bob', avatar: 'avatar2.png' });

    client2.on('chat-message', (msg) => {
      expect(msg).toMatchObject({
        user: 'Alice',
        message,
      });
      done();
    });

    client1.emit('chat-message', message);
  });

  test('should update user list on user disconnect', (done) => {
    client1.emit('new-user', { name: 'Alice', avatar: 'avatar1.png' });
    client2.emit('new-user', { name: 'Bob', avatar: 'avatar2.png' });

    client2.on('user-list', (users) => {
      if (!users.find(u => u.name === 'Bob')) {
        expect(users).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'Alice' }),
          ])
        );
        done();
      }
    });

    client2.disconnect();
  });
});
