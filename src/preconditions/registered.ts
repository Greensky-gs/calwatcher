import { Precondition } from "amethystjs";
import { manager } from "../cache/managers";
import { PreconditionCodes } from "../types/errors";

export default new Precondition('registered').setMessageRun(({ message, }) => {
    if (!manager.registered(message.author.id)) {
        return {
            ok: false,
            type: 'message',
            channelMessage: message,
            metadata: {
                silent: false,
                code: PreconditionCodes.NotRegistered
            }
        }
    }
    return {
        ok: true,
        type: 'message',
        channelMessage: message
    }
})