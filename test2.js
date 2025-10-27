#!/usr/bin/env node

const si = require('systeminformation');

(async ()=>{

    
    
    console.log(await si.mem());
    console.log(await si.mem());
    console.log(await si.mem());
    
})();