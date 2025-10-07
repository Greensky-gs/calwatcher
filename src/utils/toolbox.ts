import { log4js } from "amethystjs"
import { Message, MessageCreateOptions, MessagePayload } from "discord.js"

export const exampleCalendar = () => `https://edt.univ-tlse3.fr/icalfeed/ical/XXXXXXXXXXXXXX/schedule.ics`
export const validCalendarURL = (url: string): boolean => /https:\/\/edt\.univ-tlse3\.fr\/icalfeed\/ical\/[A-Z0-9]{14}\/schedule\.ics/.test(url)

export const replyAndDelete = async(message: Message, content: string | MessagePayload | MessageCreateOptions, delay = 5000) => {
    const msg = await message.reply(content).catch(log4js.trace)
    if (msg) setTimeout(() => msg.deletable ? msg.delete().catch(() => {}) : null, delay);
}