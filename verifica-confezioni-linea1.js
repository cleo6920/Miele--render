'use strict';
// Catalogo produzione Linea 1: nessun ordine o scorta viene modificato.
// Eseguire: node verifica-confezioni-linea1.js
const stock={millefiori:43,fragola:26,melone:5,castagne:2,caffe:13,limoncello:1,favo:2,acacia40:9,castagno:2,zenzero:3,eucalipto:3,balsamico:2,agrumi500:2,sulla500:2,castagno500:2};
const recipes=[
{id:'B01',qty:12,parts:['millefiori','fragola'],price:13.90},
{id:'B02',qty:4,parts:['millefiori','caffe'],price:13.90},
{id:'B03',qty:2,parts:['millefiori','castagne'],price:13.90},
{id:'B04',qty:1,parts:['agrumi500','sulla500'],price:22.90,status:'da-acquistare'},
{id:'B05',qty:1,parts:['agrumi500','castagno500'],price:22.90,status:'da-acquistare'},
{id:'B06',qty:1,parts:['sulla500','castagno500'],price:22.90,status:'da-acquistare'},
{id:'T01',qty:9,parts:['millefiori','fragola','caffe'],price:20.90},
{id:'T02',qty:5,parts:['millefiori','fragola','melone'],price:20.90},
{id:'T03',qty:1,parts:['millefiori','limoncello','favo'],price:26.90},
{id:'T04',qty:1,parts:['millefiori','acacia40','favo'],price:22.90},
{id:'T05',qty:2,parts:['millefiori','acacia40','castagno'],price:17.90},
{id:'T06',qty:3,parts:['millefiori','acacia40','zenzero'],price:18.90},
{id:'T07',qty:2,parts:['millefiori','acacia40','eucalipto'],price:17.90},
{id:'T08',qty:1,parts:['millefiori','acacia40','balsamico'],price:22.90},
{id:'T09',qty:1,parts:['millefiori','eucalipto','balsamico'],price:26.90}
];
function validate(){
 const used=Object.fromEntries(Object.keys(stock).map(k=>[k,0]));
 const errors=[];
 for(const x of recipes){if(!/^([BT])\d{2}$/.test(x.id)) errors.push('Codice invalido '+x.id);
 if(x.parts.length!==(x.id[0]==='B'?2:3))errors.push('Numero prodotti errato '+x.id);
 if(x.parts.some(p=>p.endsWith('500'))&&x.id[0]!=='B')errors.push('500 g solo Bis '+x.id);
 for(const id of x.parts){if(!(id in stock))errors.push('Prodotto ignoto '+id);else used[id]+=x.qty;}}
 for(const [id,count] of Object.entries(used))if(count!==stock[id])errors.push(id+': utilizzati '+count+' anziche '+stock[id]);
 return {errors,used,totalUnits:Object.values(stock).reduce((a,b)=>a+b,0),totalPackages:recipes.reduce((a,b)=>a+b.qty,0)};
}
const result=validate();
if(result.errors.length){console.error(result.errors.join('\n'));process.exitCode=1}
else console.log('OK: '+result.totalPackages+' confezioni, '+result.totalUnits+' prodotti, scorte residue zero (previste; nessuno scarico fisico).');
module.exports={stock,recipes,validate};
