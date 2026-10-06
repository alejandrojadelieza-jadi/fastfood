/* ===== PRODUCT DATA: edit names, prices, images (kw = image keyword used to find the photo) ===== */
const CATS = ['Chicken','Burgers','Pasta & Meals','Sides','Desserts','Drinks'];
const PRODUCTS = [
 {id:1, cat:'Chicken', name:'1-pc Fried Chicken', price:99, kw:'fried,chicken'},
 {id:2, cat:'Chicken', name:'2-pc Fried Chicken', price:175, kw:'fried,chicken,plate'},
 {id:3, cat:'Chicken', name:'Spicy Chicken Wings', price:149, kw:'chicken,wings'},
 {id:4, cat:'Burgers', name:'Champ Burger', price:120, kw:'cheeseburger'},
 {id:5, cat:'Burgers', name:'Double Cheeseburger', price:155, kw:'double,cheeseburger'},
 {id:6, cat:'Burgers', name:'Chicken Sandwich', price:110, kw:'chicken,sandwich'},
 {id:7, cat:'Pasta & Meals', name:'Spaghetti', price:85, kw:'spaghetti'},
 {id:8, cat:'Pasta & Meals', name:'Chicken Rice Meal', price:130, kw:'chicken,rice'},
 {id:9, cat:'Pasta & Meals', name:'Carbonara', price:105, kw:'carbonara'},
 {id:10,cat:'Sides', name:'French Fries', price:65, kw:'french,fries'},
 {id:11,cat:'Sides', name:'Onion Rings', price:70, kw:'onion,rings'},
 {id:12,cat:'Sides', name:'Steamed Rice', price:30, kw:'steamed,rice'},
 {id:13,cat:'Desserts', name:'Peach Mango Pie', price:50, kw:'mango,pie'},
 {id:14,cat:'Desserts', name:'Chocolate Sundae', price:55, kw:'chocolate,sundae'},
 {id:15,cat:'Desserts', name:'Halo-Halo', price:95, kw:'halo,halo,dessert'},
 {id:16,cat:'Drinks', name:'Iced Tea', price:45, kw:'iced,tea'},
 {id:17,cat:'Drinks', name:'Cola Float', price:60, kw:'cola,float'},
 {id:18,cat:'Drinks', name:'Orange Juice', price:55, kw:'orange,juice'}
];

const FOOD_ICON=`<svg class="ic" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 21V3c-2.5 1.5-3 5-3 8h3"/></svg>`;   // shown behind each photo until it loads

/* ===== STATE ===== */
let cart = {};            // {productId: qty}
let orderType = '';
let method = '';
let curCat = CATS[0];
let order = null;         // completed transaction (used by success + receipt)
let paying = false;       // blocks double submit
let memCounter = 0;       // fallback if localStorage fails

/* ===== HELPERS ===== */
const $ = id => document.getElementById(id);
const peso = n => '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const prod = id => PRODUCTS.find(p => p.id == id);
const total = () => Object.entries(cart).reduce((s,[id,q]) => s + prod(id).price*q, 0);
const count = () => Object.values(cart).reduce((s,q) => s+q, 0);
const STEPS={type:'Order type',shop:'Choose items',summary:'Review order',method:'Payment',payCash:'Payment',payQR:'Payment',payCard:'Payment',processing:'Processing',success:'Done',receipt:'Receipt'};
function show(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id===id));
  $('top').style.display = id==='welcome' ? 'none' : 'flex';
  $('stepTag').textContent = STEPS[id]||'';
  $('typeTag').style.display = orderType ? '' : 'none';
  // Cancel is only offered while an order is still being built
  $('cancelBtn').style.display = ['processing','success','receipt'].includes(id) ? 'none' : '';
}
let tt;
function toast(msg, bad){
  const t=$('toast'); t.textContent=msg; t.className='show'+(bad?' bad':'');
  clearTimeout(tt); tt=setTimeout(()=>t.className='',2200);
}

/* ===== ORDER TYPE ===== */
function setType(t){
  orderType=t; $('typeTag').textContent=t; $('cartType').textContent=t;
  render(); show('shop');
}

/* ===== CART LOGIC ===== */
function setQty(id, q){
  if(q<0 || q>99){ toast('Invalid quantity', true); return; }
  if(q===0){ delete cart[id]; toast('Item removed'); }
  else { if(!cart[id]) toast('Product added'); cart[id]=q; }
  render();
}
const add = id => setQty(id, (cart[id]||0)+1);
const change = (id,d) => setQty(id, (cart[id]||0)+d);
const remove = id => setQty(id, 0);

/* ===== RENDER SHOP ===== */
function render(){
  $('cats').innerHTML = CATS.map(c=>`<button class="${c===curCat?'on':''}" onclick="curCat='${c}';render()">${c}</button>`).join('');
  $('grid').innerHTML = PRODUCTS.filter(p=>p.cat===curCat).map(p=>{
    const q=cart[p.id]||0;
    return `<div class="card">
      <div class="pic">${FOOD_ICON}<img src="https://loremflickr.com/400/300/${p.kw}?lock=${p.id}" alt="${p.name}" loading="lazy" onerror="this.remove()"></div>
      <div class="info"><b>${p.name}</b><span class="price">${peso(p.price)}</span></div>
      ${q? `<div class="step"><button onclick="change(${p.id},-1)">−</button><span>${q}</span><button onclick="change(${p.id},1)">+</button></div>`
         : `<button class="add" onclick="add(${p.id})">Add</button>`}
    </div>`;
  }).join('');
  const ids=Object.keys(cart);
  $('lines').innerHTML = ids.length ? ids.map(id=>{const p=prod(id),q=cart[id];return `<div class="line">
      <div><b>${p.name}</b><br><small>${peso(p.price)} each</small></div><b style="text-align:right">${peso(p.price*q)}</b>
      <div class="step"><button onclick="change(${id},-1)">−</button><span>${q}</span><button onclick="change(${id},1)">+</button></div>
      <button class="rm" onclick="remove(${id})" aria-label="Remove ${p.name}"><svg class="ic" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button></div>`}).join('')
    : '<p class="empty">Your cart is empty.<br>Tap an item to add it.</p>';
  $('cSub').textContent=$('cTot').textContent=peso(total());
}
// A plate icon sits behind each photo: if the image fails, it is removed and the icon shows.

function cancelOrder(){
  $('dlg').style.display='flex';
}

/* ===== TO PAYMENT (guards empty cart) ===== */
function toPayment(from){
  if(!count()){ toast('Please select at least one item', true); show('shop'); return; }
  if(from==='shop'){ renderSummary(); show('summary'); }
  else { $('mTotal').textContent=peso(total()); show('method'); }
}
function renderSummary(){
  $('sumType').textContent='Order type: '+orderType;
  $('sumTable').innerHTML='<tr><th>Product</th><th>Qty</th><th>Unit price</th><th>Subtotal</th></tr>'+
    Object.entries(cart).map(([id,q])=>{const p=prod(id);return `<tr><td>${p.name}</td><td>${q}</td><td>${peso(p.price)}</td><td>${peso(p.price*q)}</td></tr>`}).join('')+
    `<tr><td colspan="3"><b>TOTAL</b></td><td><b>${peso(total())}</b></td></tr>`;
}

/* ===== PAYMENT ===== */
function chooseMethod(m){
  if(!count()){ toast('Please select at least one item', true); show('shop'); return; }
  method=m; const t=peso(total());
  if(m==='Cash'){ $('cashDue').textContent=t; $('cashIn').value=''; $('cashErr').textContent=''; $('chg').textContent='Change: ₱0.00'; show('payCash'); }
  else if(m==='QR Payment'){ $('qrAmt').textContent=t; $('qrBox').innerHTML=makeQR(total()); show('payQR'); }
  else { $('cardAmt').textContent=t; show('payCard'); }
}
// Parse the typed amount; returns a number or NaN when invalid
function parseAmt(){
  const v=$('cashIn').value.trim();
  if(!/^\d+(\.\d{1,2})?$/.test(v)) return NaN;
  return parseFloat(v);
}
function calcChange(){
  const a=parseAmt(), t=total();
  $('chg').textContent='Change: '+peso(!isNaN(a)&&a>=t ? a-t : 0);
  $('cashErr').textContent='';
}
function quick(v){ $('cashIn').value = v==='exact' ? total().toFixed(2) : v; calcChange(); }
function payCash(){
  const a=parseAmt(), t=total();
  let msg='';
  if($('cashIn').value.trim()==='') msg='Please enter the amount paid.';
  else if(isNaN(a)) msg='Invalid amount. Use numbers only, no negatives.';
  else if(a<t) msg='Insufficient payment. Please enter at least '+peso(t)+'.';
  if(msg){ $('cashErr').textContent=msg; toast(a<t&&!isNaN(a)?'Insufficient payment':'Invalid amount', true); return; }
  finish('Cash', a, 800);
}
function payDigital(m, ms){ finish(m, total(), ms); }   // QR/card: paid = total

// Show processing screen, then complete the (simulated) transaction
function finish(m, paid, ms){
  if(paying || !count()) return;
  paying=true; show('processing');
  setTimeout(()=>{
    const n=nextNumber(), t=total();
    order={
      ref:'TXN-2026-'+String(n).padStart(5,'0'),
      no:'A-'+String(n%1000||1000).padStart(3,'0'),
      type:orderType, method:m, total:t, paid:paid, change:paid-t,
      date:new Date(), items:Object.entries(cart).map(([id,q])=>({...prod(id),qty:q}))
    };
    $('sOrder').textContent=order.no; $('sRef').textContent=order.ref;
    $('sAmt').textContent=peso(t); $('sPaid').textContent=peso(paid); $('sMeth').textContent=m;
    renderReceipt(); paying=false; show('success');
    toast('Transaction completed successfully');
  }, ms);
}
// Sequential counter saved in localStorage (try/catch so it never breaks)
function nextNumber(){
  let n;
  try{ n=(parseInt(localStorage.getItem('afCounter'))||0)+1; localStorage.setItem('afCounter',n); memCounter=Math.max(memCounter,n); }
  catch(e){ n=++memCounter; }
  return n;
}

/* ===== RECEIPT ===== */
function renderReceipt(){
  const o=order;
  $('rcptBox').innerHTML=`<h3>ALEJANDRO FAST FOOD</h3><p style="text-align:center">Official Digital Receipt</p><hr>
   <p>Txn: ${o.ref}<br>Order No: ${o.no}<br>Order Type: ${o.type}<br>${o.date.toLocaleDateString('en-PH')} ${o.date.toLocaleTimeString('en-PH')}</p><hr>
   ${o.items.map(i=>`<p>${i.name}<br>&nbsp;&nbsp;${i.qty} × ${peso(i.price)}<span style="float:right">${peso(i.price*i.qty)}</span></p>`).join('')}<hr>
   <p><b>TOTAL<span style="float:right">${peso(o.total)}</span></b></p>
   <p>Payment: ${o.method}<br>Amount Paid: ${peso(o.paid)}<br>Change: ${peso(o.change)}</p>
   <p class="status">✔ Payment Successful</p>`;
}

/* ===== QR PLACEHOLDER (decorative pattern seeded by the total) ===== */
function makeQR(seed){
  const N=21; let s=Math.floor(seed*100)+7, r='';
  const rnd=()=>(s=(s*9301+49297)%233280)/233280;
  const finder=(x,y)=>(x<7&&y<7)||(x>13&&y<7)||(x<7&&y>13);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    let on;
    if(finder(x,y)){ const fx=x%14,fy=y%14; on=fx==0||fx==6||fy==0||fy==6||(fx>1&&fx<5&&fy>1&&fy<5); }
    else on=rnd()>.5;
    if(on) r+=`<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  return `<svg viewBox="-1 -1 ${N+2} ${N+2}" style="background:#fff;border:6px solid var(--deep);border-radius:12px;width:100%" fill="#1e0a4a" shape-rendering="crispEdges">${r}</svg>`;
}

/* ===== NEW TRANSACTION: wipe everything, back to Welcome ===== */
function resetAll(){
  cart={}; orderType=''; method=''; order=null; paying=false; curCat=CATS[0];
  $('cashIn').value=''; $('cashErr').textContent=''; $('rcptBox').innerHTML='';
  ['sOrder','sRef','sAmt','sPaid','sMeth'].forEach(i=>$(i).textContent='');
  render(); show('welcome');
}
function newTransaction(){ resetAll(); }

render();
