import type {Row,Shot} from './data';
export const DATA_URL='https://raw.githubusercontent.com/hudl/open-data/master/data/';
export type Competition={competition_id:number;season_id:number;competition_name:string;season_name:string;competition_gender:string;country_name:string};
export type Match={match_id:number;match_date:string;home_team:{home_team_name:string};away_team:{away_team_name:string};home_score:number;away_score:number;competition:{competition_name:string};season:{season_name:string}};
type Named={id:number;name:string};
export type Event={id:string;period:number;timestamp:string;type:Named;player?:Named;team?:Named;position?:Named;location?:number[];tactics?:{lineup:{player:Named;position:Named}[]};substitution?:{replacement:Named};bad_behaviour?:{card:Named};foul_committed?:{card?:Named};shot?:{statsbomb_xg?:number;outcome:Named;type:Named};pass?:{outcome?:Named;goal_assist?:boolean;shot_assist?:boolean};duel?:{type:Named};dribble?:{outcome:Named};ball_recovery?:{recovery_failure?:boolean}};
export async function getData<T>(path:string,signal?:AbortSignal):Promise<T>{
 const response=await fetch(DATA_URL+path,{signal:signal?AbortSignal.any([signal,AbortSignal.timeout(30000)]):AbortSignal.timeout(30000),credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok)throw new Error(`StatsBomb data could not be loaded (${response.status}). Try again or select another match.`);
 const data=await response.json();if(!Array.isArray(data))throw new Error('Unexpected StatsBomb response. Please try again later.');return data as T;
}
const seconds=(s:string)=>s.split(':').reduce((n,v)=>n*60+Number(v),0);
export function normalizeMatch(events:Event[],match:Match):{rows:Row[];shots:Shot[]}{
 const active=events.filter(e=>e.period>=1&&e.period<=4);
 const duration=[1,2,3,4].map(period=>Math.max(0,...active.filter(e=>e.period===period).map(e=>seconds(e.timestamp))));
 const elapsed=(e:Event)=>duration.slice(0,e.period-1).reduce((a,b)=>a+b,0)+seconds(e.timestamp);
 const end=duration.reduce((a,b)=>a+b,0);
 const players=new Map<number,{row:Row;start:number;stop?:number}>();const shots:Shot[]=[];
 const enter=(player:Named,team:Named,position:string,start:number)=>{if(!players.has(player.id))players.set(player.id,{start,row:{id:`${match.match_id}-${player.id}`,player:player.name,team:team.name,position,competition:match.competition.competition_name,season:match.season.season_name,date:match.match_date,minutes:0,goals:0,assists:0,shots:0,xg:0,passes:0,completed:0,tackles:0,sot:0,npxg:0,key_passes:0,dribbles:0,carries:0,interceptions:0,recoveries:0,pressures:0}});};
 for(const e of active){
  if(e.type.name==='Starting XI'&&e.team)for(const p of e.tactics?.lineup||[])enter(p.player,e.team,p.position.name,0);
  if(e.type.name==='Substitution'&&e.team&&e.player&&e.substitution){const outgoing=players.get(e.player.id);if(outgoing)outgoing.stop=elapsed(e);enter(e.substitution.replacement,e.team,e.position?.name||'Substitute',elapsed(e));}
  if(!e.player)continue;const p=players.get(e.player.id);if(!p)continue;const r=p.row;
  const card=e.bad_behaviour?.card?.name||e.foul_committed?.card?.name;if(card==='Red Card'||card==='Second Yellow')p.stop=elapsed(e);
  if(e.type.name==='Shot'&&e.shot){r.shots!++;const xg=e.shot.statsbomb_xg;if(typeof xg==='number'&&Number.isFinite(xg)){if(r.xg!==null)r.xg+=xg;if(e.shot.type.name!=='Penalty'&&r.npxg!==null)r.npxg!+=xg;}else{r.xg=null;if(e.shot.type.name!=='Penalty')r.npxg=null;}
   const goal=e.shot.outcome.name==='Goal';if(goal)r.goals!++;if(['Goal','Saved','Saved to Post'].includes(e.shot.outcome.name))r.sot!++;
   if(e.location?.length===2&&typeof xg==='number')shots.push({rowId:r.id,x:e.location[0],y:e.location[1],xg,goal});
  }
  if(e.type.name==='Pass'&&e.pass){r.passes!++;if(!e.pass.outcome)r.completed!++;if(e.pass.goal_assist)r.assists!++;if(e.pass.shot_assist)r.key_passes!++;}
  if(e.type.name==='Duel'&&e.duel?.type.name==='Tackle')r.tackles!++;
  if(e.type.name==='Dribble'&&e.dribble?.outcome.name==='Complete')r.dribbles!++;
  if(e.type.name==='Carry')r.carries!++;
  if(e.type.name==='Interception')r.interceptions!++;
  if(e.type.name==='Ball Recovery'&&!e.ball_recovery?.recovery_failure)r.recoveries!++;
  if(e.type.name==='Pressure')r.pressures!++;
 }
 const rows=[...players.values()].map(p=>({...p.row,minutes:Math.max(0,(p.stop??end)-p.start)/60}));
 if(!rows.length)throw new Error('This match has no supported starting-lineup events. Select another match.');
 return {rows,shots};
}
