import { config } from "dotenv";
config();

import { AmethystClient } from "amethystjs/src/index.js";
import { ActivityType, Partials } from "discord.js";

const client = new AmethystClient({
    intents: ['Guilds', 'GuildMessages', 'MessageContent'],
    partials: [Partials.Message, Partials.Channel]
}, {
    prefix: 'i!',
    debug: true,
    debuggerColors: 'icon',
    botName: 'iCal Watcher',
    token: process.env.token,
    activity: {
        name: "Les cours",
        type: ActivityType.Watching
    },
    botNameWorksAsPrefix: true,
    strictPrefix: false,
    customPrefixAndDefaultAvailable: true,
    mentionWorksAsPrefix: true,
    autocompleteListenersFolder: './dist/autocompletes',
    commandsArchitecture: 'double',
    commandsFolder: './dist/commands',
    commandLocalizationsUsedAsNames: true,
    eventsFolder: './dist/events',
    buttonsFolder: './dist/buttons',
    modalHandlersFolder: './dist/modals',
    preconditionsFolder: './dist/preconditions',
    runMessageCommandsOnMessageEdit: true,
    eventsArchitecture: 'simple'
})

client.start({});