#!/usr/bin/env node
'use strict';

const { spawn } = require('child_process');
const path = require('path');
const { parse } = require('../src/parse');
const { notify } = require('../src/notify');
const store = require('../src/store');
const fmt = require('../src/format');

const args = process.argv.slice(2);

// ── Internal: daemon mode (spawned in background to fire the notification) ──

if (args[0] === '--fire') {
  const firesAt = parseInt(args[1], 10);
  const message = args[2] || 'Bipbip!';

  (function check() {
    const remaining = firesAt - Date.now();
    if (remaining <= 0) {
      notify('BipBip', message);
      store.remove(process.pid);
      process.exit(0);
    } else {
      // Re-check periodically (handles system sleep/wake correctly)
      setTimeout(check, Math.min(remaining + 500, 60000));
    }
  })();

} else {
  main();
}

// ── CLI entry ───────────────────────────────────────────────────────────────

function main() {
  const cmd = args[0];

  // Version
  if (cmd === 'version' || cmd === '--version' || cmd === '-v') {
    const pkg = require('../package.json');
    console.log(pkg.version);
    process.exit(0);
  }

  // Help
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    fmt.printHelp();
    process.exit(0);
  }

  // List active timers
  if (cmd === 'list' || cmd === 'ls') {
    fmt.printList(store.cleanup());
    process.exit(0);
  }

  // Cancel timers
  if (cmd === 'cancel' || cmd === 'stop') {
    const target = args[1] || 'all';

    if (target === 'all') {
      const timers = store.load();
      for (const t of timers) {
        try { process.kill(t.pid); } catch {}
      }
      store.save([]);
      fmt.printCancelled('All timers cancelled');
    } else {
      const pid = parseInt(target, 10);
      try { process.kill(pid); } catch {}
      store.remove(pid);
      fmt.printCancelled(`Timer ${pid} cancelled`);
    }

    process.exit(0);
  }

  // Parse time spec
  const result = parse(args);

  if (result.error) {
    fmt.printError(result.error);
    process.exit(1);
  }

  const { seconds, label, message } = result;
  const firesAt = Date.now() + seconds * 1000;

  // Spawn a detached background process that will fire the notification
  const child = spawn(process.execPath, [
    path.join(__dirname, 'bipbip.js'),
    '--fire',
    String(firesAt),
    message,
  ], {
    detached: true,
    stdio: 'ignore',
  });

  child.unref();

  // Track the timer
  store.add({
    pid: child.pid,
    label,
    message,
    firesAt,
  });

  fmt.printTimer(label, fmt.formatEta(seconds), message);
}
