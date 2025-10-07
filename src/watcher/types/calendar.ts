export type eventType = {
    type: string;
    params: string[];
    location: string;
    start: Date;
    datetype: 'date-time';
    end: Date;
    uid: string;
    dtsamp: Date;
    summary: string;
    description: string;
    sequence: string;
    method: string;
}

export type databaseEventType = {
    start: number;
    end: number;
    dtsamp: number;
} & Omit<eventType, 'start' | 'end' | 'dtsamp'>;

export type vcalendarType = {
    type: 'VCALENDAR';
    prodid: string;
    version: string;
    metho: string;
    'WR-CALNAME': string;
    'PUBLISHED-TTL': string;
}

export type calendarType = Record<string, eventType> & { vcalendar: vcalendarType };