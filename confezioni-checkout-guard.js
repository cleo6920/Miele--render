'use strict';
// Server-authoritative guard for draft gift bundles. Does not start a payment.
// No stock is decremented and no payment endpoint is modified by this file.
const fs=require('fs');const path=require('path');
const importData=JSON.parse(fs.readFileSync(path.join(__dirname,'confezioni-linea1-import.json'),'utf8'));
const publishedData=JSON.parse(fs.readFileSync(path.join(__dirname,'confezioni-regalo-catalogo.json'),'utf8'));
const byCode=new Map(importData.recipes.map(x=>[x.code,x]));
const byId=new Map(publishedData.packages.map(x=>[x.id,x]));
function euroCents(value){if(typeof value!=='number'||!Number.isFinite(value)||value<=0)throw Error('Invalid server unit price');return Math.round(value*100);}
function serverGiftQuote(code,quantity){
 if(!Number.isInteger(quantity)||quantity<1||quantity>100)throw Error('Invalid package quantity');
 const gift=byId.get(code);
 if(gift){if(!gift.published||gift.purchaseStatus!=='enabled'||gift.stockStatus!=='confirmed')throw Error('Gift box not released for sale');return {code,quantity,unitPriceCents:euroCents(gift.price),totalCents:euroCents(gift.price)*quantity,beePoints:gift.beePoints*quantity};}
 const planned=byCode.get(code);
 if(planned){throw Error('Gift model has not been published: '+code);}
 throw Error('Unknown gift package code');
}
// Reject attempts to use a browser-supplied price; use only serverGiftQuote's price.
module.exports={serverGiftQuote};
