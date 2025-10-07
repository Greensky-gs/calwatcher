import axios from 'axios';
import { databaseEventType, eventType } from '../types/calendar';
import { User } from 'discord.js';
import { log4js } from 'amethystjs';


export const determineColor = (ev: eventType): number => {
    const colors = {
        td: "#FF8080",
        cm: "#8080FF",
        tp: "#408080",
        courstd: "#7D4F72",
        conference: "#00FF00",
        cc: "#808000",
        default: '#be0aa6'
    }

    const determineColorKey = (ev: eventType) => [['TD', 'td'], ['TP', 'tp'], ['COURS/TD', 'courstd'], ['Cours', 'cm'], ['Conférence', 'conference'], ['Contrôle Continu', 'cc']].find(([key, value]) => ev.summary.includes(key))?.[1] ?? 'default';

    return parseInt(colors[determineColorKey(ev)].replace('#', ''), 16);
}
export const thumbnailURL = (color: number) => {
    const red = (color >> 16) & 0xFF;
    const green = (color >> 8) & 0xFF;
    const blue = color & 0xFF;

    return `https://php-noise.com/noise.php?r=${red}&g=${green}&b=${blue}&hex=&tiles=&tileSize=10&borderWidth=&mode=brightness&multi=3&steps=10`

}

export const notifyFullCourses = async(events: eventType[], user: User) => {
    const content = {
        content: `ℹ️ | Nouveau cours`,
        embeds: events.map((event) => ({
            title: event.summary,
            description: event.description,
            fields: [
                {
                    name: 'Début',
                    value: event.start.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }),
                    inline: true
                },
                {
                    name: 'Fin',
                    value: event.end.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }),
                    inline: true
                },
                {
                    name: 'Salle',
                    value: event.location ?? 'N/A',
                    inline: false
                }
            ],
            color: determineColor(event),
            thumbnail: {
                url: thumbnailURL(determineColor(event))
            }
        }))
    }
    // axios.post(process.env.webhookURL, content).catch(() => {});
    user.send(content).catch(log4js.trace);
}
export const notifyModification = (oldEvent: databaseEventType, event: eventType, changes: (keyof eventType)[], user: User) => {
    const translateFields: Record<keyof eventType, string> = {
        datetype: 'Type de date',
        description: 'Description',
        end: 'Fin',
        location: 'Lieu',
        method: 'Méthode',
        params: 'Paramètres',
        sequence: 'Séquence',
        start: 'Début',
        summary: 'Résumé',
        type: 'Type',
        uid: 'UID',
        dtsamp: 'Date d\'échantillonnage',
    }

    const content = {
        content: '⚠️ | Cours modifié',
        embeds: [
            {
                title: event.summary,
                description: event.description,
                fields: changes.map(change => ({
                    name: translateFields[change],
                    value: `~~${change === 'start' || change === 'end' ? (new Date(oldEvent[change])).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }) : oldEvent[change]}~~ \n**${change === 'start' || change === 'end' ? event[change].toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }) : event[change]}**` || 'N/A' ,
                    inline: false
                })),
                color: determineColor(event),
                thumbnail: {
                    url: thumbnailURL(determineColor(event))
                }
            }
        ]
    }

    // axios.post(process.env.webhookURL, content).catch(() => {});
    user.send(content).catch(log4js.trace);
}