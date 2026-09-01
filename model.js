// 参加可否は同じ順序で循環させ、画面と検証処理で共通利用する。
export const MARKS=Object.freeze([null,'circle','triangle','cross']);export const SYMBOLS=Object.freeze({circle:'○',triangle:'△',cross:'×'});
export function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(`${value}T00:00:00Z`))}
export function normalizeName(value){return String(value??'').trim().replace(/\s+/g,' ').slice(0,40)}
export function parseDates(value){return[...new Set(String(value).split(/\r?\n|,/).map(v=>v.trim()).filter(validDate))].sort()}
// 終了時刻の時間枠も回答対象に含める。例: 9〜11時なら9時、10時、11時の3枠。
export function buildSlots(dates,startHour,endHour){if(!Number.isInteger(startHour)||!Number.isInteger(endHour)||startHour<0||endHour>23||startHour>endHour)return[];return dates.flatMap(date=>Array.from({length:endHour-startHour+1},(_,i)=>`${date}T${String(startHour+i).padStart(2,'0')}:00`))}
export function nextMark(mark){return MARKS[(MARKS.indexOf(mark)+1)%MARKS.length]}
// どちらを先に選んでも時系列順の範囲として扱い、時刻は一日の範囲に収める。
export function normalizeHourRange(first,second){const a=Math.max(0,Math.min(23,Math.trunc(first))),b=Math.max(0,Math.min(23,Math.trunc(second)));return{start:Math.min(a,b),end:Math.max(a,b)}}
// 壊れた一覧要素を画面へ渡さず、更新日時が新しい予定から表示する。
export function normalizeScheduleSummaries(value){if(!Array.isArray(value))return[];return value.filter(item=>item&&/^[a-z0-9-]{1,50}$/.test(item.slug)&&typeof item.title==='string').sort((a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||'')))}
// 画面側だけに頼らず、送信前にも未知の時間枠や記号を排除する。
export function validateAvailability(value,allowedSlots){if(!value||typeof value!=='object'||Array.isArray(value))return false;const allowed=new Set(allowedSlots);return Object.entries(value).every(([slot,mark])=>allowed.has(slot)&&MARKS.includes(mark)&&mark!==null)}
