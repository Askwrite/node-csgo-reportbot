# node-csgo-reportbot

A node-steam plugin for reporting players in Counter-Strike: Global Offensive.
Demo: http://report-service.xyz

## Requirements

| Prerequisite    | How to check | How to install
| --------------- | ------------ | ------------- |
| Node.js 0.12.x  | `node -v`    | [nodejs.org](http://nodejs.org/) |

Additionally, you will need at least one Steam account with CS:GO, and Steamguard must be deactivated.

## Installation

1. Download the latest [stable](https://github.com/Askwrite/node-csgo-reportbot/releases/latest) or [development](https://github.com/Askwrite/node-csgo-reportbot/archive/master.zip) version of this package.
2. Run `npm install` from your terminal
3. rename `accounts.example.txt` to `accounts.txt` and modify it with your account credentials. You may enter multiple accounts.

## Usage

```
npm start
```

You will be prompted to enter the target player's SteamID64

![](http://i.imgur.com/PPEIPx8.png)

### Updating Protocol Definitions

```
npm run update
```

## Credits

* Based on [node-steam](https://github.com/seishun/node-steam) by [seishun](https://github.com/seishun)
* Trololo for the idea
