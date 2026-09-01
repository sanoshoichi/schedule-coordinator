export const MARKS=Object.freeze([null,'circle','triangle','cross']);export const SYMBOLS=Object.freeze({circle:'○',triangle:'△',cross:'×'});
export function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(`${value}T00:00:00Z`))}
export function normalizeName(value){return String(value??'').trim().replace(/\s+/g,' ').slice(0,40)}
export function parseDates(value){return[...new Set(String(value).split(/\r?\n|,/).map(v=>v.trim()).filter(validDate))].sort()}
export function buildSlots(dates,startHour,endHour){if(!Number.isInteger(startHour)||!Number.isInteger(endHour)||startHour<0||endHour>23||startHour>endHour)return[];return dates.flatMap(date=>Array.from({length:endHour-startHour+1},(_,i)=>`${date}T${String(startHour+i).padStart(2,'0')}:00`))}
export function nextMark(mark){return MARKS[(MARKS.indexOf(mark)+1)%MARKS.length]}
export function normalizeHourRange(first,second){const a=Math.max(0,Math.min(23,Math.trunc(first))),b=Math.max(0,Math.min(23,Math.trunc(second)));return{start:Math.min(a,b),end:Math.max(a,b)}}
export function validateAvailability(value,allowedSlots){if(!value||typeof value!=='object'||Array.isArray(value))return false;const allowed=new Set(allowedSlots);return Object.entries(value).every(([slot,mark])=>allowed.has(slot)&&MARKS.includes(mark)&&mark!==null)}
