import { AmethystCommand, log4js, preconditions } from "amethystjs";
import registered from "../../preconditions/registered";
import { manager } from "../../cache/managers";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { ButtonIds } from "../../types/core";

export default new AmethystCommand({
    name: 'état',
    description: "Affiche l'état de votre inscription",
    aliases: ['state', 'status', 'statut', 'consulter']
}).setMessageRun(({ message }) => {
    const registered = manager.registered(message.author.id);
    const button = new ButtonBuilder()
        .setCustomId(ButtonIds.ViewState)
        .setStyle(ButtonStyle.Primary)
        .setLabel('Voir mon lien')
    
    message.reply({
        content: registered ? "✅ | Vous êtes actuellement **inscrit(e)**." : "❌ | Vous n'êtes actuellement **pas inscrit(e)**.",
        components: registered ? [new ActionRowBuilder<ButtonBuilder>().setComponents(button)] : []
    }).catch(log4js.trace)
})