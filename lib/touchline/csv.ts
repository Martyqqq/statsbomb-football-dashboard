import type {Row} from './data';
export const columns=['player','team','position','competition','season','date','minutes','goals','assists','shots','xg','passes','completed','tackles','sot','npxg','key_passes','dribbles','carries','interceptions','recoveries','pressures'];
export function parseCSV(text:string):Row[]{
 if(text.length>5_000_000)throw new Error('Use a CSV smaller than 5 MB.');
 const matrix:string[][]=[];let line:string[]=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else if(!quoted&&field!=='')throw new Error('Unexpected quote in CSV.');else quoted=!quoted;}else if(c===','&&!quoted){line.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;line.push(field);if(line.some(x=>x.trim()))matrix.push(line);line=[];field='';}else field+=c;}
 if(quoted)throw new Error('Unclosed quote in CSV.');line.push(field);if(line.some(x=>x.trim()))matrix.push(line);
 const header=matrix.shift()?.map(s=>s.trim().replace(/^\uFEFF/,'').toLowerCase())||[];
 if(new Set(header).size!==header.length)throw new Error('CSV has duplicate column names.');
 const required=columns.slice(0,7);for(const k of required)if(!header.includes(k))throw new Error(`Missing required column: ${k}. Download the template for the expected format.`);
 if(!matrix.length||matrix.length>10000)throw new Error('Import between 1 and 10,000 rows.');
 const seen=new Set<string>();return matrix.map((cells,i)=>{if(cells.length!==header.length)throw new Error(`Row ${i+2}: column count does not match the header.`);const obj=Object.fromEntries(header.map((h,j)=>[h,cells[j]?.trim()||'']));
 for(const k of required.slice(0,6))if(!obj[k]||obj[k].length>100)throw new Error(`Row ${i+2}: ${k} must contain 1–100 characters.`);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(obj.date)||!Number.isFinite(Date.parse(obj.date))||new Date(obj.date).toISOString().slice(0,10)!==obj.date)throw new Error(`Row ${i+2}: date must be a valid YYYY-MM-DD date.`);
 const r:Record<string,unknown>={id:`upload-${i}`,...Object.fromEntries(required.slice(0,6).map(k=>[k,obj[k]]))};
 for(const k of columns.slice(6)){const raw=obj[k];const n=raw===undefined||raw===''?null:Number(raw);if(k==='minutes'&&n===null)throw new Error(`Row ${i+2}: minutes is required.`);if(n!==null&&(!Number.isFinite(n)||n<0||(!['xg','npxg','minutes'].includes(k)&&!Number.isInteger(n))))throw new Error(`Row ${i+2}: invalid ${k}. Use nonnegative ${['xg','npxg','minutes'].includes(k)?'numbers':'integers'}.`);r[k]=n;}
 if(Number(r.minutes)>160)throw new Error(`Row ${i+2}: minutes exceeds 160. Use one player-match per row.`);
 if(r.completed!==null&&r.passes!==null&&Number(r.completed)>Number(r.passes))throw new Error(`Row ${i+2}: completed passes exceeds attempts.`);
 if(r.goals!==null&&r.shots!==null&&Number(r.goals)>Number(r.shots))throw new Error(`Row ${i+2}: goals exceeds shots.`);
 const key=[r.competition,r.season,r.date,r.team,r.player].join('|');if(seen.has(key))throw new Error(`Row ${i+2}: duplicate player-match. Merge duplicate entries before importing.`);seen.add(key);return r as Row;});
}
export function csvCell(v:unknown){let s=v==null?'':String(v);if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export function csv(rows:unknown[][]){return rows.map(r=>r.map(csvCell).join(',')).join('\r\n');}
export function download(content:BlobPart,name:string,type:string){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}
