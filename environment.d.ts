declare global {
    namespace NodeJS {
        interface ProcessEnv {
            webhookURL: string;
            calendarURL: string;
            token: string;
        }
    }
}

export {};
