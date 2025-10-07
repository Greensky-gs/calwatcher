import { loadImage, createCanvas } from 'canvas';
import { databaseEventType } from '../watcher/types/calendar';

const determineColor = (ev: databaseEventType) => {
    const colors = {
        td: "#FF8080",
        cm: "#8080FF",
        tp: "#408080",
        courstd: "#7D4F72",
        conference: "#00FF00",
        cc: "#808000",
        default: '#be0aa6'
    }
    
    const determineColorKey = (ev) => [['TD', 'td'], ['TP', 'tp'], ['COURS/TD', 'courstd'], ['Cours', 'cm'], ['Conférence', 'conference'], ['Contrôle Continu', 'cc']].find(([key, value]) => ev.summary.includes(key))?.[1] ?? 'default';
    
    return colors[determineColorKey(ev)];
}

const resize = (str: string, limit = 100) => str.length <= limit ? str : str.slice(0, limit - 3) + '...';


export const drawEdt = async(data: databaseEventType[]) => {
    const back = await loadImage('./assets/back.png')
    const canvas = createCanvas(back.width, back.height);
    
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(back, 0, 0, back.width, back.height)
    
    const now = new Date();
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1);
    const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 7);
    sunday.setHours(23, 59, 59, 999);
    
    // Write days in the bar
    const origin = [167, 11]
    ctx.fillStyle = '#337ab7';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '20px Arial'
    
    const names = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
    for (let i = 0; i < 7; i++) {
        ctx.fillStyle = '#337ab7';
        
        const day = new Date(monday.getTime() + i * 86400000);
        const x = origin[0] + i * 209;
        ctx.fillText(`${names[i]}. ${day.getDate()}/${day.getMonth() + 1}`, x, origin[1]);
        
        if (now.getDate() === day.getDate()) {
            const height = 749
            const width = 209
            
            const startX = 63
            const startY = 22
            
            ctx.fillStyle='#faf3d2ff'
            // Change opacity
            ctx.globalAlpha = 0.6;
            
            ctx.fillRect(startX + i * width, startY, width - 1, height)
            ctx.globalAlpha = 1.0;
        }
    }
    
    
    const courses = data.filter(c => c.start >= monday.getTime() && c.end <= sunday.getTime());
    
    const startX = 64
    const size = 210
    const width = 205
    
    const startY = 68
    const endY = 770
    
    courses.forEach((ev) => {
        const date = new Date(ev.start);
        const endDate = new Date(ev.end);
        const dayIndex = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
        const dayStartMinutes = 7 * 60;
        
        const color = determineColor(ev);
        ctx.fillStyle = color;
        
        // Scale ev.start and ev.end to fix into startY and endY
        const minutes = (date.getHours() * 60) + date.getMinutes();
        const totalMinutes = 16 * 60
        const y = (minutes / totalMinutes) * (endY - startY) - dayStartMinutes * (endY - startY) / totalMinutes + startY;
        const endMinutes = (endDate.getHours() * 60) + endDate.getMinutes();
        const endYPos = (endMinutes / totalMinutes) * (endY - startY) - dayStartMinutes * (endY - startY) / totalMinutes + startY;
        const height = endYPos - y - 1;
        const x = startX + dayIndex * size;
        
        // Draw border to the rectangle
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = '11px Arial'
        const regex = /; ((COURS\/TD)|(TD)|(TP)|(COURS))/gi
        const coursType = ((x) => x.length > 0 ? ' - ' + x : '')(regex.exec(ev.summary)?.[1] ?? '');
        const timeIndic = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} - ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
        const text = `${timeIndic}${coursType}\n${resize(ev.summary.replace(regex, ''), 43)}\n${ev.location}`;
        
        ctx.fillText(text, x + 5, y + 5, width - 10);
        
    })
    
    // Load to output.png
    const buffer = canvas.toBuffer('image/png');
    return buffer
}