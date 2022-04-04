#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import execSync from '@polkadot/dev/scripts/execSync.mjs';
import {Webhook} from "discord-webhook-node";

console.log('$ polkadot-ci-ghact-build', process.argv.slice(2).join(' '));

const discordHook = new Webhook(`https://discordapp.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_TOKEN}`);

function runClean () {
  execSync('yarn polkadot-dev-clean-build');
}

function runCheck () {
  execSync('yarn lint');
}

function runTest () {
  execSync('yarn test');
}

function sendFailedMessage(step) {
  discordHook.send('Failed at: ' + step)
}



runClean();
let failed = false;

try {
  runCheck();
} catch (e) {
  failed = true;
  sendFailedMessage('Lint')
}


try {
  runTest();
} catch (e) {
  failed = true;
  sendFailedMessage('Test')
}

if (!failed) {
  discordHook.send('Success run common')
}

