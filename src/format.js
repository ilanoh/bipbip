'use strict';

const hasColor = process.stdout.isTTY && !process.env.NO_COLOR;

const c = hasColor ? {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
} : {
  reset: '', bold: '', dim: '', green: '',
  yellow: '', cyan: '', red: '', gray: '',
};

function formatEta(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (h === 0 && m === 0) parts.push(`${s}s`);

  return parts.join('');
}

function printTimer(label, eta, message) {
  const msgPart = message && message !== 'Bipbip!'
    ? `  ${c.dim}${message}${c.reset}`
    : '';
  console.log(
    `\n  ${c.green}${c.bold}✓${c.reset} ${c.bold}bipbip${c.reset} in ${c.cyan}${c.bold}${eta}${c.reset} ${c.dim}(${label})${c.reset}${msgPart}\n`
  );
}

function printList(timers) {
  console.log();

  if (timers.length === 0) {
    console.log(`  ${c.dim}No active timers${c.reset}\n`);
    return;
  }

  console.log(`  ${c.bold}Active timers${c.reset}\n`);

  const now = Date.now();
  for (const t of timers) {
    const remaining = Math.max(0, Math.round((t.firesAt - now) / 1000));
    const eta = formatEta(remaining);
    console.log(
      `  ${c.yellow}${String(t.pid).padStart(6)}${c.reset}  ${c.cyan}${c.bold}${eta.padEnd(8)}${c.reset}${c.dim}${t.label}${c.reset}  ${t.message}`
    );
  }

  console.log();
}

function printCancelled(text) {
  console.log(`\n  ${c.yellow}${text}${c.reset}\n`);
}

function printError(text) {
  console.error(`\n  ${c.red}${text}${c.reset}\n`);
}

function printHelp() {
  console.log(`
  ${c.yellow}${c.bold}bipbip${c.reset}  ${c.dim}notification timer for your terminal${c.reset}

  ${c.bold}USAGE${c.reset}

    ${c.cyan}$${c.reset} bipbip <when> [message]

  ${c.bold}DURATIONS${c.reset}

    ${c.cyan}bipbip 5${c.reset}                 5 minutes
    ${c.cyan}bipbip 30s${c.reset}               30 seconds
    ${c.cyan}bipbip 5m${c.reset}                5 minutes
    ${c.cyan}bipbip 1h${c.reset}                1 hour
    ${c.cyan}bipbip 1h30${c.reset}              1 hour 30 minutes
    ${c.cyan}bipbip 2h15m${c.reset}             2 hours 15 minutes

  ${c.bold}TIMES${c.reset}

    ${c.cyan}bipbip 16:33${c.reset}             at 16:33 today
    ${c.cyan}bipbip 1633${c.reset}              at 16:33 today
    ${c.cyan}bipbip noon${c.reset}              at 12:00
    ${c.cyan}bipbip midnight${c.reset}          at 00:00

  ${c.bold}TOMORROW${c.reset}

    ${c.cyan}bipbip tomorrow${c.reset}          tomorrow at 09:00
    ${c.cyan}bipbip tomorrow 14${c.reset}       tomorrow at 14:00
    ${c.cyan}bipbip tomorrow 9:30${c.reset}     tomorrow at 09:30
    ${c.cyan}bipbip tomorrow 1630${c.reset}     tomorrow at 16:30

  ${c.bold}WITH A MESSAGE${c.reset}

    ${c.cyan}bipbip 5 Stand up and stretch${c.reset}
    ${c.cyan}bipbip 1633 Pick up the kids${c.reset}
    ${c.cyan}bipbip 1h Call the client back${c.reset}
    ${c.cyan}bipbip tomorrow 9 Morning standup${c.reset}

  ${c.bold}MANAGE${c.reset}

    ${c.cyan}bipbip list${c.reset}              show active timers
    ${c.cyan}bipbip cancel${c.reset}            cancel all timers
    ${c.cyan}bipbip cancel <pid>${c.reset}      cancel specific timer

  ${c.bold}ENVIRONMENT${c.reset}

    ${c.cyan}BIPBIP_SILENT=1${c.reset}          disable voice/sound (notification only)
    ${c.cyan}NO_COLOR=1${c.reset}               disable colored output
`);
}

module.exports = { c, formatEta, printTimer, printList, printCancelled, printError, printHelp };
