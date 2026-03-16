'use strict';

function parse(args) {
  let tomorrow = false;
  let idx = 0;

  if (args[idx] === 'tomorrow') {
    tomorrow = true;
    idx++;
  }

  const spec = args[idx] || '';
  idx++;

  const message = args.slice(idx).join(' ') || 'Bipbip!';

  let seconds = 0;
  let label = '';
  const pfx = tomorrow ? 'tomorrow ' : '';

  // "bipbip tomorrow" with no time → tomorrow 09:00
  if (!spec && tomorrow) {
    seconds = secondsUntil('09:00', true);
    label = `${pfx}09:00`;
  }
  // Seconds: 30s, 90s
  else if (/^\d+s$/.test(spec)) {
    seconds = parseInt(spec, 10);
    label = `${seconds}s`;
  }
  // Hours + minutes: 1h30, 2h15m
  else if (/^(\d+)h(\d+)m?$/.test(spec)) {
    const m = spec.match(/^(\d+)h(\d+)m?$/);
    seconds = parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60;
    label = `${m[1]}h${m[2]}m`;
  }
  // Hours: 1h, 2h
  else if (/^(\d+)h$/.test(spec)) {
    seconds = parseInt(spec, 10) * 3600;
    label = spec;
  }
  // Minutes with unit: 5m, 30m
  else if (/^(\d+)m$/.test(spec)) {
    seconds = parseInt(spec, 10) * 60;
    label = spec;
  }
  // 4-digit time: 1633 → 16:33
  else if (/^\d{4}$/.test(spec)) {
    const time = `${spec.slice(0, 2)}:${spec.slice(2)}`;
    seconds = secondsUntil(time, tomorrow);
    label = `${pfx}${time}`;
  }
  // Colon time: 16:33, 8:00
  else if (/^\d{1,2}:\d{2}$/.test(spec)) {
    seconds = secondsUntil(spec, tomorrow);
    label = `${pfx}${spec}`;
  }
  // Bare number: 5 → 5 min, or after tomorrow: 14 → 14:00
  else if (/^\d{1,3}$/.test(spec)) {
    if (tomorrow) {
      const h = spec.padStart(2, '0');
      seconds = secondsUntil(`${h}:00`, true);
      label = `${pfx}${h}:00`;
    } else {
      seconds = parseInt(spec, 10) * 60;
      label = `${spec} min`;
    }
  }
  // Named times
  else if (spec === 'noon') {
    seconds = secondsUntil('12:00', tomorrow);
    label = `${pfx}noon`;
  }
  else if (spec === 'midnight') {
    seconds = secondsUntil('00:00', true);
    label = `${pfx}midnight`;
  }
  else if (!spec) {
    return { error: 'missing time spec' };
  }
  else {
    return { error: `unknown format: ${spec}` };
  }

  return { seconds, label, message };
}

function secondsUntil(timeStr, addDay = false) {
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  const target = new Date(now);
  target.setHours(h, m, 0, 0);

  if (addDay) {
    target.setDate(target.getDate() + 1);
  } else if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return Math.round((target - now) / 1000);
}

module.exports = { parse, secondsUntil };
