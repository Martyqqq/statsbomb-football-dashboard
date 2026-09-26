'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';
import {Button} from '@/components/ui/button';
const ThemeContext=createContext({dark:false,toggle:()=>{}});
export function ThemeProvider({children}:{children:React.ReactNode}){
 const [dark,setDark]=useState(false);
 useEffect(()=>{let value=false;try{const saved=localStorage.getItem('touchline-theme');value=saved?saved==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;}catch{value=window.matchMedia('(prefers-color-scheme: dark)').matches;}setDark(value);document.documentElement.dataset.theme=value?'dark':'light';},[]);
 const toggle=()=>setDark(current=>{const next=!current;document.documentElement.dataset.theme=next?'dark':'light';try{localStorage.setItem('touchline-theme',next?'dark':'light');}catch{}return next;});
 return <ThemeContext.Provider value={{dark,toggle}}>{children}</ThemeContext.Provider>;
}
export const useTheme=()=>useContext(ThemeContext);
export function ThemeToggle(){const {dark,toggle}=useTheme();return <Button variant="outline" className="theme-toggle" aria-label={`Switch to ${dark?'light':'dark'} mode`} title={`Switch to ${dark?'light':'dark'} mode`} onClick={toggle}>{dark?<Sun/>:<Moon/>}<span>{dark?'Light':'Dark'} mode</span></Button>;}
