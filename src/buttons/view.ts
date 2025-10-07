import { ButtonHandler, log4js } from "amethystjs";
import { ButtonIds } from "../types/core";
import { manager } from "../cache/managers";

export default new ButtonHandler({
    customId: ButtonIds.ViewState
}).setRun(async({ button }) => {
    if (!manager.registered(button.user.id)) return button.reply({
        content: `❌ | Vous n'êtes actuellement **pas inscrit(e)**.`,
        flags: ['Ephemeral']
    }).catch(log4js.trace);

    const state = manager.getData(button.user.id);
    button.reply({
        content: `🔗 | Votre lien de calendrier est actuellement ${state.url}`,
        flags: ['Ephemeral']
    }).catch(log4js.trace);
})