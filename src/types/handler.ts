import { Watcher } from "../watcher/entry";

export type handlerTrio = {
    user: string;
    watcher: Watcher;
    url: string;
}