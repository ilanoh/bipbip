# bipbip

Dead simple notification timer for your terminal. No config. No dependencies. Just type and forget.

```
$ bipbip 5
  ✓ bipbip in 5m (5 min)
```

5 minutes later you get a native system notification with sound.

## Install

```sh
npm install -g bipbip-timer
```

## Usage

### Durations

```sh
bipbip 5            # 5 minutes
bipbip 30s          # 30 seconds
bipbip 5m           # 5 minutes
bipbip 1h           # 1 hour
bipbip 1h30         # 1 hour 30 minutes
bipbip 2h15m        # 2 hours 15 minutes
```

### Specific times

```sh
bipbip 16:33        # at 16:33 today (tomorrow if already past)
bipbip 1633         # same thing, without the colon
bipbip noon         # at 12:00
bipbip midnight     # at 00:00
```

### Tomorrow

```sh
bipbip tomorrow           # tomorrow at 09:00
bipbip tomorrow 14        # tomorrow at 14:00
bipbip tomorrow 9:30      # tomorrow at 09:30
bipbip tomorrow 1630      # tomorrow at 16:30
```

### Add a message

```sh
bipbip 5 Stand up and stretch
bipbip 1633 Pick up the kids
bipbip 1h Call the client back
bipbip tomorrow 9 Morning standup
```

### Manage timers

```sh
bipbip list              # show all active timers
bipbip cancel            # cancel everything
bipbip cancel 12345      # cancel a specific timer by PID
```

## How it works

`bipbip` spawns a tiny background process that sleeps until the target time, then fires a native OS notification with sound. Your terminal is free immediately.

Timers survive terminal closures. They also handle system sleep correctly by checking the actual clock rather than relying purely on `setTimeout` duration.

## Platform support

| Platform | Notification | Sound |
|----------|-------------|-------|
| macOS | Native (osascript) | Glass chime + "bip bip" voice |
| Linux | notify-send | System sound |
| Windows | Toast notification | Console beep |

## Environment variables

| Variable | Effect |
|----------|--------|
| `BIPBIP_SILENT=1` | Disable voice and sound (visual notification only) |
| `NO_COLOR=1` | Disable colored terminal output |

## Zero dependencies

bipbip has no npm dependencies. It uses native OS commands for notifications on every platform.

## License

MIT
