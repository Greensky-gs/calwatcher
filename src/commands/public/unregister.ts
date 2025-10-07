import { AmethystCommand, preconditions } from "amethystjs";
import registered from "../../preconditions/registered";
import { manager } from "../../cache/managers";

export default new AmethystCommand({
    name: 'déregistrer',
    description: "Désinscrire son calendrier",
    preconditions: [preconditions.GuildOnly, registered],
    aliases: ['deregistrer', 'unregister', 'unsubcribe', 'désinscrire']
}).setMessageRun(({ message }) => {
    manager.unregister(message.author.id)

    return message.reply("✅ | Vous êtes désormais désinscrit(e) !").catch(console.error);
})