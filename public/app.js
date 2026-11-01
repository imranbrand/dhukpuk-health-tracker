const $=id=>document.getElementById(id);
const STORE='dhukpuk_v1';
const today=()=>new Date().toLocaleDateString('en-CA');
const bn=n=>n===null||n===undefined||n===''?'—':Number(n).toLocaleString('bn-BD',{maximumFractionDigits:1});
let state=load();
function load(){try{const x=JSON.parse(localStorage.getItem(STORE));if(x&&Array.isArray(x.members)&&x.members.length)return x}catch(e){}return {members:[{id:'self',name:'আমি',age:'',height:''}],active:'self',entries:[]}}
function save(){localStorage.setItem(STORE,JSON.stringify(state))}
function member(){return state.members.find(m=>m.id===state.active)||state.members[0]}
function entries(){return state.entries.filter(e=>e.memberId===state.active).sort((a,b)=>b.date.localeCompare(a.date))}
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2400)}
function open(d){d.showModal()}
function render(){
 const m=member();$('greeting').textContent=m.name+'-এর স্বাস্থ্য-ঝলক';$('todayLabel').textContent=new Date().toLocaleDateString('bn-BD',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 $('members').innerHTML=state.members.map(x=>'<button class="member-chip '+(x.id===state.active?'active':'')+'" data-id="'+x.id+'">'+esc(x.name)+'</button>').join('');
 document.querySelectorAll('.member-chip').forEach(b=>b.onclick=()=>{state.active=b.dataset.id;save();render()});
 const e=entries().find(x=>x.date===today())||entries()[0]||{};
 const bmi=e.weight&&m.height?Number(e.weight)/((Number(m.height)/100)**2):null;
 const cards=[
 ['⚖️','ওজন',e.weight,'কেজি'],['📐','BMI',bmi?bmi.toFixed(1):null,'kg/m²'],['🩺','রক্তচাপ',e.sys&&e.dia?bn(e.sys)+' / '+bn(e.dia):null,'mmHg'],['💓','হার্টবিট',e.pulse,'bpm'],
 ['🫁','অক্সিজেন (SpO₂)',e.spo2,'%'],['🩸','ব্লাড সুগার',e.glucose,'mmol/L'],['🚶','হাঁটা',e.steps,'ধাপ'],['💧','পানি',e.water,'লিটার']
 ];
 $('metricGrid').innerHTML=cards.map(c=>'<article class="metric '+(c[2]===undefined||c[2]===null?'empty-metric':'')+'"><div class="metric-top"><span class="metric-icon">'+c[0]+'</span><span class="metric-state">'+(c[2]===undefined||c[2]===null?'তথ্য নেই':'রেকর্ড করা')+'</span></div><div class="metric-value">'+(c[2]===undefined||c[2]===null?'—':(typeof c[2]==='number'?bn(c[2]):c[2]))+' <small>'+c[3]+'</small></div><div class="metric-name">'+c[1]+'</div></article>').join('');
 const latest=entries()[0]||{};const step=Number(latest.steps)||0,water=Number(latest.water)||0,sleep=Number(latest.sleep)||0;
 const a=Math.min(step/8000,1),b=Math.min(water/2,1),c=Math.min(sleep/8,1),count=[latest.steps!==undefined,latest.water!==undefined,latest.sleep!==undefined].filter(Boolean).length;
 const score=count?Math.round((a+b+c)/3*100):0;
 $('score').textContent=bn(score);$('scoreTitle').textContent=count?(score>=80?'চমৎকার অভ্যাসের ধারাবাহিকতা':score>=50?'ভালো শুরু করেছেন':'ধীরে ধীরে অভ্যাস গড়ুন'):'শুরু করুন আজ থেকেই';
 $('scoreText').textContent=count?'এটি শুধু হাঁটা, পানি ও ঘুমের লক্ষ্যভিত্তিক অভ্যাস স্কোর—চিকিৎসাগত স্বাস্থ্য-স্কোর নয়।':'ঘুম, হাঁটা ও পানি পানের তথ্য যোগ করলে আপনার দৈনিক অভ্যাসের স্কোর তৈরি হবে।';
 $('stepsText').textContent=latest.steps!==undefined?bn(step)+' / ৮,০০০':'তথ্য নেই';$('waterText').textContent=latest.water!==undefined?bn(water)+' / ২ L':'তথ্য নেই';$('sleepText').textContent=latest.sleep!==undefined?bn(sleep)+' / ৮ ঘণ্টা':'তথ্য নেই';
 $('stepsBar').style.width=(a*100)+'%';$('waterBar').style.width=(b*100)+'%';$('sleepBar').style.width=(c*100)+'%';
 $('recentList').innerHTML=entries().slice(0,4).map(x=>'<div class="recent-row"><strong>'+new Date(x.date+'T12:00:00').toLocaleDateString('bn-BD',{day:'numeric',month:'short'})+'</strong><span>'+[x.weight?bn(x.weight)+' কেজি':'',x.sys&&x.dia?bn(x.sys)+'/'+bn(x.dia)+' BP':'',x.steps?bn(x.steps)+' ধাপ':''].filter(Boolean).join(' · ')+'</span></div>').join('')||'<p class="empty">এখনো কোনো রিডিং যোগ করা হয়নি।</p>';
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('addMember').onclick=()=>open($('memberDialog'));
$('quickEntry').onclick=()=>{if(!state.members.length)return; $('entryDate').value=today();$('entryForm').reset();$('entryDate').value=today();open($('entryDialog'))};
$('memberForm').onsubmit=ev=>{ev.preventDefault();const name=$('memberName').value.trim();if(!name)return;const m={id:crypto.randomUUID(),name,age:$('memberAge').value,height:$('memberHeight').value};state.members.push(m);state.active=m.id;save();$('memberDialog').close();$('memberForm').reset();render();toast('পরিবারের সদস্য যোগ হয়েছে')};
$('entryForm').onsubmit=ev=>{ev.preventDefault();const val=id=>$(id).value;const sys=val('sys'),dia=val('dia');if((sys&&!dia)||(!sys&&dia)){toast('রক্তচাপের SYS ও DIA দুটোই লিখুন');return}
 const e={id:crypto.randomUUID(),memberId:state.active,date:val('entryDate')||today(),notes:val('notes').trim()};
 ['weight','sys','dia','pulse','spo2','glucose','steps','water','sleep'].forEach(k=>{if(val(k)!=='')e[k]=Number(val(k))});
 if(!Object.keys(e).some(k=>!['id','memberId','date','notes'].includes(k))){toast('কমপক্ষে একটি রিডিং লিখুন');return}
 state.entries=state.entries.filter(x=>!(x.memberId===state.active&&x.date===e.date));state.entries.push(e);save();$('entryDialog').close();$('entryForm').reset();render();toast('রিডিং সংরক্ষণ হয়েছে')};
$('allEntries').onclick=showHistory;
function showHistory(){const es=entries();$('historyList').innerHTML=es.map(e=>'<div class="history-row"><strong>'+new Date(e.date+'T12:00:00').toLocaleDateString('bn-BD',{day:'numeric',month:'long',year:'numeric'})+'</strong><p>'+[['ওজন',e.weight,'কেজি'],['BP',e.sys&&e.dia?e.sys+'/'+e.dia:null,'mmHg'],['হার্টবিট',e.pulse,'bpm'],['SpO₂',e.spo2,'%'],['সুগার',e.glucose,'mmol/L'],['ধাপ',e.steps,''],['পানি',e.water,'L'],['ঘুম',e.sleep,'ঘণ্টা']].filter(x=>x[1]!==undefined&&x[1]!==null).map(x=>x[0]+': '+bn(x[1])+' '+x[2]).join(' · ')+(e.notes?'<br>'+esc(e.notes):'')+'</p></div>').join('')||'<p class="empty">এখনো কোনো রেকর্ড নেই।</p>';open($('historyDialog'))}
$('shareScore').onclick=async()=>{const latest=entries()[0]||{};const step=Number(latest.steps)||0,water=Number(latest.water)||0,sleep=Number(latest.sleep)||0;const count=[latest.steps,latest.water,latest.sleep].filter(x=>x!==undefined).length;const score=count?Math.round((Math.min(step/8000,1)+Math.min(water/2,1)+Math.min(sleep/8,1))/3*100):0;const msg='আজ আমার Dhukpuk সুস্থতার অভ্যাস স্কোর '+bn(score)+'/১০০! 💚\nহাঁটা, পানি ও ঘুমের ছোট অভ্যাস ট্র্যাক করছি।\nএটি চিকিৎসাগত স্বাস্থ্য-স্কোর নয়।\n#Dhukpuk #শরীরদর্পণ';if(navigator.share){try{await navigator.share({title:'Dhukpuk — আমার অভ্যাস স্কোর',text:msg,url:location.href})}catch(e){}}else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(msg);toast('শেয়ার ক্যাপশন কপি হয়েছে')}else{toast(msg)}};
$('todayLabel').title='সর্বশেষ রেকর্ড দেখানো হচ্ছে যদি আজকের রিডিং না থাকে';
render();