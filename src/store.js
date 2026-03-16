'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const STORE_DIR = path.join(os.homedir(), '.bipbip');
const STORE_FILE = path.join(STORE_DIR, 'timers.json');

function ensureDir() {
  fs.mkdirSync(STORE_DIR, { recursive: true });
}

function load() {
  ensureDir();
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function save(timers) {
  ensureDir();
  const tmp = `${STORE_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(timers, null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

function add(timer) {
  const timers = load();
  timers.push(timer);
  save(timers);
}

function remove(pid) {
  const timers = load().filter(t => t.pid !== pid);
  save(timers);
}

function cleanup() {
  const timers = load();
  const alive = timers.filter(t => isAlive(t.pid));
  if (alive.length !== timers.length) {
    save(alive);
  }
  return alive;
}

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

module.exports = { add, remove, load, save, cleanup };
