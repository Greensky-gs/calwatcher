import { AmethystCommand, log4js, preconditions } from "amethystjs";
import unregistered from "../../preconditions/unregistered";
import { ApplicationCommandOptionType } from "discord.js";
import { exampleCalendar, validCalendarURL } from "../../utils/toolbox";
import { manager } from "../../cache/managers";

export default new AmethystCommand({
    name: 'enregistrer',
    description: "Enregistre ton URL pour accéder aux fonctionnalités du bot",
    preconditions: [preconditions.GuildOnly, unregistered],
    options: [
        {
            name: 'url',
            description: "URL de votre CELCAT",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    aliases: ['register', 'signup', 'inscrire']
}).setMessageRun(async({ message, client, options }) => {
    const url = options.first;
    if (!url) return message.reply(`❌ | Vous devez spécifier une URL.\nExemple : \`${client.configs.prefix}enregistrer ${exampleCalendar()}\``).catch(log4js.trace);

    if (!validCalendarURL(url)) return message.reply(`❌ | Votre URL n'est pas valide.\n💡\n> Votre URL doit ressembler **exactement** à \`${exampleCalendar()}\`, mis à part le XXXXXXXXXXXXXX`).catch(log4js.trace);

    manager.register(message.author.id, url);
    return message.reply("✅ | Vous êtes désormais enregistré(e) !\nVous serez averti en __message privé__ si des changements doivent survenir.\n💡\n> Vérifiez que vos messages privés sont **ouverts** afin que je puisse vous notifier").catch(log4js.trace);
})