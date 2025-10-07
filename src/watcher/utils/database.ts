import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import { calendarType, databaseEventType, eventType } from '../types/calendar';

export class Database {
    private path: string = "data.json";
    private _cache: Record<string, databaseEventType> = {};
    private bulking = false;

    constructor(path: string) {
        this.path = `./database/${path}`;
        this.init();
    }

    public bulk() {
        this.bulking = true;
    }
    public bulkUpdate() {
        this.bulking = false;
        this.write();
    }
    public remove(id: string) {
        if (this.exists(id)) delete this._cache[id];
        this.write();
    }

    public static toEventType(dbEvent: databaseEventType): eventType {
        return {
            ...dbEvent,
            start: new Date(dbEvent.start),
            end: new Date(dbEvent.end),
            dtsamp: new Date(dbEvent.dtsamp),
        }
    }
    public static toDatabaseEvent(event: eventType): databaseEventType {
        return {
            ...event,
            start: event.start?.getTime?.(),
            end: event.end?.getTime?.(),
            dtsamp: event.dtsamp?.getTime?.(),
        }
    }

    public getEvent(key: string): databaseEventType {
        return this._cache[key];
    }
    public exists(key: string) {
        return !!this._cache[key];
    } 

    public add(key: string, value: eventType) {
        if (this.exists(key)) return;
        this._cache[key] = Database.toDatabaseEvent(value);

        this.write();
    }
    public update(key: string, value: eventType) {
        if (!this.exists(key)) return;
        this._cache[key] = Database.toDatabaseEvent(value);
        
        this.write()
    }

    public get cache() {
        return Object.fromEntries(Object.entries(this._cache))
    }

    private init() {
        if (!existsSync(this.path)) {
            writeFileSync(this.path, '{}');
        }
        this._cache = JSON.parse(readFileSync(this.path, 'utf-8')) as Record<string, databaseEventType>;
    }
    private write() {
        if (!existsSync('./database')) {
            mkdirSync('./database');
        }
        if (!existsSync(this.path)) {
            writeFileSync(this.path, '{}');
        }
        if (this.bulking) return;
        writeFileSync(this.path, JSON.stringify(this._cache));
    }
}