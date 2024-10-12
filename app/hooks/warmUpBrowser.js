import React from 'react'
import * as webBrowser from "expo-web-browser";

export const useWarmUpBrowser= ()=> {
    React.useEffect(()=>{
        void webBrowser.warmUpAsync();
        return ()=>{
            void webBrowser.coolDownAsync();

        }
    })
}