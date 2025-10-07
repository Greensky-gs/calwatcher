import axios from "axios";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import ical from "node-ical";
import { calendarType, databaseEventType, eventType } from "./types/calendar";
import { notifyFullCourses, notifyModification } from "./calls/messages";
import { Database } from "./utils/database";
import { randomString } from "./utils/methods";
import { User } from "discord.js";

export class Watcher {
    private db: Database;
    private calendarURL: string;
    private executing: boolean = false;
    
    constructor(databasePath: string, calendarURL: string) {
        this.db = new Database(databasePath);
        this.calendarURL = calendarURL;
    }

    public get courses(): databaseEventType[] {
        return Object.values(this.db.cache)
    }

    public set url(url: string) {
        this.calendarURL = url;
    }
    
    private writeToTemp = (content: string): string => {
        const fileName = `./${randomString(16)}.ics`;
        writeFileSync(fileName, content);
        
        return fileName;
    }
    private deleteTemp = (fileName: string) => {
        if (existsSync(fileName)) {
            try {
                rmSync(fileName);
            } catch (err) {
                console.error(`Error while deleting file ${fileName}.`, err);
            }
        }
    }
    
    private compareEvents(a: databaseEventType, b: eventType): (keyof eventType)[] {
        const keys: (keyof eventType)[] = ["description", "location", "start", "end", 'summary'];
        
        const compareVariables = (a: number | string | string[], b: string | Date | string[]): boolean => {
            if (b instanceof Date) {
                return a === b.getTime();
            }
            if (Array.isArray(a) && Array.isArray(b)) {
                return a.length === b.length && a.every((val, index) => val === b[index]);
            }
            return a === b;
        }
        
        return keys.filter((key) => !compareVariables(a[key], b[key]));
    };

    private purgeDatabase() {
        const now = new Date().getTime();

        this.db.bulk()
        Object.entries(this.db.cache).forEach(([id, event]) => {
            if (event.end < now - 7 * 24 * 60 * 60 * 1000) {
                this.db.remove(id);
            }
        })
        this.db.bulkUpdate();
    }
    public async exec(user: User) {
        if (this.executing) return;
        this.executing = true;

        const response = await axios.get(this.calendarURL);
        
        const file = this.writeToTemp(response.data);
        
        const now = new Date();

        this.db.bulk()
        ical.parseFile(file, (err, data) => {
            if (err) throw err;
            const calendar = data as calendarType;
            if (!calendar) console.log("No calendar");
                        
            Object.entries(calendar)
            .filter(([k]) => k !== "vcalendar")
            .forEach(([id, event]: [string, eventType], i) => {
                if (this.db.exists(id)) {
                    const comparison = this.compareEvents(this.db.getEvent(id), event);
                    if (comparison.length > 0) {
                        notifyModification(this.db.getEvent(id), event, comparison, user);
                        this.db.update(id, event);
                    }
                }
                if (!this.db.exists(id)) {
                    this.db.add(id, event);
                    if (event.start.getTime() < now.getTime()) return;
                    notifyFullCourses([event], user);
                    return;
                }
            });

        });
        
        this.db.bulkUpdate();
        
        this.deleteTemp(file);
        this.purgeDatabase();

        this.executing = false;
    }
}
