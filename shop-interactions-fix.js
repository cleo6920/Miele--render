(function(){
'use strict';

function run(){
  // Diagnostics are opt-in and never affect normal shoppers.
  const debug=new URLSearchParams(location.search).get('shopdebug')==='1';
  if(debug){
    const box=document.createElement('div');
    box.id='shop-debug-status';
    box.style.cssText='position:fixed;bottom:85px;left:12px;right:12px;z-index:2147483647;background:#fff;color:#111;border:3px solid #b33;padding:12px;font:14px/1.4 Arial;max-height:45vh;overflow:auto;box-shadow:0 3px 18px #0006';
    box.textContent='DIAGNOSTICA SHOP ATTIVA · premi Scheda o Aggiungi';
    document.body.appendChild(box);
    const log=(message)=>{box.textContent+='\\n'+message;box.style.whiteSpace='pre-wrap';};
    window.addEventListener('error',e=>log('ERRORE: '+e.message));
    window.addEventListener('unhandledrejection',e=>log('PROMISE: '+String(e.reason)));
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-open-product],.add-btn,.product-detail-add,.product-openable[data-product-id]');
      if(!b)return;
      const isAdd=b.matches('.add-btn,.product-detail-add');
      log('CLICK '+(isAdd?'CARRELLO':'SCHEDA')+' '+(b.dataset.id||b.dataset.openProduct||b.dataset.productId||'')+' · funzioni: '+typeof addV2Product+'/'+typeof openProductDetail);
    },true);
  }
  // The shop currently binds product/cart clicks very late in its main script.
  // If any unrelated runtime code fails first, cards still render but all
  // product interactions remain inert. This delegated layer is intentionally
  // independent and runs last.
  document.addEventListener('click',function(e){
    const add=e.target.closest('.add-btn,.product-detail-add');
    if(add){
      e.preventDefault();
      e.stopImmediatePropagation();
      try{
        if(typeof addV2Product==='function'){
          addV2Product(add);
          if(add.classList.contains('product-detail-add') && typeof closeProductDetail==='function') closeProductDetail();
          return;
        }
      }catch(err){
        console.error('[Shop interactions] add failed',err);
      }
      return;
    }

    const direct=e.target.closest('[data-open-product]');
    if(direct){
      e.preventDefault();
      e.stopImmediatePropagation();
      try{
        if(typeof openProductDetail==='function'){
          openProductDetail(direct.dataset.openProduct);
          return;
        }
      }catch(err){
        console.error('[Shop interactions] detail failed',err);
      }
      return;
    }

    const card=e.target.closest('.product-openable[data-product-id]');
    if(card){
      // Do not hijack dedicated preview/action buttons.
      if(e.target.closest('button,a,input,select,textarea')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      try{
        if(typeof openProductDetail==='function'){
          openProductDetail(card.dataset.productId);
          return;
        }
      }catch(err){
        console.error('[Shop interactions] card failed',err);
      }
    }
  },true);

  document.addEventListener('keydown',function(e){
    if((e.key==='Enter'||e.key===' ') && document.activeElement?.matches('.product-openable[data-product-id]')){
      e.preventDefault();
      try{
        if(typeof openProductDetail==='function') openProductDetail(document.activeElement.dataset.productId);
      }catch(err){
        console.error('[Shop interactions] keyboard detail failed',err);
      }
    }
  },true);

  document.documentElement.dataset.shopInteractions='delegated-v1';
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
else run();
})();