'use strict';

const { execFileSync, execSync } = require('child_process');
const os = require('os');

function notify(title, message) {
  const platform = os.platform();

  try {
    if (platform === 'darwin') {
      macosNotify(title, message);
    } else if (platform === 'linux') {
      linuxNotify(title, message);
    } else if (platform === 'win32') {
      windowsNotify(title, message);
    }
  } catch {
    // Fallback: terminal bell
    process.stderr.write('\x07');
  }
}

// ── macOS ───────────────────────────────────────────────────────────────────

function macosNotify(title, message) {
  const script = `display notification "${escapeAS(message)}" with title "${escapeAS(title)}" sound name "Glass"`;
  execFileSync('osascript', ['-e', script]);

  if (!process.env.BIPBIP_SILENT) {
    try {
      // Use Samantha (natural, clear voice) with a comfortable speech rate
      execFileSync('say', ['-v', 'Samantha', '-r', '180', message]);
    } catch {
      try {
        // Fallback to any available voice
        execFileSync('say', [message]);
      } catch {}
    }
  }
}

// ── Linux ───────────────────────────────────────────────────────────────────

function linuxNotify(title, message) {
  try {
    execFileSync('notify-send', ['-a', 'BipBip', title, message]);
  } catch {
    try {
      execFileSync('zenity', ['--notification', `--text=${title}: ${message}`]);
    } catch {}
  }

  if (!process.env.BIPBIP_SILENT) {
    // Sound
    tryCommands([
      ['canberra-gtk-play', ['-i', 'complete']],
      ['paplay', ['/usr/share/sounds/freedesktop/stereo/complete.oga']],
    ]);

    // Voice: try espeak-ng (better quality), then espeak, then spd-say
    tryCommands([
      ['espeak-ng', ['-s', '160', '-p', '50', message]],
      ['espeak', ['-s', '160', message]],
      ['spd-say', ['-w', '-r', '-20', message]],
    ]);
  }
}

// ── Windows ─────────────────────────────────────────────────────────────────

function windowsNotify(title, message) {
  const ps = `
    Add-Type -AssemblyName System.Windows.Forms
    $n = New-Object System.Windows.Forms.NotifyIcon
    $n.Icon = [System.Drawing.SystemIcons]::Information
    $n.BalloonTipTitle = '${escapePS(title)}'
    $n.BalloonTipText = '${escapePS(message)}'
    $n.Visible = $true
    $n.ShowBalloonTip(5000)
    Start-Sleep -Seconds 6
    $n.Dispose()
  `;
  execFileSync('powershell', ['-NoProfile', '-Command', ps]);

  if (!process.env.BIPBIP_SILENT) {
    // Beep
    try {
      execFileSync('powershell', [
        '-NoProfile', '-Command',
        '[console]::beep(800,200); Start-Sleep -m 100; [console]::beep(800,200)',
      ]);
    } catch {}

    // Voice via SAPI
    try {
      const sapiScript = `
        Add-Type -AssemblyName System.Speech
        $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
        $synth.Rate = 0
        $synth.Speak('${escapePS(message)}')
        $synth.Dispose()
      `;
      execFileSync('powershell', ['-NoProfile', '-Command', sapiScript]);
    } catch {}
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function tryCommands(commands) {
  for (const [cmd, args] of commands) {
    try {
      execFileSync(cmd, args);
      return true;
    } catch {}
  }
  return false;
}

function escapeAS(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escapePS(str) {
  return str.replace(/'/g, "''");
}

module.exports = { notify };
