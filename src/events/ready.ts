import { AmethystClient, AmethystEvent, DebugImportance } from "amethystjs";
import { manager } from "../cache/managers";


export default new AmethystEvent('ready', (client) => {
    client.debug(`${manager.size} calendars are being watched.`, DebugImportance.Information)

    manager.setClient(client as AmethystClient);
    manager.start();
})