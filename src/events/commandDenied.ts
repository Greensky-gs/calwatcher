import { AmethystEvent, commandDeniedCode, log4js } from "amethystjs";
import { PreconditionCodes } from "../types/errors";
import { replyAndDelete } from "../utils/toolbox";

export default new AmethystEvent('commandDenied', ({ message, type, user }, reason) => {
    if (type != 'message') return;

    if (reason.metadata?.silent) return;

    if (reason.metadata?.code === PreconditionCodes.Registered) return replyAndDelete(message, `❌ | Cette commande n'est utilisable que lorsque vous n'êtes pas enregistré(e).`);
    if (reason.metadata?.code === PreconditionCodes.NotRegistered) return replyAndDelete(message, `❌ | Vous devez être enregistré(e) pour utiliser cette commande.`);

    if (reason.metadata?.code === commandDeniedCode.GuildOnly) return message.reply("❌ | Cette commande n'est utilisable que dans un serveur.").catch(log4js.trace);
    if (reason.metadata?.code === commandDeniedCode.ClientMissingPerms) return replyAndDelete(message, `❌ | Je n'ai pas les permissions nécessaires pour exécuter cette commande.`)
    if (reason.metadata?.code === commandDeniedCode.UserMissingPerms) return replyAndDelete(message, `❌ | Vous n'avez pas les permissions nécessaires pour exécuter cette commande.`)
    if (reason.metadata?.code === commandDeniedCode.UnderCooldown) return replyAndDelete(message, ` ❌ | Veuillez patienter **${Math.ceil(reason.metadata.remainingCooldownTime / 1000)}s** avant de pouvoir réutiliser cette commande à nouveau.`);
})