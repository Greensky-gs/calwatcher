import { AmethystCommand, log4js } from "amethystjs";
import registered from "../../preconditions/registered";
import { manager } from "../../cache/managers";
import { drawEdt } from "../../scripts/drawEDT";
import { AttachmentBuilder } from "discord.js";

export default new AmethystCommand({
    name: 'edt',
    description: "Affiche votre emploi du temps",
    preconditions: [registered],
    aliases: ['emploi-du-temps', 'timetable', 'tt', 'schedule', 'semaine'],
    cooldown: 60
}).setMessageRun(async({ message }) => {
    if (message.channel.isSendable()) await message.channel.sendTyping();

    const data = manager.getData(message.author.id).watcher.courses
    
    const edt = await drawEdt(data);
    if (!edt) return message.reply('⚠️ | Impossible de générer votre emploi du temps.').catch(log4js.trace)

    message.reply({
        content: '📅 | Votre emploi du temps',
        files: [
            new AttachmentBuilder(edt, { name: 'edt.png' })
        ]
    }).catch(log4js.trace)
})