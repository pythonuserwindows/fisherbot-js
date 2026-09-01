# FisherBot (fisherbot-js)

A simple Node.js chat bot that connects to a socket.io chat (http://windows93.net) and provides a fishing mini-game with commands:

Commands:
- f?help       -> Show help and list available commands
- f?fish       -> Cast and try to catch junk/fish/rare items (uses bait if available)
- f?stats      -> Show your wallet, bait, and totals
- f?shop       -> Show shop; `f?shop buy` to buy Golden Bait ($150)
- f?steal <user> -> Try to steal money from a user (risky)
- f?gamble <amount|all> <heads/tails> -> Coinflip gamble
- f?top        -> Shows top 3 richest players

Setup:
1. Clone the repo
2. Install dependencies:
   npm install
3. Start:
   npm start

Notes:
- The bot stores per-user scores in `scores.json` in the repo directory (it is ignored by git by default).
- Modify the socket URL in `index.js` if you want to connect to a different server.
