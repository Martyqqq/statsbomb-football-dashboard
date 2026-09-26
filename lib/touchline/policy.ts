export type SourcePolicy={id:'local'|'statsbomb';name:string;enabled:boolean;rawExport:boolean;chartExport:boolean;attribution:string;reason?:string};
export const policies:Record<SourcePolicy['id'],SourcePolicy>={
 local:{id:'local',name:'Local CSV',enabled:true,rawExport:true,chartExport:true,attribution:'User-supplied CSV • Rights declared by uploader'},
 statsbomb:{id:'statsbomb',name:'StatsBomb Open Data',enabled:true,rawExport:false,chartExport:true,attribution:'Data: StatsBomb • Independent noncommercial research',reason:'StatsBomb match analysis is enabled. Keep the official logo on published analysis. Underlying StatsBomb data cannot be exported as CSV here.'}
};
export function requireExport(source:SourcePolicy['id'],kind:'raw'|'chart'){const p=policies[source];if(!p.enabled||!(kind==='raw'?p.rawExport:p.chartExport))throw new Error(p.reason||'This source does not permit this export in the current application.');}
