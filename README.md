# Simple Chat App (Like WhatsApp)

## What is this?
This is a chat app where people can talk to each other in real time. It looks like WhatsApp and uses special tech to send messages instantly.

## What can it do?
- Send messages to other users right away
- Show user pictures and names
- Show when someone is typing
- List who is online or offline
- Search for users
- Open many tabs to pretend to be different users on one computer

## What do you need?
- Node.js (a program to run JavaScript on your computer, version 14 or newer)
- npm (comes with Node.js, helps install things)

## How to set it up
1. Get the code: Download or copy this project to your computer.
2. Open a command window (like Command Prompt or Terminal) and go to the project folder.
3. Type `npm install` and press Enter. This installs what the app needs.

## How to run it
1. In the command window, type `npm start` and press Enter.
2. Open your web browser (like Chrome or Firefox).
3. Go to this address: http://localhost:3000
4. A box will ask for your name. Type your name and click OK. The app picks a random picture for you.
5. To test with more users, open more browser tabs or windows and go to the same address. Enter different names each time.

## How to use it
- Look at the list of users on the left. Click on one to start talking.
- Type your message in the box at the bottom and press the Send button or Enter key.
- You'll see "typing..." when the other person is writing.
- The tab name in your browser shows your username, so you know which tab is which user.

## Files in the project
- `server.js`: The main server file that handles everything.
- `public/index.html`: The main web page.
- `public/script.js`: Code that makes the chat work in the browser.
- `public/styles.css`: Code that makes it look nice.
- `package.json`: Info about the project and what it needs.

## How to test it
- Open a few browser tabs with different users.
- Send messages between them and check they arrive.
- See if "typing" shows up.
- Make sure the user list updates when people join or leave.
- Check that you don't get the same message twice.

## If something goes wrong
- If it says port 3000 is busy, close other programs using it or change the port number in `server.js`.
- Make sure Node.js and npm are installed. You can check by typing `node -v` and `npm -v` in the command window.

## License
This is free to use under the ISC License.

## Made by
[Your Name]
