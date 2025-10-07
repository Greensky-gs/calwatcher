import { handlerTrio } from "../types/handler";
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { Watcher } from "../watcher/entry";
import { AmethystClient, log4js } from "amethystjs";

class HandlerDatabase {
    private dbPath: string;
    private cache: Record<string, string> = {};

    constructor(dbPath: string) {
        this.dbPath = dbPath;

        this.init()
        this.load()
    }

    public exists(id: string) {
        return !!this.cache[id]
    }
    public getUser(id: string) {
        return this.exists(id) ? [id, this.cache[id]] : null
    }
    public setUser(id: string, url: string) {
        this.cache[id] = url;
        this.save()
    }
    public deleteUser(id: string) {
        if (this.exists(id)) {
            delete this.cache[id];
            this.save()
            return true;
        }
        return false
    }

    public get all(): [string, string][] {
        return Object.entries(this.cache);
    }

    private save() {
        writeFileSync(this.dbPath, JSON.stringify(this.cache));
    }
    private load() {
        this.cache = JSON.parse(readFileSync(this.dbPath, 'utf-8'));
    }
    private init() {
        if (!existsSync('./database')) mkdirSync('./database');
        if (!existsSync(this.dbPath)) {
            writeFileSync(this.dbPath, JSON.stringify({}));
        }
    }
}

export class Handler {
    private cache: Record<string, handlerTrio> = {};
    private db: HandlerDatabase;
    private started = false;
    // private interval = 600000;
    private interval = 60000;
    private client: AmethystClient;

    constructor() {
        this.db = new HandlerDatabase('./database/handlers.json');

        this.init();
    }
    public setClient(client: AmethystClient) {
        this.client = client;
    }

    public get size() {
        return Object.values(this.cache).length;
    }
    public registered(id: string) {
        return !!this.cache[id];
    }
    public register(id: string, url: string) {
        if (this.registered(id)) return false;
        
        const watcher = this.createWatcher(id, url);
        this.cache[id] = { user: id, url, watcher };
        this.db.setUser(id, url);

        return true;
    }
    public unregister(id: string) {
        if (!this.registered(id)) return false;
        
        delete this.cache[id];
        this.db.deleteUser(id);

        return true
    }
    public update(id: string, url: string) {
        if (!this.registered(id)) return false;

        this.cache[id].url = url;
        this.cache[id].watcher.url = url;
        this.db.setUser(id, url);
        return true;
    }

    public start() {
        if (this.started) return;
        this.started = true
        
        this.exec();
    }
    public getData(id: string) {
        if (!this.registered(id)) return null;
        return this.cache[id];
    }

    private exec() {
        Object.values(this.cache).forEach(async({ user, watcher, url }, index, array) => {

            setTimeout(async() => {
                const fetched = this.client.users.cache.get(user) ?? await this.client.users.fetch(user).catch(log4js.trace);
                if (!fetched) return;
                watcher.exec(fetched).catch(log4js.trace);
            }, this.interval * index / array.length);
        })

        setTimeout(this.exec.bind(this), this.interval);
    }

    private createWatcher(user: string, url: string) {
        return new Watcher(`${user}.json`, url);
    }
    private init() {
        this.db.all.forEach(([user, url]) => {
            this.cache[user] = {
                user,
                url,
                watcher: this.createWatcher(user, url)
            }
        })
    }
}