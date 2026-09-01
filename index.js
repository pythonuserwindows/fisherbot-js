// FisherBot - socket.io fishing mini-game
// Save this as index.js and run with `node index.js`

const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');

const socket = io('http://windows93.net');
const SCORE_FILE = path.join(__dirname, 'scores.json');

let scoreTracker = {};
if (fs.existsSync(SCORE_FILE)) {
  try {
    scoreTracker = JSON.parse(fs.readFileSync(SCORE_FILE, 'utf8'));
    console.log('Scores loaded.');
  } catch (err) {
    scoreTracker = {};
  }
}

function saveScores() {
  try {
    fs.writeFileSync(SCORE_FILE, JSON.stringify(scoreTracker, null, 2), 'utf8');
  } catch (err) {}
}

const cooldowns = {};

const items = {
  junk: [
    { name: 'Old Boot 👢', dialogue: 'An old moldy boot.', value: 2 },
    { name: 'Soggy Worm 🪱', dialogue: 'A tiny worm. Is this a joke?', value: 1 },
    { name: 'Rusted Can 🥫', dialogue: 'A piece of river trash.', value: 3 },
    { name: 'Weeds 🌿', dialogue: 'Just slimy green weeds.', value: 1 },
    { name: 'Plastic Bag 🛍️', dialogue: 'A floating shopping bag.', value: 2 },
    { name: 'Dead Battery 🔋', dialogue: 'Corroded and leaking fluid.', value: 4 },
    { name: 'Soggy Newspaper 📰', dialogue: 'The print is completely washed out.', value: 2 },
    { name: 'Broken Glasses 👓', dialogue: 'Someone lost their sight here.', value: 5 }
  ],
  fish: [
    { name: 'Common Minnow 🐟', dialogue: 'Standard small fish.', value: 15 },
    { name: 'Ugly Blowfish 🐡', dialogue: 'Watch out for the venomous spikes.', value: 25 },
    { name: 'Boring Clownfish 🐠', dialogue: 'Bright colors, small price.', value: 20 },
    { name: 'Slime Eel 🐍', dialogue: 'Slippery and tough to hold.', value: 30 },
    { name: 'Flopping Salmon 🍣', dialogue: 'Decent size, good weight.', value: 45 },
    { name: 'Red Snapper 🐟', dialogue: 'A solid, reliable catch.', value: 40 },
    { name: 'Catfish 🐱', dialogue: 'Bottom feeder with long whiskers.', value: 35 },
    { name: 'Rainbow Trout 🌈', dialogue: 'Beautiful scales on this one.', value: 50 }
  ],
  rare: [
    { name: 'Massive Shark 🦈', dialogue: 'An absolute apex predator!', value: 200 },
    { name: 'Sunken Crown 👑', dialogue: 'Covered in barnacles and gold.', value: 350 },
    { name: "Neptune's Trident 🔱", dialogue: 'Glowing with mystical energy.', value: 500 },
    { name: 'Cyber Whale 🐳', dialogue: 'A robotic beast from the deep web.', value: 400 },
    { name: 'Giant Squid 🦑', dialogue: 'Deep sea monster dragged to the surface.', value: 250 },
    { name: 'Sunken Safe 🧰', dialogue: 'Heavy steel container. What is inside?', value: 300 },
    { name: 'Golden Carp 🪙', dialogue: 'Legendary fish of absolute fortune.', value: 600 },
    { name: 'Ghost Pirate Cutlass ⚔️', dialogue: 'A glowing, spectral blade.', value: 450 }
  ]
};

const BAIT_PRICE = 150;

function getRandomItem(type) {
  const pool = items[type];
  return pool[Math.floor(Math.random() * pool.length)];
}

socket.on('_connected', () => {
  console.log('FisherBot online.');
  socket.emit('user joined', 'FisherBot', '#00ffcc', '', '', '');
});

socket.on('message', (data) => {
  if (data.user === 'FisherBot' || !data.msg) return;

  const msg = data.msg.trim();
  const args = msg.split(' ');
  const cmd = args[0].toLowerCase();
  const username = data.user;

  if (!scoreTracker[username]) {
    scoreTracker[username] = { junk: 0, fish: 0, rare: 0, total: 0, cash: 50, bait: 0 };
  }

  // 5 second cooldown filter
  if (cmd === 'f?fish' || cmd === 'f?steal' || cmd === 'f?gamble') {
    const now = Date.now();
    if (cooldowns[username] && now < cooldowns[username]) {
      return;
    }
    cooldowns[username] = now + 5000;
  }

  // COMMAND: f?help
  if (cmd === 'f?help' || cmd === 'f?commands') {
    socket.send(`@${username} FisherBot Commands:\n` +
      `f?help - Show this help message\n` +
      `f?fish - Cast and try to catch junk/fish/rare items (uses bait if available)\n` +
      `f?stats - Show your wallet, bait, and totals\n` +
      `f?shop [buy] - Show shop; 'f?shop buy' buys Golden Bait ($${BAIT_PRICE})\n` +
      `f?steal <user> - Attempt to steal money from a user (risky)\n` +
      `f?gamble <amount|all> <heads/tails> - Coinflip gamble\n` +
      `f?top - Shows the top 3 richest players`);
    return;
  }

  // COMMAND 1: f?fish
  if (cmd === 'f?fish') {
    let roll = Math.random();
    let type = 'fish';
    let baseJunkLimit = 0.40;
    let baseRareLimit = 0.85;
    
    if (scoreTracker[username].bait > 0) {
      scoreTracker[username].bait--;
      baseRareLimit = 0.65;
      baseJunkLimit = 0.20;
    }

    if (roll < baseJunkLimit) {
      type = 'junk';
    } else if (roll > baseRareLimit) {
      type = 'rare';
    }

    const caught = getRandomItem(type);
    scoreTracker[username][type]++;
    scoreTracker[username].total++;
    scoreTracker[username].cash += caught.value;
    saveScores();

    socket.send(`@${username} reeled in a ${caught.name} (Worth $${caught.value}). "${caught.dialogue}"`);
  }

  // COMMAND 2: f?stats
  if (cmd === 'f?stats') {
    const stats = scoreTracker[username];
    socket.send(`@${username} -> Wallet: $${stats.cash} | Bait: ${stats.bait} | Total: ${stats.total} (🐟:${stats.fish} 🗑️:${stats.junk} 👑:${stats.rare})`);
  }

  // COMMAND 3: f?shop
  if (cmd === 'f?shop') {
    if (args[1] && args[1].toLowerCase() === 'buy') {
      if (scoreTracker[username].cash >= BAIT_PRICE) {
        scoreTracker[username].cash -= BAIT_PRICE;
        scoreTracker[username].bait += 1;
        saveScores();
        socket.send(`@${username} bought 1 Golden Bait charge for $${BAIT_PRICE}! Next cast has high luck.`);
      } else {
        socket.send(`@${username} You need $${BAIT_PRICE} for bait. You only have $${scoreTracker[username].cash}.`);
      }
    } else {
      socket.send(`🛒 SHOP -> Type "f?shop buy" to get Golden Bait for $${BAIT_PRICE}. (Boosts rare luck)`);
    }
  }

  // COMMAND 4: f?steal <username>
  if (cmd === 'f?steal') {
    const target = args.slice(1).join(' ').trim();
    if (!target) {
      socket.send(`@${username} Provide a target name. Example: f?steal TargetUser`);
      return;
    }
    
    const targetKey = Object.keys(scoreTracker).find(k => k.toLowerCase() === target.toLowerCase());
    if (!targetKey || targetKey === username) {
      socket.send(`@${username} Cannot rob that target.`);
      return;
    }

    if (scoreTracker[targetKey].cash < 20) {
      socket.send(`@${username} Target is completely broke.`);
      return;
    }

    const success = Math.random() > 0.60;
    if (success) {
      const stolenAmount = Math.floor(Math.random() * (scoreTracker[targetKey].cash * 0.3)) + 5;
      scoreTracker[targetKey].cash -= stolenAmount;
      scoreTracker[username].cash += stolenAmount;
      saveScores();
      socket.send(`💥 ROBBERY! @${username} stole $${stolenAmount} from @${targetKey}!`);
    } else {
      const penalty = 30;
      scoreTracker[username].cash = Math.max(0, scoreTracker[username].cash - penalty);
      saveScores();
      socket.send(`🚓 FAIL! @${username} got caught robbing @${targetKey} and lost $${penalty}.`);
    }
  }

  // COMMAND 5: f?gamble <amount> <heads/tails>
  if (cmd === 'f?gamble') {
    const betInput = args[1];
    const choiceInput = args[2];

    if (!betInput || !choiceInput) {
      socket.send(`@${username} Use: f?gamble <amount> <heads/tails> -> Example: f?gamble 50 heads`);
      return;
    }

    let bet = parseInt(betInput);
    if (betInput.toLowerCase() === 'all') {
      bet = scoreTracker[username].cash;
    }

    if (isNaN(bet) || bet <= 0) {
      socket.send(`@${username} Enter a valid number or 'all'.`);
      return;
    }

    if (scoreTracker[username].cash < bet) {
      socket.send(`@${username} You don't have enough cash for that bet.`);
      return;
    }

    const choice = choiceInput.toLowerCase();
    if (choice !== 'heads' && choice !== 'tails') {
      socket.send(`@${username} Pick 'heads' or 'tails'.`);
      return;
    }

    const flipResult = Math.random() > 0.5 ? 'heads' : 'tails';
    
    if (choice === flipResult) {
      scoreTracker[username].cash += bet;
      saveScores();
      socket.send(`🪙 COINFLIP: It landed on ${flipResult}! @${username} wins $${bet}!`);
    } else {
      scoreTracker[username].cash -= bet;
      saveScores();
      socket.send(`🪙 COINFLIP: It landed on ${flipResult}! @${username} lost $${bet}.`);
    }
  }

  // COMMAND 6: f?top
  if (cmd === 'f?top') {
    const players = Object.entries(scoreTracker);
    if (players.length === 0) return;

    players.sort((a, b) => b.cash - a.cash);
    const top3 = players.slice(0, 3);
    
    let leaderboardText = "💰 RICHEST FISHERS 💰 -> ";
    const lines = top3.map((player, index) => `#${index + 1}: ${player[0]} ($${player[1].cash})`);
    
    leaderboardText += lines.join(' | ');
    socket.send(leaderboardText);
  }
});
