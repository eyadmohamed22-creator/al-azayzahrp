/**
 * Al-AzayzahRP - Interactive Web Application Engine
 * Developer: Eyad / Al-Azayzah Team
 * Features: LocalStorage Persistence, Live Auction Controller, Rules CRUD, Applications Pipeline, Audio Synthesizer
 */

// Storage Keys
const STORAGE = {
  AUCTIONS: 'al_azayzah_auctions_data_v2',
  RULES: 'al_azayzah_rules_data_v2',
  APPS: 'al_azayzah_apps_data_v3',
  TICKETS: 'al_azayzah_tickets_data_v2',
  BROADCAST: 'al_azayzah_broadcast_data_v2',
  SERVER_CFG: 'al_azayzah_server_cfg_data_v2',
  FACTIONS: 'al_azayzah_factions_data_v5',
  APPS_LIST: 'al_azayzah_applications_list_v4'
};

// Sound effects synthesizer using Web Audio API
class SoundFx {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }
  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch(e) {}
  }
  playSuccess() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch(e) {}
  }
  playDelete() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch(e) {}
  }
}
const sound = new SoundFx();

// Toast Notifications System
function showToast(title, message = '', type = 'success') {
  if (type === 'error') sound.playDelete();
  else sound.playSuccess();

  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = '<i class="fas fa-check-circle text-emerald-400 text-lg"></i>';
  let border = 'border-emerald-500/40';
  if (type === 'error') {
    icon = '<i class="fas fa-exclamation-triangle text-rose-400 text-lg"></i>';
    border = 'border-rose-500/40';
  } else if (type === 'info') {
    icon = '<i class="fas fa-info-circle text-indigo-400 text-lg"></i>';
    border = 'border-indigo-500/40';
  }
  
  toast.classList.add(border);
  toast.innerHTML = `
    ${icon}
    <div class="flex flex-col">
      <span class="font-bold text-sm text-white">${title}</span>
      ${message ? `<span class="text-xs text-gray-400">${message}</span>` : ''}
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Navigation System (Tabs & Router)
function switchTab(tabId) {
  sound.playClick();
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
  
  const target = document.getElementById(`tab-${tabId}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tabId === 'factions') {
      toggleFactionsView(factionsViewMode);
    }
    if (tabId === 'user') {
      renderUserProfile();
    }
  }
  
  document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(el => el.classList.add('active'));
  
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
    mobileMenu.classList.add('hidden');
  }

  if (history.pushState) {
    history.pushState(null, null, `#${tabId}`);
  } else {
    location.hash = `#${tabId}`;
  }
}

// Listen to Hash changes & Initial Setup
window.addEventListener('DOMContentLoaded', () => {
  loadAllStoredData();
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(`tab-${hash}`)) {
    switchTab(hash);
  } else {
    switchTab('home');
  }
  initRulesData();
  initAuctionsData();
  initFactionsData();
  initApplicationsData();
  initServerCounters();
  initUserProfile();
  renderAdminApps();
  renderAdminAuctions();
  renderAdminTickets();
});

// Copy IP Address Function
function copyServerIP() {
  const cfg = getServerConfig();
  const ip = cfg.ip || 'play.al-azayzahrp.net:22003';
  navigator.clipboard.writeText(ip).then(() => {
    showToast('تم نسخ عنوان سيرفر Al-AzayzahRP!', ip, 'success');
  }).catch(() => {
    showToast('عنوان السيرفر:', ip, 'info');
  });
}

// Simulated Live Server Counter (Syncs with dynamic Server Config)
function initServerCounters() {
  const countEl = document.getElementById('live-player-count');
  const adminPlayerEl = document.getElementById('admin-stat-players');
  if (!countEl) return;

  function refreshCounters() {
    const cfg = getServerConfig();
    const max = parseInt(cfg.maxPlayers) || 250;

    if (cfg.status === 'offline') {
      countEl.innerText = 0;
      if (adminPlayerEl) adminPlayerEl.innerText = 0;
      return;
    }
    if (cfg.status === 'maintenance') {
      countEl.innerText = 5;
      if (adminPlayerEl) adminPlayerEl.innerText = 5;
      return;
    }

    const ratio = 0.74; // ~74% full peak
    const base = Math.floor(max * ratio);
    const delta = Math.floor(Math.random() * 5) - 2;
    const current = Math.max(10, Math.min(max - 1, base + delta));
    countEl.innerText = current;
    if (adminPlayerEl) adminPlayerEl.innerText = current;
  }

  refreshCounters();
  setInterval(refreshCounters, 5000);
}

// ==========================================
// RULES SECTION & PERSISTENT CRUD
// ==========================================
let defaultRules = {
  discord: {
    title: 'قوانين الدسكورد',
    icon: 'fa-brands fa-discord',
    rules: [
      { id: 1, title: 'لا تستخدم لغة غير لائقة', desc: 'وهذا يشمل الشتائم المفرطة، والافتراءات العنصرية، واستفزاز الآخرين عمداً، وما إلى ذلك. سيؤدي انتهاك هذه القاعدة إلى اتخاذ الإجراءات المناسبة من جانب المشرفين / الطاقم الإداري.' },
      { id: 2, title: 'لا ترسل رسائل غير مرغوب بها أو تشير إلى أي شخص', desc: 'قد يؤدي الإفراط في إرسال الرسائل (Spam) أو ذكر الأعضاء، المسؤولين، المؤسسين، أو طاقم الإدارة دون سبب وجيه إلى حظر كتابي أو الطرد من السيرفر.' },
      { id: 3, title: 'لا تُعلن عن خوادم أو برامج أو مواقع ويب أو خدمات الدسكورد', desc: 'يتضمن ذلك دعوات عبر الخاص غير المرغوب فيها وروابط الإحالة والترويج لأي جهة دون إذن مسبق من الإدارة العليا، ومخالفة ذلك تؤدي إلى حظر دائم فوري.' },
      { id: 4, title: 'احترام الخصوصية وعدم نشر البيانات الشخصية (Doxxing)', desc: 'يُمنع منعاً باتاً مشاركة أي صور شخصية أو معلومات خاصة أو محادثات سرية دون موافقة صاحبها، وتعتبر هذه المخالفة من الدرجة القصوى وتستوجب الباند النهائي.' },
      { id: 5, title: 'استخدام الرومات الصوتية والكتابية المخصصة', desc: 'يرجى الالتزام بمواضيع الرومات (الشات العام، الميمز، الدعم الفني، المزادات) وعدم إزعاج الآخرين في الرومات الصوتية بتشغيل أصوات مزعجة أو برامج تعديل الصوت غير الواقعية.' }
    ]
  },
  server: {
    title: 'قوانين الخادم العامة',
    icon: 'fa-solid fa-server',
    rules: [
      { id: 1, title: 'الالتزام التام بأساسيات الرول بلاي الواقعي (Roleplay)', desc: 'يجب أن تتصرف شخصيتك داخل اللعبة بواقعية تامة كما في الحياة الحقيقية، والابتعاد عن التصرفات الطفولية أو العشوائية.' },
      { id: 2, title: 'منع القتل العشوائي (RDM - Random Deathmatch)', desc: 'يُمنع قتل أي لاعب دون وجود سيناريو عداوة واضح ومسبق وتحذير رسمي داخل بيئة الرول بلاي.' },
      { id: 3, title: 'منع الصدم بالمركبات (VDM - Vehicle Deathmatch)', desc: 'يُمنع استخدام المركبة كسلاح لدهس أو صدم اللاعبين بشكل عشوائي دون داعٍ درامي منطقي.' },
      { id: 4, title: 'الخوف على الحياة (Fear RP)', desc: 'يجب على شخصيتك إظهار الخوف الطبيعي عند تهديدك بسلاح أو عند مواجهة خطر حقيقي على حياتك والامتثال للأوامر.' },
      { id: 5, title: 'منع استغلال الثغرات البرمجية والقلتشات (Glitching / Bug Abuse)', desc: 'استغلال أي خطأ برمجي للحصول على أموال أو أسلحة أو تخطي أنظمة الحماية يعرض حسابك للتصفير والحظر الدائم.' }
    ]
  },
  jail: {
    title: 'أوقات السجون الإدارية',
    icon: 'fa-solid fa-handcuffs',
    rules: [
      { id: 1, title: 'مخالفة RDM / VDM للمرة الأولى', desc: 'السجن لمدة 60 دقيقة مع مصادرة الأسلحة المستخدمة في السيناريو.' },
      { id: 2, title: 'تخريب السيناريوهات الرسمية (Trolling)', desc: 'السجن لمدة 90 دقيقة مع تحذير رسمي على سجل اللاعب.' },
      { id: 3, title: 'الخروج أثناء السيناريو (Combat Log)', desc: 'السجن لمدة 120 دقيقة وإعادة السيناريو أو مصادرة جميع الأغراض.' },
      { id: 4, title: 'عدم الالتزام بقانون Fear RP', desc: 'السجن لمدة 45 دقيقة.' }
    ]
  },
  mute: {
    title: 'أوقات الميوت والإسكات',
    icon: 'fa-solid fa-comment-slash',
    rules: [
      { id: 1, title: 'إرسال سبام أو تكرار الرسائل بالشات العام', desc: 'ميوت كتابي لمدة 30 دقيقة.' },
      { id: 2, title: 'استخدام المايك بطريقة مزعجة أو تشغيل أغاني', desc: 'ميوت صوتي لمدة 60 دقيقة.' },
      { id: 3, title: 'التعدي اللفظي الخفيف أو الجدال غير المبرر', desc: 'ميوت لمدة ساعتين مع تنبيه إداري.' }
    ]
  },
  ban: {
    title: 'أوقات الحظر (Bans)',
    icon: 'fa-solid fa-ban',
    rules: [
      { id: 1, title: 'استخدام برامج الغش والمودات الممنوعة (Cheating / Hacking)', desc: 'حظر نهائي دائم على السيريال والـ IP دون إمكانية فك الحظر.' },
      { id: 2, title: 'الإساءة للأديان أو الرموز الدينية أو العنصرية', desc: 'حظر دائم مع الطرد من مجتمع الديسكورد.' },
      { id: 3, title: 'الترويج والإعلانات لخوادم خارجية', desc: 'حظر نهائي لجميع الحسابات المرتبطة.' },
      { id: 4, title: 'تخريب الممتلكات وسرقة ممتلكات الإدارة', desc: 'حظر لمدة 30 يوماً وتصفير الحساب بالكامل.' }
    ]
  },
  factions: {
    title: 'قوانين الفاكشنات الرسمية',
    icon: 'fa-solid fa-building-shield',
    rules: [
      { id: 1, title: 'الانضباط والالتزام بالزي الرسمي والمركبات المخصصة', desc: 'يجب على كل عضو في أي قطاع رسمي تمثيل قطاعه بأعلى درجات الاحترافية والتقيد بحدود سلطته القانونية.' },
      { id: 2, title: 'منع استخدام صلاحيات الوظيفة لأهداف شخصية (Corruption Abuse)', desc: 'يُمنع إطلاق السراح بدون محاكمة أو بيع أسلحة الدولة أو مساعدة المجرمين إلا بسيناريو فساد معتمد مسبقاً من الإدارة.' },
      { id: 3, title: 'حضور التدريبات والاجتماعات الدورية', desc: 'الغياب المتكرر بدون إذن مسبق يؤدي إلى تخفيض الرتبة أو الفصل المباشر من القطاع.' }
    ]
  },
  gangs: {
    title: 'قوانين العصابات',
    icon: 'fa-solid fa-mask',
    rules: [
      { id: 1, title: 'قوانين الحروب بين العصابات (Gang Wars)', desc: 'لا تبدأ حرب بين عصابتين إلا بعد وجود سبب درامي كافٍ وتقديم طلب موافقة لدى لجنة العصابات الرسمية.' },
      { id: 2, title: 'حماية المقرات الرئيسية (HQ Rules)', desc: 'يُمنع الهجوم على مقرات العصابات الرئيسية دون سيناريو متفق عليه ووجود عدد متكافئ من الأعضاء المتصلين.' },
      { id: 3, title: 'الزي الموحد والألوان الرسمية', desc: 'يجب على كل عصابة اعتماد لون موحد وتجنب التشابه مع قطاعات الأمن لتفادي اللبس.' }
    ]
  },
  families: {
    title: 'قوانين العائلات',
    icon: 'fa-solid fa-users',
    rules: [
      { id: 1, title: 'تسجيل العائلة رسمياً في السجل المدني', desc: 'يجب أن تضم العائلة ما لا يقل عن 5 أعضاء نشطين مع وجود مجلس إدارة للعائلة ورئيس معتمد.' },
      { id: 2, title: 'حظر التحالفات السرية غير المعلنة', desc: 'يجب إبلاغ إدارة شؤون العائلات بأي تحالفات تجارية أو أمنية تتم بين العائلات.' },
      { id: 3, title: 'الاحترام المتبادل بين العائلات', desc: 'النزاعات العائلية تحل عبر المحاكم أو جلسات الصلح المعتمدة تحت إشراف قطاع العدل.' }
    ]
  },
  companies: {
    title: 'قوانين الشركات والاستثمار',
    icon: 'fa-solid fa-briefcase',
    rules: [
      { id: 1, title: 'تراخيص الشركات ودفع الضرائب', desc: 'يجب تجديد الرخصة التجارية أسبوعياً عبر وزارة المالية ودفع الرسوم المستحقة وفق القانون الاقتصادي.' },
      { id: 2, title: 'عقود الموظفين وحقوق العمال', desc: 'يمنع تسريح الموظفين تعسفياً دون دفع مستحقاتهم المتفق عليها في عقد العمل.' },
      { id: 3, title: 'منع الاحتكار والتلاعب بالأسعار', desc: 'تخضع الأسعار لمراقبة وزارة التجارة لمنع الإضرار بالاقتصاد العام لسيرفر Al-AzayzahRP.' }
    ]
  }
};

let rulesData = defaultRules;
let currentRuleCategory = 'discord';

function saveRules() {
  localStorage.setItem(STORAGE.RULES, JSON.stringify(rulesData));
}

function selectRulesCategory(catKey) {
  sound.playClick();
  currentRuleCategory = catKey;
  document.querySelectorAll('.rule-cat-btn').forEach(btn => {
    btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-500/30');
    btn.classList.add('bg-white/5', 'text-gray-300', 'hover:bg-white/10');
  });

  const activeBtn = document.getElementById(`cat-btn-${catKey}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-white/5', 'text-gray-300', 'hover:bg-white/10');
    activeBtn.classList.add('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-500/30');
  }

  const catData = rulesData[catKey] || rulesData.discord;
  const container = document.getElementById('rules-cards-container');
  const titleEl = document.getElementById('rules-category-title');
  const iconEl = document.getElementById('rules-category-icon');

  if (titleEl) titleEl.innerText = catData.title;
  if (iconEl) iconEl.className = `${catData.icon} text-indigo-400 text-2xl`;

  if (container) {
    if (catData.rules.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-gray-500">
          <i class="fa-solid fa-shield-halved text-4xl mb-3 block opacity-30"></i>
          لا توجد قوانين مسجلة في هذا القسم حالياً. يمكنك الضغط على "إضافة بند/قانون جديد" لإضافة أول بند!
        </div>
      `;
      return;
    }

    container.innerHTML = catData.rules.map(rule => `
      <div class="glass-panel rounded-2xl p-6 glow-card transition-all border border-white/10 flex items-start justify-between gap-4 group">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2 flex-wrap">
            <span class="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-sm border border-indigo-500/30">#${rule.id}</span>
            <h4 class="text-lg font-bold text-white">${rule.title}</h4>
          </div>
          <p class="text-gray-400 text-sm leading-relaxed">${rule.desc}</p>
        </div>
        <button 
          onclick="deleteRuleDirect('${catKey}', ${rule.id})" 
          title="حذف هذا القانون" 
          class="w-9 h-9 rounded-xl bg-white/5 hover:bg-rose-600 text-gray-400 hover:text-white transition-all flex items-center justify-center opacity-80 hover:opacity-100 flex-shrink-0"
        >
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
      </div>
    `).join('');
  }
}

function deleteRuleDirect(catKey, ruleId) {
  sound.playDelete();
  if (!rulesData[catKey]) return;
  const index = rulesData[catKey].rules.findIndex(r => r.id === ruleId);
  if (index !== -1) {
    const title = rulesData[catKey].rules[index].title;
    rulesData[catKey].rules.splice(index, 1);
    saveRules();
    selectRulesCategory(catKey);
    showToast('تم حذف القانون بنجاح!', `تمت إزالة: ${title}`, 'info');
  }
}

function openAddRuleModal() {
  sound.playClick();
  const modal = document.getElementById('add-rule-modal');
  if (modal) modal.classList.add('active');
}
function closeAddRuleModal() {
  sound.playClick();
  const modal = document.getElementById('add-rule-modal');
  if (modal) modal.classList.remove('active');
}

function submitNewRule(e) {
  e.preventDefault();
  const title = document.getElementById('new-rule-title')?.value;
  const desc = document.getElementById('new-rule-desc')?.value;
  if (!title || !desc) {
    showToast('تنبيه', 'يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }

  const catKey = currentRuleCategory || 'discord';
  if (!rulesData[catKey]) rulesData[catKey] = { title: 'قوانين', icon: 'fa-solid fa-shield-halved', rules: [] };
  
  const newId = rulesData[catKey].rules.length > 0 ? Math.max(...rulesData[catKey].rules.map(r => r.id)) + 1 : 1;
  rulesData[catKey].rules.push({ id: newId, title: title, desc: desc });
  
  saveRules();
  selectRulesCategory(catKey);
  closeAddRuleModal();
  document.getElementById('new-rule-title').value = '';
  document.getElementById('new-rule-desc').value = '';
  showToast('تمت إضافة القانون الجديد بنجاح!', `أضيف البند #${newId} إلى ${rulesData[catKey].title}`, 'success');
}

function initRulesData() {
  selectRulesCategory('discord');
}

// ==========================================
// AUCTIONS SECTION & PERSISTENT CRUD
// ==========================================
let defaultAuctions = [
  {
    id: 1,
    title: 'دوج ايدي رباعي مكرر + فل تعديل',
    category: 'cars',
    categoryName: 'سيارات',
    status: 'active',
    currentPrice: 1800000,
    bidsCount: 1,
    timeLeft: '18 يوم',
    image: 'file:///C:/Users/Eyad/.gemini/antigravity/brain/c42083bf-d10d-4e79-bb5d-32f12e237418/pink_dodge_charger_1790983630081.jpg',
    fallbackImg: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    seller: 'Eyad (المطور)',
    description: 'دوج تشارجر بمواصفات خارقة، محرك V8 معدل بالكامل، طلاء وردي نيون حصري، لوحة رباعية مميزة، خالية من الصدمات.'
  },
  {
    id: 2,
    title: 'سلاح من نوع CZ-805',
    category: 'weapons',
    categoryName: 'أسلحة',
    status: 'active',
    currentPrice: 300000,
    bidsCount: 1,
    timeLeft: '5 يوم',
    image: 'file:///C:/Users/Eyad/.gemini/antigravity/brain/c42083bf-d10d-4e79-bb5d-32f12e237418/weapon_cz805_1790983655010.jpg',
    fallbackImg: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=800&q=80',
    seller: 'عمر القحطاني',
    description: 'بندقية هجومية تشيكية أصلية CZ-805 مع منظار إلكتروني و3 مخازن ذخيرة 5.56 ملم ناتو ممتلئة.'
  },
  {
    id: 3,
    title: 'مزاد على سلاح uzi نادر',
    category: 'weapons',
    categoryName: 'أسلحة',
    status: 'active',
    currentPrice: 400000,
    bidsCount: 0,
    timeLeft: '1 ساعة',
    image: 'file:///C:/Users/Eyad/.gemini/antigravity/brain/c42083bf-d10d-4e79-bb5d-32f12e237418/weapon_uzi_1790983682867.jpg',
    fallbackImg: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=800&q=80',
    seller: 'سيف الدين',
    description: 'سلاح أوزي كلاسيكي بحالة الوكالة مع صندوقين ذخيرة 9 ملم. مدمج وقوي جداً للاشتباكات القريبة.'
  },
  {
    id: 4,
    title: 'قصر فاخر بإطلالة بحرية في الفاينوود',
    category: 'estates',
    categoryName: 'عقارات',
    status: 'active',
    currentPrice: 5500000,
    bidsCount: 4,
    timeLeft: '3 أيام',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    fallbackImg: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    seller: 'شركة التطوير العقاري',
    description: 'قصر فخم يحتوي على مهبط طائرات هليكوبتر، مسبح خاص، كراج يسع 10 سيارات، ونظام حماية ذكي متكامل.'
  },
  {
    id: 5,
    title: 'لوحة ملكية مميزة "MTA 1"',
    category: 'special',
    categoryName: 'مميز',
    status: 'active',
    currentPrice: 950000,
    bidsCount: 7,
    timeLeft: '12 ساعة',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    fallbackImg: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    seller: 'مزادات لوس سانتوس',
    description: 'اللوحة رقم 1 في السيرفر، قابلة للتحويل إلى أي سيارة رياضية أو كلاسيكية.'
  }
];

let auctionsList = defaultAuctions;
let selectedAuctionItem = null;

function saveAuctions() {
  localStorage.setItem(STORAGE.AUCTIONS, JSON.stringify(auctionsList));
}

function renderAuctions(itemsToRender = auctionsList) {
  const container = document.getElementById('auctions-grid');
  if (!container) return;

  if (itemsToRender.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <i class="fas fa-box-open text-gray-600 text-5xl mb-4"></i>
        <p class="text-gray-400 text-lg">لم يتم العثور على أي مزادات مطابقة لبحثك</p>
      </div>
    `;
    return;
  }

  container.innerHTML = itemsToRender.map(item => `
    <div class="glass-panel rounded-2xl overflow-hidden glow-card border border-white/10 flex flex-col justify-between" id="auc-card-${item.id}">
      <div class="relative h-48 w-full bg-slate-950 overflow-hidden">
        <img 
          src="${item.image}" 
          alt="${item.title}" 
          class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onerror="this.onerror=null; this.src='${item.fallbackImg}'"
        />
        <div class="absolute top-3 right-3 flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            ${item.status === 'active' ? 'نشط' : 'منتهي'}
          </span>
        </div>
        <div class="absolute bottom-3 right-3">
          <span class="px-2.5 py-0.5 rounded-md text-xs font-medium bg-black/60 text-gray-300 backdrop-blur-md">
            ${item.categoryName}
          </span>
        </div>
      </div>
      
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="text-base font-bold text-white mb-2 line-clamp-1">${item.title}</h3>
          <div class="text-xs text-gray-400 mb-4 flex items-center gap-2">
            <span>البائع:</span>
            <span class="text-indigo-400 font-semibold">${item.seller}</span>
          </div>
          
          <div class="bg-black/30 rounded-xl p-3 mb-4 border border-white/5 flex items-center justify-between">
            <div>
              <span class="text-xs text-gray-400 block mb-0.5">السعر الحالي</span>
              <span class="text-lg font-black text-indigo-400 tracking-wide">$ ${item.currentPrice.toLocaleString()}</span>
            </div>
            <div class="text-left text-xs text-gray-400 flex flex-col items-end gap-1">
              <span class="flex items-center gap-1"><i class="far fa-clock text-amber-400"></i> ${item.timeLeft}</span>
              <span class="flex items-center gap-1"><i class="fas fa-gavel text-indigo-400"></i> ${item.bidsCount} مزايدة</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button 
            onclick="openAuctionDetail(${item.id})"
            class="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-indigo-600 hover:text-white text-gray-300 text-sm font-semibold transition-all border border-white/10 flex items-center justify-center gap-2 group"
          >
            <span>عرض ومزايدة</span>
            <i class="fas fa-arrow-left text-xs transition-transform group-hover:-translate-x-1"></i>
          </button>
          
          <!-- Direct Delete Button right on every card -->
          <button 
            onclick="deleteAuctionDirect(${item.id})"
            title="حذف هذا المزاد فوراً"
            class="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 flex items-center justify-center transition-all flex-shrink-0"
          >
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function deleteAuctionDirect(id) {
  sound.playDelete();
  const index = auctionsList.findIndex(a => a.id === id);
  if (index !== -1) {
    const title = auctionsList[index].title;
    auctionsList.splice(index, 1);
    saveAuctions();
    renderAuctions();
    renderAdminAuctions();
    showToast('تم حذف المزاد بنجاح!', `تمت إزالة "${title}" وحفظ التعديل نهائياً`, 'info');
  }
}

function filterAuctions() {
  const searchTerm = (document.getElementById('auction-search-input')?.value || '').toLowerCase().trim();
  const category = document.getElementById('auction-cat-filter')?.value || 'all';
  const status = document.getElementById('auction-status-filter')?.value || 'all';

  const filtered = auctionsList.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(searchTerm) || item.seller.toLowerCase().includes(searchTerm);
    const matchCat = category === 'all' || item.category === category;
    const matchStatus = status === 'all' || item.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  renderAuctions(filtered);
}

function openAuctionDetail(id) {
  sound.playClick();
  selectedAuctionItem = auctionsList.find(a => a.id === id);
  if (!selectedAuctionItem) return;

  const modal = document.getElementById('auction-detail-modal');
  const titleEl = document.getElementById('modal-auction-title');
  const imgEl = document.getElementById('modal-auction-img');
  const priceEl = document.getElementById('modal-auction-price');
  const bidsEl = document.getElementById('modal-auction-bids');
  const timeEl = document.getElementById('modal-auction-time');
  const sellerEl = document.getElementById('modal-auction-seller');
  const descEl = document.getElementById('modal-auction-desc');
  const inputEl = document.getElementById('bid-amount-input');

  if (titleEl) titleEl.innerText = selectedAuctionItem.title;
  if (imgEl) {
    imgEl.src = selectedAuctionItem.image;
    imgEl.onerror = () => { imgEl.src = selectedAuctionItem.fallbackImg; };
  }
  if (priceEl) priceEl.innerText = `$ ${selectedAuctionItem.currentPrice.toLocaleString()}`;
  if (bidsEl) bidsEl.innerText = `${selectedAuctionItem.bidsCount} مزايدات`;
  if (timeEl) timeEl.innerText = selectedAuctionItem.timeLeft;
  if (sellerEl) sellerEl.innerText = selectedAuctionItem.seller;
  if (descEl) descEl.innerText = selectedAuctionItem.description;

  const minBid = selectedAuctionItem.currentPrice + 50000;
  if (inputEl) {
    inputEl.value = minBid;
    inputEl.min = minBid;
  }

  modal.classList.add('active');
}

function closeAuctionDetail() {
  sound.playClick();
  const modal = document.getElementById('auction-detail-modal');
  if (modal) modal.classList.remove('active');
}

function submitBid() {
  const inputEl = document.getElementById('bid-amount-input');
  if (!inputEl || !selectedAuctionItem) return;

  const amount = parseInt(inputEl.value);
  if (isNaN(amount) || amount <= selectedAuctionItem.currentPrice) {
    showToast('خطأ في المزايدة', 'يجب أن تكون قيمة المزايدة أكبر من السعر الحالي بـ $50,000 على الأقل', 'error');
    return;
  }

  selectedAuctionItem.currentPrice = amount;
  selectedAuctionItem.bidsCount += 1;
  saveAuctions();

  showToast('تمت المزايدة بنجاح!', `زايدت بمبلغ $ ${amount.toLocaleString()} على ${selectedAuctionItem.title}`, 'success');
  closeAuctionDetail();
  renderAuctions();
  renderAdminAuctions();
}

function openAddAuctionModal() {
  sound.playClick();
  const modal = document.getElementById('add-auction-modal');
  if (modal) modal.classList.add('active');
}

function closeAddAuctionModal() {
  sound.playClick();
  const modal = document.getElementById('add-auction-modal');
  if (modal) modal.classList.remove('active');
}

function submitNewAuction(e) {
  e.preventDefault();
  const title = document.getElementById('new-auc-title')?.value;
  const category = document.getElementById('new-auc-cat')?.value || 'cars';
  const price = parseInt(document.getElementById('new-auc-price')?.value);
  const time = document.getElementById('new-auc-time')?.value;
  const desc = document.getElementById('new-auc-desc')?.value;
  const customImg = document.getElementById('new-auc-img')?.value?.trim();

  if (!title || isNaN(price)) {
    showToast('تنبيه', 'يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }

  const categoryNames = {
    cars: 'سيارات',
    weapons: 'أسلحة',
    estates: 'عقارات',
    special: 'مميز'
  };

  const defaultImages = {
    cars: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
    weapons: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=800&q=80',
    estates: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    special: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80'
  };

  const chosenImg = customImg || defaultImages[category] || defaultImages.cars;

  const newAuction = {
    id: Date.now(),
    title: title,
    category: category,
    categoryName: categoryNames[category] || 'أخرى',
    status: 'active',
    currentPrice: price,
    bidsCount: 0,
    timeLeft: time,
    image: chosenImg,
    fallbackImg: defaultImages[category] || defaultImages.cars,
    seller: 'Eyad (المؤسس)',
    description: desc || 'لا يوجد وصف مفصل لهذا المزاد.'
  };

  auctionsList.unshift(newAuction);
  saveAuctions();
  renderAuctions();
  renderAdminAuctions();
  closeAddAuctionModal();

  document.getElementById('new-auc-title').value = '';
  document.getElementById('new-auc-price').value = '';
  if (document.getElementById('new-auc-img')) document.getElementById('new-auc-img').value = '';
  if (document.getElementById('new-auc-desc')) document.getElementById('new-auc-desc').value = '';

  showToast('تم نشر المزاد وحفظه بنجاح!', `تمت إضافة "${title}" وحفظها في الموقع`, 'success');
}

function initAuctionsData() {
  renderAuctions();
  const searchInput = document.getElementById('auction-search-input');
  const catFilter = document.getElementById('auction-cat-filter');
  const statusFilter = document.getElementById('auction-status-filter');

  if (searchInput) searchInput.addEventListener('input', filterAuctions);
  if (catFilter) catFilter.addEventListener('change', filterAuctions);
  if (statusFilter) statusFilter.addEventListener('change', filterAuctions);
}

// ==========================================
// FACTIONS (القطاعات) - FULL DETAILED REPLICA SYSTEM
// ==========================================
let defaultFactionsData = [
  {
    id: 2,
    code: 'gov',
    name: 'الحكومة الفيدرالية للولايات',
    type: 'حكومي',
    typeIcon: 'fa-solid fa-landmark',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    themeColor: 'amber',
    borderColor: 'border-amber-500/30',
    cardBg: 'from-amber-950/40 via-[#0d1424] to-[#080d1a]',
    emblemBg: 'from-amber-600 to-amber-900',
    watermarkIcon: 'gov',
    members: 1,
    phone: '660',
    level: 1,
    newsCount: 0,
    hasHiringBadge: false,
    description: 'السلطة التنفيذية والتشريعية العليا في لوس سانتوس، مسؤولة عن إدارة ميزانية الدولة وإصدار القوانين وإدارة شؤون المواطنين والمرافق الكبرى ومتابعة سير عمل كافة الوزارات والهيئات الفيدرالية.',
    news: [
      {
        id: 101,
        title: '[عاجل]: مرسوم رئاسي بتعيين محمد الأسمري وزيراً للعدل وديفد بروك نائباً له وإعادة فتح المرفق القضائي',
        author: 'Reinhard Brock',
        time: 'منذ 18 ساعة',
        content: 'أصدر رئيس الجمهورية راينهارد بروك مرسوماً رئاسياً يقضي بتعيين السيد محمد الأسمري وزيراً للعدل عقب ثبوت استحقاقيته واجتيازه الاختبارات التأهيلية بنجاح، وتعيين السيد ديفد بروك نائباً لوزير العدل، مع إعلان إنهاء فترة تعليق أعمال السلطة القضائية واستئناف كافة المعاملات والمحاكمات الفيدرالية فوراً.',
        image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80'
      }
    ],
    leaders: [
      { name: 'Eyad', title: 'Temp Factions Team', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EyadGovVice&backgroundColor=ffd5dc', crown: true },
    ]
  },
  {
    id: 3,
    code: 'interior',
    name: 'وزارة الداخلية',
    type: 'قانوني',
    typeIcon: 'fa-solid fa-shield-halved',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    themeColor: 'blue',
    borderColor: 'border-blue-500/30',
    cardBg: 'from-blue-950/40 via-[#0a152b] to-[#080d1a]',
    emblemBg: 'from-blue-600 to-blue-900',
    watermarkIcon: 'police',
    members: 1,
    phone: '911',
    level: 1,
    newsCount: 188,
    hasHiringBadge: false,
    description: 'حفظ الأمن الداخلي وفرض النظام وتطبيق القانون، ملاحقة المطلوبين وتأمين الشوارع ومكافحة الجريمة المنظمة وتأمين سلامة كافة المواطنين.',
    news: [
      {
        id: 201,
        title: 'ميدان الرماية',
        author: "Cristian G'Hunter",
        time: 'منذ يوم',
        content: 'تدريب الرماية الخاص بالكاديتس وتأهيل الضباط على استخدام الأسلحة النارية الدقيقة وتكتيكات الاشتباك السريع لرفع الجاهزية الميدانية في مختلف الظروف الأمنية.',
        image: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=1200&q=80'
      }
    ],
    leaders: [
      { name: 'Eyad', title: 'Temp Factions Team', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DonBrock&backgroundColor=b6e3f4', crown: true },
    ]
  },
  {
    id: 4,
    code: 'swat',
    name: 'قوات التدخل السريع',
    type: 'قانوني',
    typeIcon: 'fa-solid fa-crosshairs',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    themeColor: 'indigo',
    borderColor: 'border-indigo-500/30',
    cardBg: 'from-slate-900/60 via-[#0e1320] to-[#080d1a]',
    emblemBg: 'from-slate-800 to-indigo-950',
    watermarkIcon: 'swat',
    members: 0,
    phone: '999',
    level: 1,
    newsCount: 0,
    hasHiringBadge: false,
    description: 'النخبة التكتيكية للاستجابة للمداهمات المسلحة، احتجاز الرهائن، وتفكيك الخلايا الإرهابية وأخطر عصابات المدينة.',
    news: [],
    leaders: [
      { name: 'Dew Brock', title: 'New Player / Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DewBrock&backgroundColor=d1d4f9', crown: true }
    ]
  },
  {
    id: 4,
    code: 'defense',
    name: 'وزارة الدفاع',
    type: 'قانوني',
    typeIcon: 'fa-solid fa-jet-fighter',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    themeColor: 'emerald',
    borderColor: 'border-emerald-500/30',
    cardBg: 'from-emerald-950/40 via-[#0f1a14] to-[#080d1a]',
    emblemBg: 'from-emerald-700 to-emerald-950',
    watermarkIcon: 'defense',
    members: 38,
    phone: '700',
    level: 1,
    newsCount: 154,
    hasHiringBadge: false,
    description: 'حماية الحدود الجوية والبحرية والبرية لولاية سان أندرياس، وتأمين المنشآت العسكرية الاستراتيجية وقاعدة إيستر باسين.',
    news: [
      {
        id: 401,
        title: 'مناورات عسكرية وتأمين القواعد الاستراتيجية',
        author: 'Mohamed Petrov',
        time: 'منذ يومين',
        content: 'اختتام التدريبات الجوية والبرية المشتركة وتأمين كافة المرافق الحيوية في الولاية، واختبار منظومة الدفاع الجوي والردع السريع.',
        image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80'
      }
    ],
    leaders: [
      { name: 'Eyad', title: 'Temp Factions Team', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MohamedPetrov&backgroundColor=ffd5dc', crown: true },
    ]
  },
  {
    id: 5,
    code: 'justice',
    name: 'وزارة العدل',
    type: 'حكومي',
    typeIcon: 'fa-solid fa-scale-balanced',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    themeColor: 'blue',
    borderColor: 'border-blue-400/30',
    cardBg: 'from-blue-950/40 via-[#0c1629] to-[#080d1a]',
    emblemBg: 'from-blue-700 to-indigo-950',
    watermarkIcon: 'justice',
    members: 22,
    phone: '611',
    level: 1,
    newsCount: 100,
    hasHiringBadge: true,
    description: 'تحقيق العدالة عبر المحاكمات الواقعية، الإشراف على قضايا المتهمين، صياغة الدستور وحماية حقوق الأفراد والمؤسسات وضمان سيادة القانون.',
    news: [
      {
        id: 501,
        title: 'وزارة العدل تعلن عن خطة جديدة لتطوير المنظومة القضائية وتعزيز الرقابة القانونية',
        author: 'David Brock',
        time: 'منذ يوم',
        content: 'أعلنت وزارة العدل عن إطلاق حزمة إصلاحات قانونية شاملة تهدف إلى تسريع البت في القضايا، وتعزيز نزاهة الإجراءات القضائية، وتطوير آليات التنسيق مع الأجهزة الأمنية لحماية الحقوق العامة والخاصة وضمان سير المحاكمات وفق أعلى المعايير الدستورية.',
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id: 502,
        title: 'بيان صادر عن معالي وزير العدل بشأن التحديثات الإجرائية',
        author: 'Scott X.River',
        time: 'منذ 3 أيام',
        content: 'أكد وزير العدل على استقلالية القضاء التامة والبدء في تطبيق اللائحة التنفيذية الجديدة لتقنين العقوبات البديلة والإفراج المشروط للملتزمين بالقوانين داخل السيرفر.',
        image: 'https://images.unsplash.com/photo-1453733197781-704fa598807a?auto=format&fit=crop&w=1200&q=80'
      }
    ],
    leaders: [
      { name: 'Mohammed Alasmri', title: 'وزير العدل', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MohammedAlasmri&backgroundColor=c0aede', crown: true },
      { name: 'David Brock', title: 'نائب وزير العدل', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DavidBrockJustice&backgroundColor=ffd5dc', crown: true },
      { name: 'Dogan Alomari', title: 'المدعي العام الفيدرالي', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DoganAlomari&backgroundColor=b6e3f4', crown: true },
      { name: "Sultan Bin'Abdulaziz", title: 'رئيس المحكمة العليا', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SultanSupreme&backgroundColor=d1d4f9', crown: true },
      { name: 'Evren Smith', title: 'Temp Factions Team', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EvrenJustice&backgroundColor=ffdfba', crown: true }
    ]
  },
  {
    id: 6,
    code: 'health',
    name: 'وزارة الصحة والدفاع المدني',
    type: 'طبي',
    typeIcon: 'fa-solid fa-truck-medical',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    themeColor: 'cyan',
    borderColor: 'border-cyan-500/30',
    cardBg: 'from-cyan-950/40 via-[#0a1c22] to-[#080d1a]',
    emblemBg: 'from-cyan-600 to-teal-900',
    watermarkIcon: 'health',
    members: 49,
    phone: '411',
    level: 1,
    newsCount: 107,
    hasHiringBadge: true,
    description: 'تقديم الرعاية الطبية الفورية، الإنعاش الميداني، مكافحة الحرائق وحوادث الطرق، وتأمين غرف العمليات على مدار 24 ساعة.',
    news: [
      {
        id: 601,
        title: 'بلاغ اختفاء موظف حكومي وتكثيف فرق الإسعاف الميداني',
        author: 'Zaki Walter',
        time: 'منذ يوم',
        content: 'تسيير فرق إسعافية متقدمة ودوريات إنقاذ للمسح الميداني بالتعاون مع الجهات المختصة، ورفع حالة التأهب بجميع المستشفيات وأقسام الطوارئ في الولاية.',
        image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80'
      }
    ],
    leaders: [
      { name: 'Abdou Alfahd', title: 'وزير الصحة', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AbdouAlfahd&backgroundColor=b6e3f4', crown: true },
      { name: 'Abdou U.River', title: 'نائب وزير الصحة', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AbdouRiver&backgroundColor=d1d4f9', crown: true },
      { name: 'Zaki Walter', title: 'مساعد وزير الصحة', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZakiWalter&backgroundColor=ffd5dc', crown: true },
      { name: 'Adem O.River', title: 'مشرف المنظومة الصحية', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdemRiver&backgroundColor=c0aede', crown: true },
      { name: 'Shaith Petrov', title: 'مسؤول فرق طبية وفرق دفاع مدني', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ShaithPetrov&backgroundColor=ffdfba', crown: true },
      { name: 'Rei Yamada', title: 'مسؤول الجراحين', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ReiYamada&backgroundColor=bae1ff', crown: true },
      { name: 'Hamza Italiano', title: 'مسؤول الأطباء', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HamzaItaliano&backgroundColor=baffc9', crown: true },
      { name: 'Taiko O.River', title: 'مسؤول المسعفين', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TaikoRiver&backgroundColor=ffb3ba', crown: true }
    ]
  },
  {
    id: 7,
    code: 'media',
    name: 'وزارة الثقافة والإعلام',
    type: 'إخبارية',
    typeIcon: 'fa-solid fa-bullhorn',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    themeColor: 'sky',
    borderColor: 'border-sky-500/30',
    cardBg: 'from-sky-950/40 via-[#0a182b] to-[#080d1a]',
    emblemBg: 'from-sky-600 to-slate-900',
    watermarkIcon: 'media',
    members: 23,
    phone: '456654',
    level: 1,
    newsCount: 98,
    hasHiringBadge: true,
    description: 'تغطية الأحداث الميدانية الحية، نقل تصريحات المسؤولين، إدارة الإذاعات وتنظيم المهرجانات والسباقات الرسمية في السيرفر.',
    news: [
      {
        id: 701,
        title: 'عين على المدينة: وزير الثقافة والإعلام يرصد نبض الشارع من الجو',
        author: 'Mohammed D.Italiano',
        time: 'منذ يوم',
        content: 'جولة جوية تفقدية لطائرة الهليكوبتر الإخبارية لرصد سير الفعاليات وحركة السير في أرجاء لوس سانتوس وتغطية الأحداث الميدانية الحية ونقل الصورة الكاملة لمواطني السيرفر.',
        image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80'
      }
    ],
    leaders: [
      { name: 'Mohammed D.Italiano', title: 'وزير الثقافة والإعلام', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MohammedItaliano&backgroundColor=ffd5dc', crown: true },
      { name: 'Bilal Italiano', title: 'نائب وزير الثقافة والإعلام', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BilalItaliano&backgroundColor=d1d4f9', crown: true },
      { name: 'Evren Smith', title: 'Temp Factions Team', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EvrenMedia&backgroundColor=b6e3f4', crown: true }
    ]
  },
  {
    id: 8,
    code: 'towing',
    name: 'شركة السحب والصيانة',
    type: 'مرور',
    typeIcon: 'fa-solid fa-wrench',
    badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30',
    themeColor: 'green',
    borderColor: 'border-green-500/30',
    cardBg: 'from-green-950/40 via-[#071d11] to-[#080d1a]',
    emblemBg: 'from-green-600 to-emerald-950',
    watermarkIcon: 'towing',
    members: 35,
    phone: '711',
    level: 1,
    newsCount: 72,
    hasHiringBadge: false,
    description: 'سحب المركبات المعطلة والمخالفة، صيانة وتعديل السيارات، وفحص السلامة المرورية على الطرق السريعة.',
    news: [
      {
        id: 801,
        title: 'يرجى من جميع املاوطنين عدم حضور المواطنين للشركة',
        author: 'Youcef Alomari',
        time: 'منذ 3 ساعة',
        content: 'تم اغلاق الورشة كلها والشركة كلها و ذلك يترتب في إغلاق بي معدات إصلاح السيارات و إغلاق الورشة و إغلاق كراج تعديل السيارات ولقد تم توقيف جميع عمليات حجز السيارات ونريد من كل المواطنين عدم القدوم إلى الشركة ونتمنى التوفيق للجميع',
        image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80'
      }
    ],
    leaders: [
      { name: 'Eyad', title: 'رئيس شركة السحب والصيانة', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EyadTowingPresident&backgroundColor=ffd5dc', crown: true },
      { name: 'Youcef Alomari', title: 'نائب رئيس السحب والصيانة', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YoucefAlomari&backgroundColor=d1d4f9', crown: true },
      { name: 'Jasper Anderson', title: 'مساعد رئيس السحب والصيانة', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JasperAnderson&backgroundColor=b6e3f4', crown: true },
      { name: 'Abood Aliraqi', title: 'مسؤول الميكانيكيين', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AboodAliraqi&backgroundColor=c0aede', crown: true },
      { name: 'Majed Brock', title: 'مسؤول الميكانيكيين', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MajedBrockMech&backgroundColor=ffdfba', crown: true },
      { name: 'Dhoom Alasmri', title: 'مسؤول ضباط السحب', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DhoomAlasmri&backgroundColor=bae1ff', crown: true }
    ]
  },
  {
    id: 9,
    code: 'electricity',
    name: 'وزارة الكهرباء والطاقة',
    type: 'كهرباء',
    typeIcon: 'fa-solid fa-bolt-lightning',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    themeColor: 'amber',
    borderColor: 'border-amber-500/30',
    cardBg: 'from-amber-950/40 via-[#1c1306] to-[#080d1a]',
    emblemBg: 'from-amber-600 to-yellow-950',
    watermarkIcon: 'electricity',
    members: 21,
    phone: '211',
    level: 38,
    newsCount: 79,
    hasHiringBadge: true,
    description: 'تأمين شبكة الكهرباء والمحطات الرئيسية ومصادر الطاقة، وإصلاح انقطاعات التيار في منشآت ومنازل المدينة.',
    news: [
      {
        id: 901,
        title: 'وزارة الكهرباء والطاقة تنفذ أعمال صيانة عاجلة لأعمدة الإنارة في لاس كوليناس',
        author: 'Sara Elmasry',
        time: 'منذ 6 يوم',
        content: 'ضمن خطة وزارة الكهرباء والطاقة لرفع كفاءة شبكات الإنارة وتحسين مستوى الخدمة بالأحياء السكنية، نفذت الفرق الفنية أعمال صيانة لعدد من أعمدة الإنارة في منطقة Las Colinas. وشملت الأعمال فحص وحدات الإضاءة، مراجعة الكابلات والتوصيلات الكهربائية، صيانة لوحات التغذية، واستبدال الأجزاء المتضررة، إلى جانب اختبار الأعمدة بعد انتهاء الصيانة للتأكد من عودتها للعمل بصورة مستقرة وآمنة.',
        image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80'
      }
    ],
    leaders: [
      { name: 'Sara Elmasry', title: 'وزير الطاقة والكهرباء', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SaraElmasry&backgroundColor=ffd5dc', crown: true },
      { name: 'Ahmd Emad', title: 'نائب وزير الطاقة والكهرباء', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AhmdEmad&backgroundColor=d1d4f9', crown: true },
      { name: 'Adham Walton', title: 'المدير العام', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdhamWalton&backgroundColor=b6e3f4', crown: true },
      { name: 'Jason Ravenhall', title: 'نائب المدير العام', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JasonRavenhall&backgroundColor=c0aede', crown: true },
      { name: 'Ali Ravenhall', title: 'مسؤول الموارد البشرية', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AliRavenhall&backgroundColor=ffdfba', crown: true },
      { name: 'Theo Moriarty', title: 'مسؤول خطوط الكهرباء والخدمات', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TheoMoriarty&backgroundColor=bae1ff', crown: true }
    ]
  },
  {
    id: 10,
    code: 'fbi',
    name: 'مكتب التحقيقات الفيدرالي',
    type: 'قانوني',
    typeIcon: 'fa-solid fa-fingerprint',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    themeColor: 'indigo',
    borderColor: 'border-indigo-500/30',
    cardBg: 'from-indigo-950/40 via-[#0a1226] to-[#080d1a]',
    emblemBg: 'from-slate-800 to-black',
    watermarkIcon: 'fbi',
    members: 47,
    phone: '5324',
    level: 1,
    newsCount: 139,
    hasHiringBadge: false,
    description: 'التحقيقات السرية، كشف الفساد في الأجهزة الحكومية، العمليات الاستخباراتية وتتبع كبار تجار السلاح والمخدرات.',
    news: [
      {
        id: 1001,
        title: 'مهمة ميدانية للبحث عن موظف حكومي مفقود',
        author: 'Ayoub Walton',
        time: 'منذ 19 ساعة',
        content: 'باشرت الجهات المختصة مهمة ميدانية للبحث عن أحد الموظفين الحكوميين بعد ورود بلاغ عن اختفائه، حيث جرى تنظيم تحرك ميداني بمشاركة أفراد من الجهات المعنية، مع اتخاذ الإجراءات اللازمة لجمع المعلومات والتحقق من ملابسات الاختفاء.',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80'
      }
    ],
    leaders: [
      { name: 'Brahim Alwahrani', title: 'Executive Director', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BrahimAlwahrani&backgroundColor=ffdfba', crown: true },
      { name: 'Eyad Dostoevsky', title: 'Assistant Director', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EyadDostoevsky&backgroundColor=ffd5dc', crown: true },
      { name: 'Jeffrey Petrov', title: 'Assistant Director', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JeffreyPetrov&backgroundColor=b6e3f4', crown: true },
      { name: 'Ayoub Walton', title: 'Chief of Staff', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AyoubWalton&backgroundColor=d1d4f9', crown: true },
      { name: 'Kenan Alwahrani', title: 'Commander', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KenanAlwahrani&backgroundColor=c0aede', crown: true },
      { name: 'Jonathan Christopher', title: 'Temp Factions Team', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JonathanChristopher&backgroundColor=bae1ff', crown: true }
    ]
  },
  {
    id: 11,
    code: 'port',
    name: 'أمن موانئ لوس سانتوس',
    type: 'حكومي',
    typeIcon: 'fa-solid fa-anchor',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    themeColor: 'teal',
    borderColor: 'border-teal-500/30',
    cardBg: 'from-teal-950/40 via-[#071c21] to-[#080d1a]',
    emblemBg: 'from-teal-700 to-blue-950',
    watermarkIcon: 'port',
    members: 32,
    phone: '880',
    level: 1,
    newsCount: 67,
    hasHiringBadge: true,
    description: 'حماية الموانئ التجارية وتفتيش حاويات الشحن البحري، وتأمين المياه الإقليمية ومكافحة التهريب البحري.',
    news: [
      {
        id: 1101,
        title: 'اعلان هام',
        author: 'Idriss D.Walton',
        time: 'منذ 17 ساعة',
        content: 'يشهد قطاع أمن الموانئ حالة من التغييرات الإدارية، وقد تم عمل ترشيح على رتبتين قياديتين ويتم مراجعة الترشيحات، ونذكر القطاع أن فرص الوصول لرتب عالية كبيرة جداً مع سهولة الترقيات ورتب شاغرة، القطاع في حالة تحسن ونأمل أن يتحسن أكثر للحفاظ على أمن الدولة',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'
      }
    ],
    leaders: [
      { name: 'Idriss D.Walton', title: 'Chief Of Port Police', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IdrissWalton&backgroundColor=ffd5dc', crown: true },
      { name: 'Mostafa Alhashimi', title: 'Deputy Chief Of Port Police', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MostafaAlhashimi&backgroundColor=ffdfba', crown: true },
      { name: 'Ibrahim Walton', title: 'Assistant Chief Of Port Police', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IbrahimWalton&backgroundColor=b6e3f4', crown: true },
      { name: 'Abdulsamad O.River', title: 'Director Of Operations', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AbdulsamadRiver&backgroundColor=d1d4f9', crown: true },
      { name: 'Alejandro De.Medici', title: 'Commander', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlejandroMedici&backgroundColor=c0aede', crown: true },
      { name: 'David De.Medici', title: 'Commander', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DavidMedici&backgroundColor=bae1ff', crown: true },
      { name: 'Mia Wolf', title: 'Colonel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MiaWolf&backgroundColor=ffb3ba', crown: true },
      { name: 'Patric O.River', title: 'Colonel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PatricRiver&backgroundColor=baffc9', crown: true },
      { name: 'Abdullah Walton', title: 'Major', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AbdullahPortMajor&backgroundColor=ffd5dc', crown: true },
      { name: 'Marcus Italiano', title: 'Captain', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusItaliano&backgroundColor=ffdfba', crown: true },
      { name: 'Evren Smith', title: 'Admin / New Player', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EvrenPortSmith&backgroundColor=b6e3f4', crown: true }
    ]
  }
];

let factionsData = defaultFactionsData;
let currentFactionId = 1;
let currentFactionSubtab = 'news';
let factionsViewMode = 'list';

function saveFactionsData() {
  localStorage.setItem(STORAGE.FACTIONS, JSON.stringify(factionsData));
}

// Generates scalable authentic official seal matching the screenshot emblem
function getFactionSealSVG(faction) {
  const code = faction.code || 'gov';

  // 1. Government (الرئاسة الفيدرالية)
  if (code === 'gov') {
    return `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="sealGoldGov" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="60%" stop-color="#eab308"/>
            <stop offset="100%" stop-color="#713f12"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="#080e1c" stroke="url(#sealGoldGov)" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#sealGoldGov)" stroke-width="0.8" stroke-dasharray="2 1.5"/>
        <circle cx="50" cy="50" r="39" fill="#0b1730" stroke="url(#sealGoldGov)" stroke-width="1.2"/>
        <g fill="#facc15">
          <circle cx="50" cy="15" r="1.5"/><circle cx="28" cy="22" r="1.3"/><circle cx="72" cy="22" r="1.3"/>
          <circle cx="16" cy="42" r="1.3"/><circle cx="84" cy="42" r="1.3"/><circle cx="22" cy="65" r="1.3"/>
          <circle cx="78" cy="65" r="1.3"/><circle cx="36" cy="81" r="1.3"/><circle cx="64" cy="81" r="1.3"/>
        </g>
        <g fill="url(#sealGoldGov)">
          <path d="M50 24 L56 32 L68 31 L60 40 L64 50 L50 44 L36 50 L40 40 L32 31 L44 32 Z" opacity="0.95"/>
          <path d="M43 45 L50 41 L57 45 L55 54 L50 58 L45 54 Z" fill="#0a1224" stroke="url(#sealGoldGov)" stroke-width="1"/>
          <line x1="48" y1="46" x2="48" y2="55" stroke="#facc15" stroke-width="0.8"/>
          <line x1="52" y1="46" x2="52" y2="55" stroke="#facc15" stroke-width="0.8"/>
        </g>
        <path id="govTopPath" d="M18 50 A32 32 0 0 1 82 50" fill="none"/>
        <text font-size="4.2" font-weight="900" fill="#fef08a" letter-spacing="1">
          <textPath href="#govTopPath" startOffset="50%" text-anchor="middle">AL-AZAYZAH RP</textPath>
        </text>
        <path id="govBtmPath" d="M82 50 A32 32 0 0 1 18 50" fill="none"/>
        <text font-size="3.5" font-weight="700" fill="#facc15" letter-spacing="0.8">
          <textPath href="#govBtmPath" startOffset="50%" text-anchor="middle">OFFICIAL GOVERNMENT</textPath>
        </text>
      </svg>
    `;
  }

  // 2. Interior / Police (وزارة الداخلية)
  if (code === 'interior') {
    return `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="policeBlueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e3a8a"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="policeGoldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="url(#policeBlueGrad)" stroke="url(#policeGoldGrad)" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="40" fill="#0a1226" stroke="#3b82f6" stroke-width="1.2"/>
        <!-- Police Shield -->
        <path d="M50 20 L68 28 C68 48 50 64 50 64 C50 64 32 48 32 28 Z" fill="#1e3a8a" stroke="url(#policeGoldGrad)" stroke-width="1.5"/>
        <!-- 8-Point Gold Star -->
        <polygon points="50,26 53,35 62,35 55,40 58,49 50,44 42,49 45,40 38,35 47,35" fill="url(#policeGoldGrad)"/>
        <!-- Star Center Badge -->
        <circle cx="50" cy="38" r="4" fill="#0f172a" stroke="url(#policeGoldGrad)" stroke-width="0.8"/>
        <path id="policeTopPath" d="M18 50 A32 32 0 0 1 82 50" fill="none"/>
        <text font-size="3.8" font-weight="900" fill="#fef08a" letter-spacing="0.8">
          <textPath href="#policeTopPath" startOffset="50%" text-anchor="middle">POLICE DEPARTMENT</textPath>
        </text>
        <path id="policeBtmPath" d="M82 50 A32 32 0 0 1 18 50" fill="none"/>
        <text font-size="3.2" font-weight="700" fill="#93c5fd" letter-spacing="0.6">
          <textPath href="#policeBtmPath" startOffset="50%" text-anchor="middle">LOS SANTOS POLICE</textPath>
        </text>
      </svg>
    `;
  }

  // 3. SWAT (قوات التدخل السريع)
  if (code === 'swat') {
    return `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="47" fill="#0a0e1a" stroke="#6366f1" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="40" fill="#111827" stroke="#4f46e5" stroke-width="1" stroke-dasharray="3 2"/>
        <!-- Crosshairs -->
        <line x1="50" y1="12" x2="50" y2="28" stroke="#818cf8" stroke-width="1.5"/>
        <line x1="50" y1="72" x2="50" y2="88" stroke="#818cf8" stroke-width="1.5"/>
        <line x1="12" y1="50" x2="28" y2="50" stroke="#818cf8" stroke-width="1.5"/>
        <line x1="72" y1="50" x2="88" y2="50" stroke="#818cf8" stroke-width="1.5"/>
        <!-- Eagle Crest -->
        <path d="M50 30 L58 40 L68 38 L60 48 L64 58 L50 52 L36 58 L40 48 L32 38 L42 40 Z" fill="#818cf8" opacity="0.9"/>
        <circle cx="50" cy="50" r="14" fill="none" stroke="#a5b4fc" stroke-width="1"/>
        <text x="50" y="68" font-size="6.5" font-weight="900" fill="#e0e7ff" text-anchor="middle" letter-spacing="1">S.W.A.T</text>
      </svg>
    `;
  }

  // 4. Defense (وزارة الدفاع)
  if (code === 'defense') {
    return `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="defGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#ca8a04"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="#0f1b13" stroke="url(#defGold)" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="41" fill="#14261b" stroke="#16a34a" stroke-width="1"/>
        <!-- Defense Eagle with crossed swords -->
        <g fill="url(#defGold)">
          <path d="M50 24 L56 32 L68 31 L60 40 L64 50 L50 44 L36 50 L40 40 L32 31 L44 32 Z"/>
          <!-- Crossed swords -->
          <line x1="38" y1="46" x2="62" y2="64" stroke="url(#defGold)" stroke-width="1.8"/>
          <line x1="62" y1="46" x2="38" y2="64" stroke="url(#defGold)" stroke-width="1.8"/>
        </g>
        <path id="defTopPath" d="M18 50 A32 32 0 0 1 82 50" fill="none"/>
        <text font-size="3.6" font-weight="900" fill="#fef08a" letter-spacing="0.6">
          <textPath href="#defTopPath" startOffset="50%" text-anchor="middle">MINISTRY OF DEFENSE</textPath>
        </text>
        <path id="defBtmPath" d="M82 50 A32 32 0 0 1 18 50" fill="none"/>
        <text font-size="3.2" font-weight="700" fill="#86efac" letter-spacing="0.6">
          <textPath href="#defBtmPath" startOffset="50%" text-anchor="middle">AL-AZAYZAH FORCES</textPath>
        </text>
      </svg>
    `;
  }

  // 5. Justice (وزارة العدل)
  if (code === 'justice') {
    return `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="justGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="#0b1329" stroke="url(#justGold)" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="41" fill="#0f172a" stroke="#3b82f6" stroke-width="1"/>
        <!-- Scales of Justice -->
        <g stroke="url(#justGold)" stroke-width="1.5" fill="none">
          <line x1="50" y1="28" x2="50" y2="62"/>
          <line x1="34" y1="36" x2="66" y2="36"/>
          <!-- Left pan -->
          <line x1="34" y1="36" x2="28" y2="48"/><line x1="34" y1="36" x2="40" y2="48"/>
          <!-- Right pan -->
          <line x1="66" y1="36" x2="60" y2="48"/><line x1="66" y1="36" x2="72" y2="48"/>
        </g>
        <path d="M26 48 Q34 54 42 48 Z" fill="url(#justGold)"/>
        <path d="M58 48 Q66 54 74 48 Z" fill="url(#justGold)"/>
        <!-- Base pedestal -->
        <rect x="42" y="60" width="16" height="4" rx="2" fill="url(#justGold)"/>
        <path id="justTopPath" d="M18 50 A32 32 0 0 1 82 50" fill="none"/>
        <text font-size="3.6" font-weight="900" fill="#fef08a" letter-spacing="0.6">
          <textPath href="#justTopPath" startOffset="50%" text-anchor="middle">MINISTRY OF JUSTICE</textPath>
        </text>
        <path id="justBtmPath" d="M82 50 A32 32 0 0 1 18 50" fill="none"/>
        <text font-size="3" font-weight="700" fill="#93c5fd" letter-spacing="0.5">
          <textPath href="#justBtmPath" startOffset="50%" text-anchor="middle">SUPREME COURT</textPath>
        </text>
      </svg>
    `;
  }

  // 6. Health & Civil Defense (وزارة الصحة والدفاع المدني)
  if (code === 'health') {
    return `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="47" fill="#082026" stroke="#06b6d4" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="41" fill="#0e2a33" stroke="#14b8a6" stroke-width="1"/>
        <!-- Star of Life / Medical Cross -->
        <g fill="#22d3ee">
          <rect x="45" y="26" width="10" height="36" rx="2"/>
          <rect x="32" y="39" width="36" height="10" rx="2"/>
        </g>
        <!-- Caduceus Serpent / Rescue Flame in Center -->
        <circle cx="50" cy="44" r="6" fill="#082026" stroke="#facc15" stroke-width="1.2"/>
        <path d="M50 36 C48 40 46 44 50 48 C54 52 50 56 50 56" stroke="#facc15" stroke-width="1.5" fill="none"/>
        <path id="medTopPath" d="M18 50 A32 32 0 0 1 82 50" fill="none"/>
        <text font-size="3.5" font-weight="900" fill="#67e8f9" letter-spacing="0.6">
          <textPath href="#medTopPath" startOffset="50%" text-anchor="middle">HEALTH &amp; CIVIL DEFENSE</textPath>
        </text>
        <path id="medBtmPath" d="M82 50 A32 32 0 0 1 18 50" fill="none"/>
        <text font-size="3.2" font-weight="700" fill="#a5f3fc" letter-spacing="0.6">
          <textPath href="#medBtmPath" startOffset="50%" text-anchor="middle">LOS SANTOS EMS</textPath>
        </text>
      </svg>
    `;
  }

  // 7. Media & Culture (وزارة الثقافة والإعلام)
  if (code === 'media') {
    return `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="47" fill="#0a192f" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="41" fill="#0f172a" stroke="#0284c7" stroke-width="1"/>
        <!-- Globe Grid -->
        <circle cx="50" cy="46" r="15" fill="#0369a1" stroke="#38bdf8" stroke-width="1.2"/>
        <ellipse cx="50" cy="46" rx="7" ry="15" fill="none" stroke="#7dd3fc" stroke-width="0.8"/>
        <line x1="35" y1="46" x2="65" y2="46" stroke="#7dd3fc" stroke-width="0.8"/>
        <!-- Broadcast Satellite Waves -->
        <path d="M28 32 A26 26 0 0 1 72 32" fill="none" stroke="#facc15" stroke-width="1.5" stroke-dasharray="2 2"/>
        <path id="mediaTopPath" d="M18 50 A32 32 0 0 1 82 50" fill="none"/>
        <text font-size="3.3" font-weight="900" fill="#bae6fd" letter-spacing="0.6">
          <textPath href="#mediaTopPath" startOffset="50%" text-anchor="middle">INFORMATION &amp; PRESS</textPath>
        </text>
        <path id="mediaBtmPath" d="M82 50 A32 32 0 0 1 18 50" fill="none"/>
        <text font-size="3" font-weight="700" fill="#7dd3fc" letter-spacing="0.6">
          <textPath href="#mediaBtmPath" startOffset="50%" text-anchor="middle">AL-AZAYZAH MEDIA</textPath>
        </text>
      </svg>
    `;
  }

  // 8. Towing & Maintenance (شركة السحب والصيانة - Matching Screenshot 1)
  if (code === 'towing') {
    return `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="47" fill="#061e12" stroke="#22c55e" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="41" fill="#052e16" stroke="#16a34a" stroke-width="1.2"/>
        <circle cx="50" cy="48" r="22" fill="#022c22" stroke="#4ade80" stroke-width="1"/>
        <!-- Tow Truck Silhouette -->
        <g fill="#4ade80">
          <!-- Truck Cabin -->
          <path d="M36 50 L42 42 L52 42 L54 50 Z"/>
          <!-- Truck Bed & Boom Crane -->
          <rect x="52" y="44" width="16" height="6" rx="1"/>
          <!-- Crane Arm -->
          <line x1="56" y1="44" x2="68" y2="34" stroke="#86efac" stroke-width="2"/>
          <line x1="68" y1="34" x2="68" y2="42" stroke="#facc15" stroke-width="1.2"/>
          <!-- Chassis & Wheels -->
          <rect x="34" y="50" width="34" height="4"/>
          <circle cx="40" cy="55" r="3.5" fill="#052e16" stroke="#4ade80" stroke-width="1.5"/>
          <circle cx="62" cy="55" r="3.5" fill="#052e16" stroke="#4ade80" stroke-width="1.5"/>
        </g>
        <path id="towTopPath" d="M18 50 A32 32 0 0 1 82 50" fill="none"/>
        <text font-size="3.2" font-weight="900" fill="#86efac" letter-spacing="0.6">
          <textPath href="#towTopPath" startOffset="50%" text-anchor="middle">TOWING &amp; MAINTENANCE</textPath>
        </text>
        <path id="towBtmPath" d="M82 50 A32 32 0 0 1 18 50" fill="none"/>
        <text font-size="3" font-weight="700" fill="#4ade80" letter-spacing="0.6">
          <textPath href="#towBtmPath" startOffset="50%" text-anchor="middle">AL-AZAYZAH RP</textPath>
        </text>
      </svg>
    `;
  }

  // 9. Electricity & Energy (وزارة الكهرباء والطاقة - Matching Screenshot 3)
  if (code === 'electricity') {
    return `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="47" fill="#1c1306" stroke="#eab308" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="41" fill="#0f2615" stroke="#22c55e" stroke-width="1.2"/>
        <!-- Shield & High Voltage Lightning Bolt -->
        <path d="M50 24 L66 32 C66 48 50 62 50 62 C50 62 34 48 34 32 Z" fill="#14532d" stroke="#facc15" stroke-width="1.2"/>
        <!-- Yellow Lightning Bolt -->
        <polygon points="52,28 42,42 49,42 46,58 58,40 51,40" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>
        <path id="elecTopPath" d="M18 50 A32 32 0 0 1 82 50" fill="none"/>
        <text font-size="3.2" font-weight="900" fill="#fef08a" letter-spacing="0.5">
          <textPath href="#elecTopPath" startOffset="50%" text-anchor="middle">MINISTRY OF ELECTRICITY</textPath>
        </text>
        <path id="elecBtmPath" d="M82 50 A32 32 0 0 1 18 50" fill="none"/>
        <text font-size="3" font-weight="700" fill="#86efac" letter-spacing="0.5">
          <textPath href="#elecBtmPath" startOffset="50%" text-anchor="middle">CITY OF LOS SANTOS</textPath>
        </text>
      </svg>
    `;
  }

  // 10. FBI (مكتب التحقيقات الفيدرالي - Matching Screenshot 1)
  if (code === 'fbi') {
    return `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fbiGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#ca8a04"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="#081024" stroke="url(#fbiGold)" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="41" fill="#0f172a" stroke="#1d4ed8" stroke-width="1.2"/>
        <!-- Central Striped Shield -->
        <path d="M50 26 L64 33 C64 48 50 60 50 60 C50 60 36 48 36 33 Z" fill="#1e3a8a" stroke="url(#fbiGold)" stroke-width="1.5"/>
        <!-- Red and White Stripes -->
        <g>
          <rect x="42" y="38" width="3" height="15" fill="#ef4444"/>
          <rect x="45" y="38" width="3" height="17" fill="#f8fafc"/>
          <rect x="48" y="38" width="4" height="18" fill="#ef4444"/>
          <rect x="52" y="38" width="3" height="17" fill="#f8fafc"/>
          <rect x="55" y="38" width="3" height="15" fill="#ef4444"/>
          <rect x="40" y="34" width="20" height="5" fill="#1e40af"/>
        </g>
        <path id="fbiTopPath" d="M18 50 A32 32 0 0 1 82 50" fill="none"/>
        <text font-size="3.2" font-weight="900" fill="#fef08a" letter-spacing="0.5">
          <textPath href="#fbiTopPath" startOffset="50%" text-anchor="middle">FEDERAL BUREAU OF INVESTIGATION</textPath>
        </text>
        <path id="fbiBtmPath" d="M82 50 A32 32 0 0 1 18 50" fill="none"/>
        <text font-size="2.9" font-weight="700" fill="#93c5fd" letter-spacing="0.5">
          <textPath href="#fbiBtmPath" startOffset="50%" text-anchor="middle">DEPARTMENT OF JUSTICE</textPath>
        </text>
      </svg>
    `;
  }

  // 11. Port Security (أمن موانئ لوس سانتوس - Matching Screenshot 3)
  if (code === 'port') {
    return `
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="47" fill="#04232c" stroke="#14b8a6" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="41" fill="#083344" stroke="#2dd4bf" stroke-width="1.2" stroke-dasharray="3 2"/>
        <!-- Ship Anchor in Center -->
        <g stroke="#f0fdfa" stroke-width="2.4" fill="none" stroke-linecap="round">
          <!-- Vertical shaft -->
          <line x1="50" y1="26" x2="50" y2="58"/>
          <!-- Top ring -->
          <circle cx="50" cy="24" r="3.5" fill="none"/>
          <!-- Crossbar -->
          <line x1="42" y1="33" x2="58" y2="33"/>
          <!-- Curved Fluke -->
          <path d="M34 46 C34 60 66 60 66 46"/>
          <!-- Arrow points -->
          <path d="M31 48 L34 44 L37 48" fill="#f0fdfa"/>
          <path d="M63 48 L66 44 L69 48" fill="#f0fdfa"/>
        </g>
        <path id="portTopPath" d="M18 50 A32 32 0 0 1 82 50" fill="none"/>
        <text font-size="3.5" font-weight="900" fill="#a7f3d0" letter-spacing="0.6">
          <textPath href="#portTopPath" startOffset="50%" text-anchor="middle">PORT SECURITY</textPath>
        </text>
        <path id="portBtmPath" d="M82 50 A32 32 0 0 1 18 50" fill="none"/>
        <text font-size="3.2" font-weight="700" fill="#2dd4bf" letter-spacing="0.6">
          <textPath href="#portBtmPath" startOffset="50%" text-anchor="middle">WNASH TIME</textPath>
        </text>
      </svg>
    `;
  }

  // Fallback
  return `
    <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#0c1322" stroke="#eab308" stroke-width="2"/>
      <circle cx="50" cy="50" r="20" fill="#1e293b"/>
      <text x="50" y="55" font-size="12" fill="#facc15" text-anchor="middle" font-weight="bold">RP</text>
    </svg>
  `;
}

// Switch between subtabs (News / Description / Leaders)
function switchFactionSubtab(subtabId) {
  sound.playClick();
  currentFactionSubtab = subtabId;

  // Update Buttons
  document.querySelectorAll('.fsubtab-btn').forEach(btn => {
    btn.classList.remove('active', 'text-amber-400', 'bg-amber-500/10', 'border', 'border-amber-500/30');
    btn.classList.add('text-gray-400');
  });

  const activeBtn = document.getElementById(`fsubtab-btn-${subtabId}`);
  if (activeBtn) {
    activeBtn.classList.remove('text-gray-400');
    activeBtn.classList.add('active', 'text-amber-400', 'bg-amber-500/10', 'border', 'border-amber-500/30');
  }

  // Update Contents
  document.querySelectorAll('.fsubtab-content').forEach(content => {
    content.classList.add('hidden');
  });

  const activeContent = document.getElementById(`fsubtab-content-${subtabId}`);
  if (activeContent) {
    activeContent.classList.remove('hidden');
  }
}

// Toggle between Detailed View and Grid List View
function toggleFactionsView(mode) {
  sound.playClick();
  const detailPage = document.getElementById('faction-detail-page');
  const listPage = document.getElementById('factions-list-page');
  const backBtn = document.getElementById('factions-back-btn');
  const toggleBtnText = document.getElementById('btn-toggle-factions-text');

  if (mode === 'toggle') {
    factionsViewMode = factionsViewMode === 'detail' ? 'list' : 'detail';
  } else {
    factionsViewMode = mode;
  }

  if (factionsViewMode === 'list') {
    if (detailPage) detailPage.classList.add('hidden');
    if (listPage) listPage.classList.remove('hidden');
    if (backBtn) backBtn.classList.add('hidden');
    if (toggleBtnText) toggleBtnText.innerText = 'عرض تفاصيل القطاع';
    renderFactionsGrid();
  } else {
    if (detailPage) detailPage.classList.remove('hidden');
    if (listPage) listPage.classList.add('hidden');
    if (backBtn) backBtn.classList.remove('hidden');
    if (toggleBtnText) toggleBtnText.innerText = 'تصفح الكل (11)';
    renderFactionDetailPage(currentFactionId);
  }
}

function openFactionDetail(id) {
  currentFactionId = parseInt(id) || 1;
  factionsViewMode = 'detail';
  toggleFactionsView('detail');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchFactionById(id) {
  currentFactionId = parseInt(id) || 1;
  renderFactionDetailPage(currentFactionId);
}

// Render the Detailed Single Faction Page (Exact Screenshot Replica)
function renderFactionDetailPage(id = 1) {
  const faction = factionsData.find(f => f.id === parseInt(id)) || factionsData[0];
  currentFactionId = faction.id;

  // 1. Breadcrumb & Title
  const breadcrumbEl = document.getElementById('breadcrumb-faction-name');
  if (breadcrumbEl) breadcrumbEl.innerText = faction.name;

  const titleEl = document.getElementById('detail-faction-name');
  if (titleEl) titleEl.innerText = faction.name;

  // 2. Badges Container (Primary Category + Hiring Badge if open)
  const badgeText = document.getElementById('detail-faction-type-text');
  const badgeIcon = document.getElementById('detail-faction-badge-icon');
  const badgeWrapper = document.getElementById('detail-faction-type');
  if (badgeText) badgeText.innerText = faction.type;
  if (badgeIcon) badgeIcon.className = `${faction.typeIcon || 'fa-solid fa-landmark'} text-xs`;
  if (badgeWrapper) badgeWrapper.className = `px-3.5 py-1 rounded-full text-xs font-bold ${faction.badgeColor || 'bg-amber-500/15 text-amber-400 border-amber-500/30'} flex items-center gap-1.5 shadow-sm`;

  // Hiring Badge
  let hiringBadgeEl = document.getElementById('detail-faction-hiring-badge');
  if (!hiringBadgeEl && badgeWrapper && badgeWrapper.parentElement) {
    hiringBadgeEl = document.createElement('span');
    hiringBadgeEl.id = 'detail-faction-hiring-badge';
    badgeWrapper.parentElement.appendChild(hiringBadgeEl);
  }
  if (hiringBadgeEl) {
    if (faction.hasHiringBadge) {
      hiringBadgeEl.className = 'px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm';
      hiringBadgeEl.innerHTML = '<i class="fa-regular fa-circle-check text-xs"></i><span>التوظيف مفتوح</span>';
      hiringBadgeEl.classList.remove('hidden');
    } else {
      hiringBadgeEl.classList.add('hidden');
    }
  }

  // 3. Stats Widget Bar (الأعضاء / الهاتف / المستوى)
  const membersEl = document.getElementById('detail-members-count');
  if (membersEl) membersEl.innerText = faction.members;

  const phoneEl = document.getElementById('detail-phone-number');
  if (phoneEl) phoneEl.innerText = faction.phone || '911';

  const levelEl = document.getElementById('detail-level-number');
  if (levelEl) levelEl.innerText = faction.level;

  // 4. Seal Emblem Container
  const sealContainer = document.getElementById('detail-faction-seal-container');
  if (sealContainer) sealContainer.innerHTML = getFactionSealSVG(faction);

  // 5. Counters on Subtabs
  const newsCounter = document.getElementById('fsubtab-news-count');
  if (newsCounter) newsCounter.innerText = faction.newsCount !== undefined ? faction.newsCount : faction.news.length;

  const leadersCounter = document.getElementById('fsubtab-leaders-count');
  if (leadersCounter) leadersCounter.innerText = faction.leaders.length;

  // 6. Quick Selector Dropdown
  const selector = document.getElementById('faction-quick-selector');
  if (selector) {
    selector.innerHTML = factionsData.map(f => `
      <option value="${f.id}" ${f.id === faction.id ? 'selected' : ''}>${f.name}</option>
    `).join('');
  }

  // 7. Render Subtab 1: News (Exact Screenshot Match)
  const newsListContainer = document.getElementById('faction-news-list');
  if (newsListContainer) {
    if (!faction.news || faction.news.length === 0) {
      newsListContainer.innerHTML = `
        <div class="py-12 text-center text-gray-500">
          <i class="fa-regular fa-newspaper text-4xl mb-3 block opacity-30"></i>
          لا توجد بيانات أو أخبار منشورة لهذا القطاع حالياً. يمكنك الضغط على "نشر خبر جديد" لنشر أول بيان رسمي!
        </div>
      `;
    } else {
      newsListContainer.innerHTML = faction.news.map(n => `
        <article class="p-6 sm:p-8 rounded-2xl bg-[#090e1a]/80 border border-white/10 hover:border-amber-500/30 transition-all shadow-xl group/article">
          <!-- Top Row: Headline + Delete News Button -->
          <div class="flex items-start justify-between gap-4 mb-2.5">
            <div class="flex items-start gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 mt-2 flex-shrink-0 animate-pulse shadow-md shadow-amber-400/50"></span>
              <h4 class="text-base sm:text-lg font-bold text-white leading-snug tracking-wide">
                ${n.title}
              </h4>
            </div>

            <!-- Delete News Button -->
            <button 
              onclick="deleteFactionNews(${faction.id}, ${n.id})" 
              title="حذف هذا الخبر"
              class="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/25 text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm"
            >
              <i class="fa-solid fa-trash-can text-xs"></i>
              <span>حذف الخبر</span>
            </button>
          </div>

          <!-- Author and Timestamp -->
          <div class="text-xs text-gray-400 mr-5 mb-4 flex items-center gap-2">
            <span class="text-indigo-400 font-semibold">${n.author}</span>
            <span>•</span>
            <span class="flex items-center gap-1"><i class="far fa-clock text-[10px]"></i> ${n.time}</span>
          </div>

          <!-- Decree / Statement Paragraph -->
          <p class="text-xs sm:text-sm text-gray-300 leading-relaxed mr-5 mb-6 text-justify font-normal">
            ${n.content}
          </p>

          <!-- Attached Photo (if exists) -->
          ${n.image ? `
            <div class="mr-5 rounded-2xl overflow-hidden border border-white/10 max-h-[460px] bg-black/50 shadow-2xl">
              <img 
                src="${n.image}" 
                alt="${n.title}" 
                class="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                onerror="this.style.display='none'"
              />
            </div>
          ` : ''}
        </article>
      `).join('');
    }
  }

  // 8. Render Subtab 2: Description
  const descContainer = document.getElementById('faction-desc-body');
  if (descContainer) {
    if (faction.description) {
      descContainer.innerHTML = `
        <div class="space-y-4">
          <div class="p-5 rounded-2xl bg-white/5 border border-white/5">
            <h4 class="font-bold text-white mb-2 text-base flex items-center gap-2">
              <i class="fa-solid fa-circle-info text-amber-400"></i>
              <span>المهام والاختصاصات الرسمية</span>
            </h4>
            <p class="text-gray-300 text-xs sm:text-sm leading-relaxed">${faction.description}</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="p-4 rounded-xl bg-black/40 border border-white/5">
              <span class="text-gray-400 block mb-1">الرتب الوظيفية المتاحة:</span>
              <span class="text-white font-semibold">مفتوح للتقديم لكافة الرتب عبر أكاديمية التوظيف</span>
            </div>
            <div class="p-4 rounded-xl bg-black/40 border border-white/5">
              <span class="text-gray-400 block mb-1">رمز النداء اللاسلكي:</span>
              <span class="text-amber-400 font-mono font-bold">${faction.phone}</span>
            </div>
          </div>
        </div>
      `;
    } else {
      descContainer.innerHTML = `
        <div class="py-16 text-center text-gray-400 text-base">
          لا يوجد وصف متاح
        </div>
      `;
    }
  }

  // 9. Render Subtab 3: Leaders (Exact Screenshot Match with Glowing Avatars & Crowns)
  const leadersGrid = document.getElementById('faction-leaders-grid');
  if (leadersGrid) {
    leadersGrid.innerHTML = faction.leaders.map(l => `
      <div class="bg-[#0b1120]/90 rounded-2xl p-6 border border-white/10 hover:border-amber-500/40 transition-all text-center group shadow-xl">
        <!-- Glowing Circular Avatar with Crown Badge -->
        <div class="leader-avatar-wrapper">
          <div class="w-20 h-20 rounded-full overflow-hidden leader-avatar-glow bg-amber-500/10 p-1">
            <img 
              src="${l.avatar}" 
              alt="${l.name}" 
              class="w-full h-full object-cover rounded-full"
              onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(l.name)}&backgroundColor=d1d4f9'"
            />
          </div>
          ${l.crown ? `<div class="leader-crown-badge">👑</div>` : ''}
        </div>

        <!-- Leader Name -->
        <h4 class="text-base font-bold text-white mb-2 line-clamp-1">${l.name}</h4>

        <!-- Role Badge (Yellow outlined pill) -->
        <span class="px-3 py-1 rounded-full text-[11px] font-semibold border border-amber-500/40 text-amber-300 bg-amber-500/10 inline-block line-clamp-1">
          ${l.title}
        </span>
      </div>
    `).join('');
  }
}

// Render the 11 Factions Grid for All Factions browsing (Exact Match to Image 5 from screenshots)
function renderFactionsGrid() {
  const container = document.getElementById('factions-grid');
  if (!container) return;

  container.innerHTML = factionsData.map(f => `
    <div 
      onclick="openFactionDetail(${f.id})"
      class="glass-panel rounded-2xl p-5 glow-card cursor-pointer border ${f.borderColor || 'border-white/10'} hover:border-amber-400/50 flex items-center justify-between gap-4 transition-all group bg-gradient-to-r ${f.cardBg || 'from-white/5 to-transparent'}"
    >
      <div class="flex items-center gap-4">
        <!-- Faction Seal Emblem -->
        <div class="w-14 h-14 rounded-2xl bg-[#0b1222] border border-white/15 p-1 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
          ${getFactionSealSVG(f)}
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-white mb-1.5 group-hover:text-amber-400 transition-colors">${f.name}</h3>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${f.badgeColor}">
              <i class="${f.typeIcon} text-[10px]"></i>
              <span>${f.type}</span>
            </span>
            ${f.hasHiringBadge ? `
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                <i class="fa-regular fa-circle-check text-[9px]"></i>
                <span>التوظيف مفتوح</span>
              </span>
            ` : ''}
            <span class="text-xs text-gray-400 mr-1">• ${f.members} عضو</span>
          </div>
        </div>
      </div>
      <div class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-amber-600 transition-all flex-shrink-0">
        <i class="fas fa-chevron-left text-xs"></i>
      </div>
    </div>
  `).join('');
}

// Modal Handlers for adding new Faction News
function openAddNewsModal() {
  sound.playClick();
  const modal = document.getElementById('add-news-modal');
  if (modal) modal.classList.add('active');
}

function closeAddNewsModal() {
  sound.playClick();
  const modal = document.getElementById('add-news-modal');
  if (modal) modal.classList.remove('active');
}

function submitNewFactionNews(e) {
  e.preventDefault();
  const title = document.getElementById('new-news-title')?.value;
  const author = document.getElementById('new-news-author')?.value || 'Eyad (المؤسس)';
  const time = document.getElementById('new-news-time')?.value || 'الآن';
  const img = document.getElementById('new-news-img')?.value?.trim();
  const content = document.getElementById('new-news-content')?.value;

  if (!title || !content) {
    showToast('تنبيه', 'يرجى كتابة عنوان ونص الخبر المطلوب نشره', 'error');
    return;
  }

  const faction = factionsData.find(f => f.id === currentFactionId);
  if (!faction) return;

  const newPost = {
    id: Date.now(),
    title: title,
    author: author,
    time: time,
    content: content,
    image: img || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80'
  };

  faction.news.unshift(newPost);
  faction.newsCount = (faction.newsCount || faction.news.length) + 1;
  saveFactionsData();

  renderFactionDetailPage(currentFactionId);
  closeAddNewsModal();

  document.getElementById('new-news-title').value = '';
  document.getElementById('new-news-content').value = '';
  if (document.getElementById('new-news-img')) document.getElementById('new-news-img').value = '';

  sound.playSuccess();
  showToast('تم نشر البيان الرسمي وحفظه بنجاح!', `أضيف الخبر إلى ${faction.name}`, 'success');
}

function deleteFactionNews(factionId, newsId) {
  sound.playClick();
  const faction = factionsData.find(f => f.id === parseInt(factionId));
  if (!faction || !faction.news) return;

  const newsIndex = faction.news.findIndex(n => n.id === parseInt(newsId));
  if (newsIndex === -1) return;

  const deletedNews = faction.news[newsIndex];
  if (confirm(`هل أنت متأكد من رغبتك في حذف هذا الخبر نهائياً؟\n"${deletedNews.title}"`)) {
    faction.news.splice(newsIndex, 1);
    faction.newsCount = faction.news.length;
    saveFactionsData();
    sound.playDelete();
    showToast('تم حذف الخبر بنجاح!', `تمت إزالة الخبر من ${faction.name}`, 'info');
    renderFactionDetailPage(faction.id);
  }
}

function initFactionsData() {
  const storedFactions = localStorage.getItem(STORAGE.FACTIONS);
  if (storedFactions) {
    try {
      const parsed = JSON.parse(storedFactions);
      if (Array.isArray(parsed) && parsed.length === 11) {
        // Guarantee leadership updates for Gov (Vice President Eyad) and Towing (President Eyad)
        const gov = parsed.find(f => f.id === 1);
        const defGov = defaultFactionsData.find(f => f.id === 1);
        if (gov && defGov) gov.leaders = defGov.leaders;

        const tow = parsed.find(f => f.id === 8);
        const defTow = defaultFactionsData.find(f => f.id === 8);
        if (tow && defTow) tow.leaders = defTow.leaders;

        factionsData = parsed;
        saveFactionsData();
      } else {
        factionsData = defaultFactionsData;
        saveFactionsData();
      }
    } catch(e) {
      factionsData = defaultFactionsData;
    }
  } else {
    // Migrate any previous news from v4 if available
    const prevV4 = localStorage.getItem('al_azayzah_factions_data_v4');
    if (prevV4) {
      try {
        const parsedV4 = JSON.parse(prevV4);
        if (Array.isArray(parsedV4) && parsedV4.length === 11) {
          parsedV4.forEach(oldF => {
            const target = defaultFactionsData.find(f => f.id === oldF.id);
            if (target && oldF.news && Array.isArray(oldF.news)) {
              target.news = oldF.news;
              target.newsCount = oldF.news.length;
            }
          });
        }
      } catch(e) {}
    }
    factionsData = defaultFactionsData;
    saveFactionsData();
  }
  toggleFactionsView(factionsViewMode);
}

// ==========================================
// APPLICATIONS SECTION & PIPELINE
// ==========================================
const defaultApplicationsData = [
  { 
    id: 1, 
    title: 'بطولة التيمات الكبرى', 
    status: 'closed', 
    statusText: 'مغلق', 
    icon: 'fa-solid fa-trophy', 
    desc: 'منافسة الفرق والعصابات في سيرفر Al-AzayzahRP على جوائز مالية وسيارات نادرة.' 
  },
  { 
    id: 2, 
    title: 'تقديم العائلات', 
    status: 'closed', 
    statusText: 'مغلق', 
    icon: 'fa-solid fa-people-group', 
    desc: 'تسجيل وتأسيس عائلة رسمية جديدة معتمدة من شؤون المجتمع في السيرفر.' 
  },
  { 
    id: 3, 
    title: 'تقديم اليوتيوبر وصناع المحتوى', 
    status: 'closed', 
    statusText: 'مغلق', 
    icon: 'fa-brands fa-youtube', 
    desc: 'الحصول على رتبة صانع محتوى معتمد ورعاية فيديوهات البثوث مع مكافآت حصرية.' 
  },
  { 
    id: 4, 
    title: 'تقديم شارة معلم الأربي (RP Master)', 
    status: 'closed', 
    statusText: 'مغلق', 
    icon: 'fa-solid fa-graduation-cap', 
    desc: 'اختبار كفاءة اللاعبين المحترفين لتدريب الأعضاء الجدد والإشراف على السيناريوهات.' 
  },
  { 
    id: 5, 
    title: 'تقديم الهيئة العامة', 
    status: 'closed', 
    statusText: 'مغلق', 
    icon: 'fa-solid fa-building-columns', 
    desc: 'الانضمام إلى اللجان التنظيمية والرقابية للفعاليات والمشاريع العامة.' 
  },
  { 
    id: 6, 
    title: 'تقديم طاقم الديسكورد', 
    status: 'closed', 
    statusText: 'مغلق', 
    icon: 'fa-brands fa-discord', 
    desc: 'الإشراف على قنوات وخوادم الديسكورد ومساعدة الأعضاء وضبط المحادثات.' 
  },
  { 
    id: 7, 
    title: 'تقديم طاقم الدعم الفني', 
    status: 'open', 
    statusText: 'مفتوح', 
    icon: 'fa-solid fa-headset', 
    desc: 'الانضمام إلى فريق المساعدة والدعم الفني لحل مشاكل واستفسارات اللاعبين داخل السيرفر وتوجيه الأعضاء الجدد.' 
  },
  { 
    id: 8, 
    title: 'تقديم العصابات الرسمية', 
    status: 'open', 
    statusText: 'مفتوح', 
    icon: 'fa-solid fa-skull', 
    desc: 'تسجيل وتأسيس عصابة رسمية معتمدة داخل السيرفر، مع استلام المقر والأسلحة والأنشطة الإجرامية المنظمة.' 
  },
  { 
    id: 9, 
    title: 'تقديم القوات الخاصة (S.W.A.T)', 
    status: 'closed', 
    statusText: 'مغلق', 
    icon: 'fa-solid fa-crosshairs', 
    desc: 'الانخراط في صفوف قوات التدخل السريع للعمليات التكتيكية ومداهمة أوكار المجرمين وحماية أمن الولاية.' 
  }
];

let applicationsData = defaultApplicationsData;
let currentAppFilter = 'all';
let selectedApp = null;

function saveApplicationsData() {
  localStorage.setItem(STORAGE.APPS_LIST, JSON.stringify(applicationsData));
}

function toggleAppStatus(id) {
  sound.playClick();
  const app = applicationsData.find(a => a.id === parseInt(id));
  if (!app) return;

  if (app.status === 'open') {
    app.status = 'closed';
    app.statusText = 'مغلق';
    sound.playDelete();
    showToast('تم إغلاق التقديم', `أصبح "${app.title}" مغلقاً الآن أمام اللاعبين`, 'info');
  } else {
    app.status = 'open';
    app.statusText = 'مفتوح';
    sound.playSuccess();
    showToast('تم فتح التقديم بنجاح!', `أصبح "${app.title}" متاحاً ومفتوحاً للتقديم الآن`, 'success');
  }

  saveApplicationsData();
  renderApplications(currentAppFilter);
  renderAdminAppsSettings();
}

function renderApplications(filter = 'all') {
  currentAppFilter = filter;
  const container = document.getElementById('applications-grid');
  const countEl = document.getElementById('closed-apps-count');
  if (!container) return;

  // Update active state of filter buttons
  document.querySelectorAll('.app-filter-btn').forEach(btn => {
    btn.classList.remove('bg-indigo-600', 'text-white', 'font-bold');
    btn.classList.add('bg-white/5', 'text-gray-300', 'font-semibold');
  });
  const activeBtn = document.getElementById(`app-filter-btn-${filter}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-white/5', 'text-gray-300', 'font-semibold');
    activeBtn.classList.add('bg-indigo-600', 'text-white', 'font-bold');
  }

  const openCount = applicationsData.filter(a => a.status === 'open').length;
  const closedCount = applicationsData.filter(a => a.status === 'closed').length;
  if (countEl) {
    countEl.innerText = `${openCount} مفتوح • ${closedCount} مغلق`;
  }

  const filtered = applicationsData.filter(app => {
    if (filter === 'open') return app.status === 'open';
    if (filter === 'closed') return app.status === 'closed';
    return true;
  });

  container.innerHTML = filtered.map(app => `
    <div class="glass-panel rounded-2xl p-6 glow-card border border-white/10 hover:border-indigo-500/40 flex flex-col justify-between transition-all group">
      <div>
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-xl ${app.status === 'open' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-gray-400 border border-white/10'} flex items-center justify-center text-xl shadow-lg">
            <i class="${app.icon}"></i>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold ${app.status === 'open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'} flex items-center gap-1.5 shadow-sm">
              <i class="fas ${app.status === 'open' ? 'fa-circle-check' : 'fa-lock'} text-[10px]"></i>
              ${app.statusText}
            </span>
            <!-- Quick Toggle Button for Owner/Admin -->
            <button 
              onclick="event.stopPropagation(); toggleAppStatus(${app.id})" 
              title="تغيير الحالة: ${app.status === 'open' ? 'إغلاق التقديم' : 'فتح التقديم'}"
              class="px-2.5 py-1 rounded-lg ${app.status === 'open' ? 'bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/25' : 'bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/25'} text-[11px] font-bold transition-all flex items-center gap-1"
            >
              <i class="fa-solid fa-power-off text-[9px]"></i>
              <span>${app.status === 'open' ? 'إغلاق' : 'فتح'}</span>
            </button>
          </div>
        </div>
        <h3 class="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">${app.title}</h3>
        <p class="text-gray-400 text-xs leading-relaxed mb-6">${app.desc}</p>
      </div>

      <button 
        onclick="openAppForm(${app.id})"
        class="w-full py-2.5 rounded-xl ${app.status === 'open' ? 'btn-primary-glow font-bold' : 'bg-white/5 hover:bg-white/10 text-gray-300'} text-xs font-semibold transition-all border border-white/10 flex items-center justify-center gap-2 group"
      >
        <span>${app.status === 'open' ? 'تقديم الآن' : 'عرض التفاصيل'}</span>
        <i class="fas fa-arrow-left text-[10px] transition-transform group-hover:-translate-x-1"></i>
      </button>
    </div>
  `).join('');
}

function renderAdminAppsSettings() {
  const toggleGrid = document.getElementById('admin-apps-toggle-grid');
  const summaryBadge = document.getElementById('admin-apps-summary-badge');
  if (!toggleGrid) return;

  const openCount = applicationsData.filter(a => a.status === 'open').length;
  const closedCount = applicationsData.filter(a => a.status === 'closed').length;

  if (summaryBadge) {
    summaryBadge.innerHTML = `<span class="text-emerald-400 font-bold">${openCount} مفتوح</span> • <span class="text-rose-400 font-bold">${closedCount} مغلق</span>`;
  }

  toggleGrid.innerHTML = applicationsData.map(app => `
    <div class="p-3.5 rounded-xl bg-black/40 border ${app.status === 'open' ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-white/10'} flex items-center justify-between gap-3 transition-all hover:border-white/20">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg ${app.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'} flex items-center justify-center text-sm">
          <i class="${app.icon}"></i>
        </div>
        <div>
          <h5 class="text-xs font-bold text-white mb-0.5 line-clamp-1">${app.title}</h5>
          <span class="text-[11px] font-semibold ${app.status === 'open' ? 'text-emerald-400' : 'text-rose-400'}">
            <i class="fas ${app.status === 'open' ? 'fa-lock-open' : 'fa-lock'} text-[9px] ml-1"></i>
            ${app.statusText}
          </span>
        </div>
      </div>

      <button 
        onclick="toggleAppStatus(${app.id})" 
        class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0 ${app.status === 'open' ? 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'}"
      >
        <i class="fa-solid ${app.status === 'open' ? 'fa-lock' : 'fa-lock-open'} text-[10px]"></i>
        <span>${app.status === 'open' ? 'إغلاق' : 'فتح'}</span>
      </button>
    </div>
  `).join('');
}

function openAppForm(id) {
  sound.playClick();
  selectedApp = applicationsData.find(a => a.id === id);
  if (!selectedApp) return;

  const modal = document.getElementById('application-form-modal');
  const title = document.getElementById('app-modal-title');
  const statusEl = document.getElementById('app-modal-status');
  const formBox = document.getElementById('app-form-content');
  const closedNotice = document.getElementById('app-closed-notice');

  if (title) title.innerText = selectedApp.title;
  if (statusEl) {
    statusEl.innerText = selectedApp.statusText;
    statusEl.className = `px-2.5 py-1 rounded-full text-xs font-bold ${selectedApp.status === 'open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`;
  }

  if (selectedApp.status === 'closed') {
    formBox.classList.add('hidden');
    closedNotice.classList.remove('hidden');
  } else {
    formBox.classList.remove('hidden');
    closedNotice.classList.add('hidden');
  }

  modal.classList.add('active');
}

function closeAppForm() {
  sound.playClick();
  const modal = document.getElementById('application-form-modal');
  if (modal) modal.classList.remove('active');
}

function submitApplication(e) {
  e.preventDefault();
  const discord = document.getElementById('app-discord-input')?.value;
  const name = document.getElementById('app-char-input')?.value;
  const exp = document.getElementById('app-exp-input')?.value;

  if (!discord || !name) {
    showToast('خطأ في الإرسال', 'يرجى كتابة اسم حساب الديسكورد واسم الشخصية', 'error');
    return;
  }

  // Push new application to admin pipeline and save
  const newApp = {
    id: Date.now(),
    name: name,
    discord: discord,
    role: selectedApp ? selectedApp.title : 'طلب تقديم جديد',
    status: 'pending',
    date: 'الآن',
    exp: exp || 'لا توجد خبرات سابقة مسجلة.'
  };

  adminApplications.unshift(newApp);
  saveAdminApps();
  renderAdminApps();

  closeAppForm();
  showToast('تم إرسال طلبك للإدارة وحفظه بنجاح!', `ستتم مراجعة طلبك في لوحة تحكم السيرفر قريباً.`, 'success');
}

function initApplicationsData() {
  const saved = localStorage.getItem(STORAGE.APPS_LIST);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        applicationsData = parsed;
      } else {
        applicationsData = defaultApplicationsData;
        saveApplicationsData();
      }
    } catch(e) {
      applicationsData = defaultApplicationsData;
    }
  } else {
    applicationsData = defaultApplicationsData;
    saveApplicationsData();
  }
  renderApplications('all');
  renderAdminAppsSettings();
}

// ==========================================
// STORE (المتجر) LOGIC
// ==========================================
function purchaseItem(packageName, price) {
  sound.playSuccess();
  showToast('طلب الشراء قيد المعالجة', `جاري تحويلك إلى بوابة الدفع الآمنة لشراء ${packageName} بقيمة $${price}`, 'info');
}

// ==========================================
// SUPPORT (الدعم الفني) LOGIC
// ==========================================
function submitSupportTicket(e) {
  e.preventDefault();
  const subject = document.getElementById('ticket-subject')?.value;
  const desc = document.getElementById('ticket-desc')?.value;

  if (!subject || !desc) {
    showToast('تنبيه', 'يرجى كتابة عنوان المشكلة وتفاصيلها', 'error');
    return;
  }

  const ticketId = Math.floor(100000 + Math.random() * 900000);
  
  const newTicket = {
    id: ticketId,
    user: 'Eyad',
    discord: 'Eyad#2026',
    type: 'تذكرة عامة',
    subject: subject,
    status: 'open',
    time: 'الآن'
  };

  adminTickets.unshift(newTicket);
  saveAdminTickets();
  renderAdminTickets();

  document.getElementById('ticket-subject').value = '';
  document.getElementById('ticket-desc').value = '';

  showToast('تم فتح التذكرة بنجاح!', `رقم التذكرة: #${ticketId} - أضيفت إلى لوحة الإدارة.`, 'success');
}

// ==========================================
// USER PROFILE / NOTIFICATIONS DRAWER
// ==========================================
function toggleNotifications() {
  sound.playClick();
  const drawer = document.getElementById('notifications-drawer');
  if (drawer) drawer.classList.toggle('hidden');
}

function toggleUserProfile() {
  sound.playClick();
  const profile = document.getElementById('user-profile-menu');
  if (profile) profile.classList.toggle('hidden');
}

function toggleMobileNav() {
  sound.playClick();
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('hidden');
}

function openTrailerModal() {
  sound.playClick();
  const modal = document.getElementById('trailer-modal');
  if (modal) modal.classList.add('active');
}
function closeTrailerModal() {
  sound.playClick();
  const modal = document.getElementById('trailer-modal');
  if (modal) modal.classList.remove('active');
}

function openPlayNowModal() {
  sound.playClick();
  const modal = document.getElementById('play-now-modal');
  if (modal) modal.classList.add('active');
}
function closePlayNowModal() {
  sound.playClick();
  const modal = document.getElementById('play-now-modal');
  if (modal) modal.classList.remove('active');
}

function openAdminModal() {
  sound.playClick();
  switchTab('admin');
}

// ==========================================
// ADMIN DASHBOARD LOGIC (لوحة الإدارة الكاملة)
// ==========================================
let defaultAdminApps = [
  { id: 101, name: 'أحمد الحربي', discord: 'Ahmed_RP#1122', role: 'تقديم طاقم الدعم الفني', status: 'pending', date: 'اليوم، 02:15 م', exp: 'خبرة سابقة في حل مشاكل اللاعبين وتذاكر الديسكورد والتعامل مع الأعضاء الجدد.' },
  { id: 102, name: 'فهد القحطاني', discord: 'Fahad_KSA#9981', role: 'تقديم العصابات الرسمية', status: 'pending', date: 'اليوم، 01:40 م', exp: 'قائد عصابة سابق، ملم بقوانين الرول بلاي الإجرامية وسيناريوهات السطو والاشتباكات المنظمة.' },
  { id: 103, name: 'خالد العتيبي', discord: 'Khaled_Pro#7744', role: 'تقديم طاقم الديسكورد', status: 'pending', date: 'أمس، 11:30 م', exp: 'إدارة مجتمعات ديسكورد أكثر من 15 ألف عضو، خبرة في ضبط البوتات والتنظيم.' },
  { id: 104, name: 'يوسف المصري', discord: 'Joe_Gamer#2341', role: 'تقديم صانع محتوى / يوتيوبر', status: 'pending', date: 'أمس، 08:20 م', exp: 'قناة يوتيوب 45 ألف مشترك مع بثوث يومية لسيرفرات MTA:SA.' }
];

let defaultAdminTickets = [
  { id: 104921, user: 'سلطان الشمري', discord: 'Sultan#4433', type: 'مشكلة في المتجر', subject: 'شحنت باقة VIP Gold ولم تصلني السيارة الرياضية', status: 'open', time: 'منذ 15 دقيقة' },
  { id: 104922, user: 'محمد الدوسري', discord: 'M7md_99#1201', type: 'بلاغ مخالفة رول بلاي', subject: 'لاعب قام بالخروج أثناء السيناريو (Combat Log)', status: 'open', time: 'منذ 45 دقيقة' }
];

let adminApplications = defaultAdminApps;
let adminTickets = defaultAdminTickets;

function saveAdminApps() {
  localStorage.setItem(STORAGE.APPS, JSON.stringify(adminApplications));
}

function saveAdminTickets() {
  localStorage.setItem(STORAGE.TICKETS, JSON.stringify(adminTickets));
}

function switchAdminSubtab(subtabId) {
  sound.playClick();
  document.querySelectorAll('.admin-subtab-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-indigo-600', 'text-white');
    btn.classList.add('bg-white/5', 'text-gray-300');
  });

  const activeBtn = document.getElementById(`admin-tab-btn-${subtabId}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-white/5', 'text-gray-300');
    activeBtn.classList.add('active', 'bg-indigo-600', 'text-white');
  }

  document.querySelectorAll('.admin-subtab-content').forEach(el => el.classList.add('hidden'));
  const activeContent = document.getElementById(`admin-subtab-${subtabId}`);
  if (activeContent) activeContent.classList.remove('hidden');

  if (subtabId === 'apps') {
    renderAdminApps();
    renderAdminAppsSettings();
  }
  if (subtabId === 'auctions') renderAdminAuctions();
  if (subtabId === 'tickets') renderAdminTickets();
  if (subtabId === 'broadcast') {
    applyServerConfigToUI();
    const storedBroadcast = localStorage.getItem(STORAGE.BROADCAST);
    if (storedBroadcast) {
      try {
        const bc = JSON.parse(storedBroadcast);
        const input = document.getElementById('broadcast-input-text');
        if (input && bc && bc.text) input.value = bc.text;
      } catch(e) {}
    }
  }
}

function renderAdminApps(filter = 'all') {
  const container = document.getElementById('admin-applications-table');
  const counterEl = document.getElementById('admin-pending-apps-count');
  const statEl = document.getElementById('admin-stat-apps');
  if (!container) return;

  const pendingCount = adminApplications.filter(a => a.status === 'pending').length;
  if (counterEl) counterEl.innerText = pendingCount;
  if (statEl) statEl.innerText = pendingCount;

  const list = adminApplications.filter(a => filter === 'all' || a.status === filter);

  if (list.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-gray-400">
        <i class="fa-regular fa-clipboard text-4xl mb-3 block text-gray-600"></i>
        لا توجد طلبات تقديم حالياً
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(app => {
    let badge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">قيد المراجعة</span>';
    if (app.status === 'accepted') {
      badge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">تم القبول ✓</span>';
    } else if (app.status === 'rejected') {
      badge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">تم الرفض ✕</span>';
    }

    return `
      <div class="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-white/20">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-1.5 flex-wrap">
            <h4 class="font-bold text-white text-base">${app.name}</h4>
            <span class="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">${app.discord}</span>
            <span class="text-xs text-gray-400">• ${app.role}</span>
            ${badge}
          </div>
          <p class="text-xs text-gray-400 leading-relaxed mb-2">${app.exp}</p>
          <span class="text-[10px] text-gray-500 block"><i class="far fa-clock ml-1"></i> تاريخ التقديم: ${app.date}</span>
        </div>

        <div class="flex items-center gap-2 w-full md:w-auto">
          ${app.status === 'pending' ? `
            <button onclick="decideApp(${app.id}, 'accepted')" class="flex-1 md:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-check"></i>
              <span>قبول الطلب</span>
            </button>
            <button onclick="decideApp(${app.id}, 'rejected')" class="flex-1 md:flex-none px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs transition-all border border-rose-500/30 flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-xmark"></i>
              <span>رفض</span>
            </button>
          ` : `
            <button onclick="deleteAppAdmin(${app.id})" class="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold transition-all">
              <i class="fa-solid fa-trash-can ml-1"></i> حذف الطلب
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function filterAdminApps(filter) {
  renderAdminApps(filter);
}

function decideApp(id, decision) {
  const app = adminApplications.find(a => a.id === id);
  if (!app) return;
  app.status = decision;
  saveAdminApps();

  if (decision === 'accepted') {
    sound.playSuccess();
    showToast('تم قبول الطلب وحفظه بنجاح!', `تم إشعار ${app.name} على الديسكورد (${app.discord})`, 'success');
  } else {
    sound.playDelete();
    showToast('تم رفض الطلب', `تم تسجيل قرار الرفض لـ ${app.name}`, 'info');
  }

  renderAdminApps();
}

function deleteAppAdmin(id) {
  sound.playDelete();
  const index = adminApplications.findIndex(a => a.id === id);
  if (index !== -1) {
    adminApplications.splice(index, 1);
    saveAdminApps();
    renderAdminApps();
    showToast('تم حذف الطلب', 'تمت إزالة سجل التقديم', 'info');
  }
}

function renderAdminAuctions() {
  const container = document.getElementById('admin-auctions-table');
  const statEl = document.getElementById('admin-stat-auctions');
  if (!container) return;

  if (statEl) statEl.innerText = auctionsList.length;

  if (auctionsList.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-gray-500">
        لا توجد مزادات نشطة حالياً. اضغط على "+ إضافة مزاد جديد" لإضافة أول مزاد!
      </div>
    `;
    return;
  }

  container.innerHTML = auctionsList.map(item => `
    <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <img src="${item.image}" onerror="this.src='${item.fallbackImg}'" class="w-16 h-12 rounded-xl object-cover border border-white/10">
        <div>
          <h4 class="font-bold text-white text-sm line-clamp-1">${item.title}</h4>
          <span class="text-xs text-indigo-400 font-bold">$ ${item.currentPrice.toLocaleString()}</span>
          <span class="text-xs text-gray-400 mr-2">• ${item.bidsCount} مزايدات</span>
          <span class="text-xs text-gray-500 mr-2">• البائع: ${item.seller}</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button onclick="deleteAuctionDirect(${item.id})" class="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold border border-rose-500/30 transition-all flex items-center gap-1.5">
          <i class="fa-solid fa-trash-can text-xs"></i>
          <span>حذف</span>
        </button>
      </div>
    </div>
  `).join('');
}

function deleteAuctionAdmin(id) {
  deleteAuctionDirect(id);
}

function updateBroadcastUI(active, text) {
  const banner = document.getElementById('broadcast-banner');
  const bannerText = document.getElementById('broadcast-banner-text');
  const broadcastInput = document.getElementById('broadcast-input-text');

  if (active && text) {
    if (bannerText) bannerText.innerText = text;
    if (banner) banner.classList.remove('hidden');
    document.body.classList.add('has-broadcast');
    if (broadcastInput && !broadcastInput.value) broadcastInput.value = text;
  } else {
    if (banner) banner.classList.add('hidden');
    document.body.classList.remove('has-broadcast');
  }
}

function applyBroadcast(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('broadcast-input-text');
  const text = input ? input.value.trim() : '';

  if (!text) {
    showToast('تنبيه', 'يرجى كتابة نص الإعلان أولاً قبل النشر', 'error');
    return;
  }

  const broadcastData = { active: true, text: text };
  localStorage.setItem(STORAGE.BROADCAST, JSON.stringify(broadcastData));
  updateBroadcastUI(true, text);

  sound.playSuccess();
  showToast('تم نشر الإعلان العاجل وحفظه بنجاح!', 'يظهر الإعلان الآن في أعلى الموقع لجميع الزوار.', 'success');
}

function hideBroadcast() {
  sound.playClick();
  const broadcastData = { active: false, text: '' };
  localStorage.setItem(STORAGE.BROADCAST, JSON.stringify(broadcastData));
  updateBroadcastUI(false, '');
  showToast('تم إخفاء شريط الإعلانات وحفظ الإعداد', '', 'info');
}

function dismissBroadcast() {
  hideBroadcast();
}

function triggerAdminBroadcastFast() {
  switchAdminSubtab('broadcast');
}

function getServerConfig() {
  try {
    const raw = localStorage.getItem(STORAGE.SERVER_CFG);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { ip: 'play.al-azayzahrp.net:22003', status: 'online', maxPlayers: 250 };
}

function applyServerConfigToUI(cfg) {
  if (!cfg) cfg = getServerConfig();

  // 1. Hero Section Bottom Bar (IP, Status, Max Players)
  const heroIp = document.getElementById('hero-server-ip-text');
  if (heroIp) heroIp.innerText = cfg.ip;

  const heroMax = document.getElementById('hero-max-players');
  if (heroMax) heroMax.innerText = cfg.maxPlayers;

  const heroStatus = document.getElementById('hero-server-status-badge');
  if (heroStatus) {
    if (cfg.status === 'online') {
      heroStatus.className = 'font-bold text-emerald-400 flex items-center gap-1.5';
      heroStatus.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> ONLINE';
    } else if (cfg.status === 'maintenance') {
      heroStatus.className = 'font-bold text-amber-400 flex items-center gap-1.5';
      heroStatus.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> MAINTENANCE';
    } else {
      heroStatus.className = 'font-bold text-rose-400 flex items-center gap-1.5';
      heroStatus.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-400"></span> OFFLINE';
    }
  }

  // 2. Play Now Modal (IP display & mtasa direct connect link)
  const modalIp = document.getElementById('modal-server-ip-text');
  if (modalIp) modalIp.innerText = cfg.ip;

  const modalLink = document.getElementById('modal-server-connect-link');
  if (modalLink) modalLink.href = `mtasa://${cfg.ip}`;

  // 3. Admin Header Status Label
  const adminLabel = document.getElementById('admin-server-status-label');
  if (adminLabel) {
    if (cfg.status === 'online') {
      adminLabel.className = 'text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5';
      adminLabel.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> متصل (ONLINE)';
    } else if (cfg.status === 'maintenance') {
      adminLabel.className = 'text-xs font-bold text-amber-400 flex items-center gap-1.5 mt-0.5';
      adminLabel.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> صيانة (MAINTENANCE)';
    } else {
      adminLabel.className = 'text-xs font-bold text-rose-400 flex items-center gap-1.5 mt-0.5';
      adminLabel.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-400"></span> غير متصل (OFFLINE)';
    }
  }

  // 4. Admin Overview Stat Max Players
  const adminStatMax = document.getElementById('admin-stat-max-players');
  if (adminStatMax) adminStatMax.innerText = cfg.maxPlayers;

  // 5. Form Inputs inside Admin Subtab
  const inputIp = document.getElementById('cfg-server-ip');
  if (inputIp) inputIp.value = cfg.ip;

  const inputStatus = document.getElementById('cfg-server-status');
  if (inputStatus) inputStatus.value = cfg.status;

  const inputMax = document.getElementById('cfg-max-players');
  if (inputMax) inputMax.value = cfg.maxPlayers;
}

function saveServerConfig(e) {
  if (e && e.preventDefault) e.preventDefault();
  const newIp = document.getElementById('cfg-server-ip')?.value?.trim() || 'play.al-azayzahrp.net:22003';
  const newStatus = document.getElementById('cfg-server-status')?.value || 'online';
  const maxPlayers = document.getElementById('cfg-max-players')?.value || '250';

  const cfg = { ip: newIp, status: newStatus, maxPlayers: maxPlayers };
  localStorage.setItem(STORAGE.SERVER_CFG, JSON.stringify(cfg));

  applyServerConfigToUI(cfg);

  sound.playSuccess();
  showToast('تم تحديث وحفظ إعدادات السيرفر بنجاح!', `عنوان الآي بي: ${newIp} | الحالة: ${newStatus.toUpperCase()} | السعة: ${maxPlayers}`, 'success');
}

function toggleServerMaintenance() {
  sound.playClick();
  const cfg = getServerConfig();
  cfg.status = cfg.status === 'maintenance' ? 'online' : 'maintenance';
  localStorage.setItem(STORAGE.SERVER_CFG, JSON.stringify(cfg));
  applyServerConfigToUI(cfg);
  showToast('تم تبديل وضع السيرفر!', `الحالة الحالية: ${cfg.status === 'maintenance' ? 'تحت الصيانة' : 'متصل ومتاح'}`, 'info');
}

function renderAdminTickets() {
  const container = document.getElementById('admin-tickets-container');
  if (!container) return;

  if (adminTickets.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-gray-400">
        <i class="fa-solid fa-check-double text-4xl mb-3 block text-emerald-500"></i>
        لا توجد أي تذاكر دعم فني مفتوحة حالياً، كل المشاكل تم حلها!
      </div>
    `;
    return;
  }

  container.innerHTML = adminTickets.map(t => `
    <div class="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono font-bold text-xs">#${t.id}</span>
          <h4 class="font-bold text-white text-sm">${t.subject}</h4>
          <span class="text-xs text-amber-400 font-medium">${t.type}</span>
        </div>
        <div class="text-xs text-gray-400 flex items-center gap-4">
          <span>المرسل: <b class="text-gray-300">${t.user}</b> (${t.discord})</span>
          <span><i class="far fa-clock"></i> ${t.time}</span>
        </div>
      </div>

      <button onclick="resolveTicket(${t.id})" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-2">
        <i class="fa-solid fa-check-double"></i>
        <span>حل وإغلاق التذكرة</span>
      </button>
    </div>
  `).join('');
}

function resolveTicket(id) {
  sound.playSuccess();
  const index = adminTickets.findIndex(t => t.id === id);
  if (index !== -1) {
    const t = adminTickets[index];
    adminTickets.splice(index, 1);
    saveAdminTickets();
    showToast('تم حل التذكرة بنجاح!', `تم إغلاق تذكرة #${t.id} وحفظ التغيير`, 'success');
    renderAdminTickets();
  }
}

// Reset Entire Website Data to Initial Factory Defaults
function resetAllDataToDefault() {
  if (confirm('هل أنت متأكد من رغبتك في استعادة كافة بيانات الموقع الافتراضية؟ سيتم مسح أي إضافات أو تعديلات محلية.')) {
    localStorage.removeItem(STORAGE.AUCTIONS);
    localStorage.removeItem(STORAGE.RULES);
    localStorage.removeItem(STORAGE.APPS);
    localStorage.removeItem(STORAGE.TICKETS);
    localStorage.removeItem(STORAGE.BROADCAST);
    localStorage.removeItem(STORAGE.SERVER_CFG);
    localStorage.removeItem(STORAGE.FACTIONS);
    localStorage.removeItem(STORAGE.APPS_LIST);
    location.reload();
  }
}

// Load All Stored LocalStorage Data on Boot
function loadAllStoredData() {
  try {
    const storedAuctions = localStorage.getItem(STORAGE.AUCTIONS);
    if (storedAuctions) auctionsList = JSON.parse(storedAuctions);

    const storedRules = localStorage.getItem(STORAGE.RULES);
    if (storedRules) rulesData = JSON.parse(storedRules);

    const storedApps = localStorage.getItem(STORAGE.APPS);
    if (storedApps) adminApplications = JSON.parse(storedApps);

    const storedTickets = localStorage.getItem(STORAGE.TICKETS);
    if (storedTickets) adminTickets = JSON.parse(storedTickets);

    const storedFactions = localStorage.getItem(STORAGE.FACTIONS);
    if (storedFactions) {
      try { factionsData = JSON.parse(storedFactions); } catch(e) {}
    }

    const storedBroadcast = localStorage.getItem(STORAGE.BROADCAST);
    if (storedBroadcast) {
      try {
        const bc = JSON.parse(storedBroadcast);
        if (bc && bc.active && bc.text) {
          updateBroadcastUI(true, bc.text);
        } else {
          updateBroadcastUI(false, '');
        }
      } catch(e) {}
    }

    const cfg = getServerConfig();
    applyServerConfigToUI(cfg);
  } catch(e) {
    console.error('Error loading stored data:', e);
  }
}

// ==========================================
// USER PROFILE & CHARACTER MANAGEMENT SYSTEM (مطابق للقطات 1 إلى 8 بالكامل)
// ==========================================

const charactersData = {
  '2487': {
    id: '2487',
    fullId: '000002487',
    name: 'Eyad A.Alasmri',
    lastSeen: 'منذ يوم',
    lastSeenFull: 'آخر تسجيل دخول: منذ يوم',
    gender: 'Male ♂',
    birthDate: '28 سبتمبر 1992',
    age: '34 سنة',
    fingerprint: 'HL1VQNF CKR',
    nationality: 'Los Santos',
    assetsTotal: 13174,
    cash: 4474,
    bank: 8700,
    playTime: '775 ساعة و 6 دقيقة',
    level: 26,
    job: 'Textile',
    jobIcon: 'fa-solid fa-shirt',
    vehicles: [
      { model: 'Huyndai Sonata 2020 • #15105', plate: 'PEWQ 285' },
      { model: 'Dinghy Balony SPO 2016 • #18578', plate: 'IANN 579' },
      { model: 'Pentora Lincion 250 2014 • #22266', plate: 'HXDO 413' },
      { model: 'BMW E30 325i 1990 • #25760', plate: 'WULW 688' }
    ],
    estatesCount: 0,
    notifications: [
      { title: 'تم طردك من فاكشن', date: '9 أكتوبر 2026', isNew: true },
      { title: 'مخالفة | عدم الانتظام في القيادة', date: '9 أكتوبر 2026', isNew: true },
      { title: 'مخالفة على سيارتك', date: '9 أكتوبر 2026', isNew: true },
      { title: 'مخالفة على سيارتك', date: '7 أكتوبر 2026', isNew: true },
      { title: 'مخالفة | تجاوز الإشارة الحمراء', date: '7 أكتوبر 2026', isNew: true },
      { title: 'مخالفة على سيارتك', date: '7 أكتوبر 2026', isNew: true }
    ]
  },
  '5599': {
    id: '5599',
    fullId: '000005599',
    name: 'Eyad Rslan',
    lastSeen: 'منذ أسبوع',
    lastSeenFull: 'آخر تسجيل دخول: منذ أسبوع',
    gender: 'Male ♂',
    birthDate: '28 سبتمبر 1999',
    age: '27 سنة',
    fingerprint: 'LF8XBBBQDJ',
    nationality: 'Los Santos',
    assetsTotal: 5954,
    cash: 1807,
    bank: 4147,
    playTime: '90 ساعة و 47 دقيقة',
    level: 15,
    job: 'Poultry',
    jobIcon: 'fa-solid fa-egg',
    vehicles: [
      { model: 'BMW E30 325i 1990 • #15638', plate: 'CNAI 462' },
      { model: 'KTM RC390 2017 • #15978', plate: 'FJKR 526' }
    ],
    estatesCount: 0,
    notifications: [
      { title: 'تم دفع الفاتورة #27574 بشكل تلقائي', date: '4 أكتوبر 2026', isNew: true },
      { title: 'تم طردك من فاكشن', date: '3 أكتوبر 2026', isNew: true },
      { title: 'مخالفة على سيارتك', date: '30 سبتمبر 2026', isNew: true },
      { title: 'مخالفة على سيارتك', date: '30 سبتمبر 2026', isNew: true },
      { title: 'مخالفة | تجاوز الإشارة الحمراء', date: '29 سبتمبر 2026', isNew: true },
      { title: 'مخالفة على سيارتك', date: '29 سبتمبر 2026', isNew: true },
      { title: 'مخالفة على سيارتك', date: '29 سبتمبر 2026', isNew: true }
    ]
  }
};

let currentCharacterId = '2487';
let currentUserSubtab = 'characters';
let isSerialMasked = true;
const realSerial = 'CC49-8192-3841-F852';
const maskedSerial = 'CC49******************F852';

function switchUserSubtab(subtabId) {
  sound.playClick();
  currentUserSubtab = subtabId;
  document.querySelectorAll('.user-subtab-btn').forEach(btn => {
    btn.classList.remove('active', 'text-white');
    btn.classList.add('text-gray-400');
  });

  const activeBtn = document.getElementById(`user-subtab-btn-${subtabId}`);
  if (activeBtn) {
    activeBtn.classList.remove('text-gray-400');
    activeBtn.classList.add('active', 'text-white');
  }

  document.querySelectorAll('.user-subtab-content').forEach(el => el.classList.add('hidden'));
  const activeContent = document.getElementById(`user-subtab-content-${subtabId}`);
  if (activeContent) activeContent.classList.remove('hidden');
}

function toggleSerialMask() {
  sound.playClick();
  isSerialMasked = !isSerialMasked;
  const textEl = document.getElementById('user-serial-text');
  const eyeEl = document.getElementById('user-serial-eye');
  if (textEl) {
    textEl.innerText = isSerialMasked ? maskedSerial : realSerial;
  }
  if (eyeEl) {
    eyeEl.className = isSerialMasked ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash text-indigo-400';
  }
  showToast(isSerialMasked ? 'تم إخفاء الرقم التسلسلي' : 'تم كشف الرقم التسلسلي', '', 'info');
}

function handleChangeSerialPrompt() {
  sound.playClick();
  const newSerial = prompt('أدخل السيريال الجديد لحسابك في MTA:SA:', realSerial);
  if (newSerial && newSerial.trim()) {
    sound.playSuccess();
    showToast('تم تحديث السيريال بنجاح!', `السيريال الجديد: ${newSerial.trim()}`, 'success');
  }
}

function handleUserLogout() {
  sound.playDelete();
  if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟')) {
    showToast('تم تسجيل الخروج بنجاح', 'نراك قريباً في عالم العزايزة رول بلاي!', 'info');
    setTimeout(() => {
      switchTab('home');
    }, 800);
  }
}

function openCharacterDetail(charId = '2487') {
  sound.playClick();
  currentCharacterId = charId;
  const profileView = document.getElementById('user-profile-view');
  const detailView = document.getElementById('character-detail-view');
  if (profileView) profileView.classList.add('hidden');
  if (detailView) detailView.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderCharacterDetail(charId);
}

function backToUserProfile() {
  sound.playClick();
  const profileView = document.getElementById('user-profile-view');
  const detailView = document.getElementById('character-detail-view');
  if (profileView) profileView.classList.remove('hidden');
  if (detailView) detailView.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchCharacterById(charId) {
  sound.playClick();
  currentCharacterId = charId;
  renderCharacterDetail(charId);
}

function renderCharacterDetail(charId = '2487') {
  const char = charactersData[charId] || charactersData['2487'];

  // Switcher Button States
  const btn2487 = document.getElementById('char-switcher-btn-2487');
  const btn5599 = document.getElementById('char-switcher-btn-5599');
  if (btn2487) {
    if (char.id === '2487') {
      btn2487.className = 'px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg transition-all';
    } else {
      btn2487.className = 'px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all';
    }
  }
  if (btn5599) {
    if (char.id === '5599') {
      btn5599.className = 'px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg transition-all';
    } else {
      btn5599.className = 'px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all';
    }
  }

  // Hero Banner
  const badgeEl = document.getElementById('cdetail-badge-id');
  if (badgeEl) badgeEl.innerText = `الشخصية #${char.fullId}`;

  const nameEl = document.getElementById('cdetail-name');
  if (nameEl) nameEl.innerText = char.name;

  const lastSeenEl = document.getElementById('cdetail-lastseen');
  if (lastSeenEl) lastSeenEl.innerHTML = `<i class="far fa-clock ml-1"></i> ${char.lastSeenFull}`;

  // Quick Stats
  const assetsEl = document.getElementById('cdetail-assets-total');
  if (assetsEl) assetsEl.innerText = `$${char.assetsTotal.toLocaleString()}`;

  const cashEl = document.getElementById('cdetail-cash');
  if (cashEl) cashEl.innerText = `$${char.cash.toLocaleString()}`;

  const bankEl = document.getElementById('cdetail-bank');
  if (bankEl) bankEl.innerText = `$${char.bank.toLocaleString()}`;

  // Personal Info
  const idEl = document.getElementById('cdetail-personal-id');
  if (idEl) idEl.innerText = char.fullId;

  const genderEl = document.getElementById('cdetail-gender');
  if (genderEl) genderEl.innerText = char.gender;

  const birthEl = document.getElementById('cdetail-birth');
  if (birthEl) birthEl.innerText = char.birthDate;

  const ageEl = document.getElementById('cdetail-age');
  if (ageEl) ageEl.innerText = char.age;

  const fingerEl = document.getElementById('cdetail-fingerprint');
  if (fingerEl) fingerEl.innerText = char.fingerprint;

  const natEl = document.getElementById('cdetail-nationality');
  if (natEl) natEl.innerHTML = `<i class="fa-solid fa-earth-americas text-xs text-gray-400"></i><span>${char.nationality}</span>`;

  // Game Stats
  const playTimeEl = document.getElementById('cdetail-playtime');
  if (playTimeEl) playTimeEl.innerText = char.playTime;

  const levelEl = document.getElementById('cdetail-level');
  if (levelEl) levelEl.innerText = char.level;

  const gameCashEl = document.getElementById('cdetail-game-cash');
  if (gameCashEl) gameCashEl.innerText = `$${char.cash.toLocaleString()}`;

  const jobTextEl = document.getElementById('cdetail-job-text');
  const jobIconEl = document.getElementById('cdetail-job-icon');
  if (jobTextEl) jobTextEl.innerText = char.job;
  if (jobIconEl) jobIconEl.className = `${char.jobIcon} text-xs text-gray-400`;

  // Vehicles
  const vehiclesCountEl = document.getElementById('cdetail-vehicles-count');
  if (vehiclesCountEl) vehiclesCountEl.innerText = char.vehicles.length;

  const vehiclesListEl = document.getElementById('cdetail-vehicles-list');
  if (vehiclesListEl) {
    if (char.vehicles.length === 0) {
      vehiclesListEl.innerHTML = '<p class="text-xs text-gray-500 py-3 text-center">لا توجد مركبات مملوكة</p>';
    } else {
      vehiclesListEl.innerHTML = char.vehicles.map(v => `
        <div class="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-all">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-car"></i>
            </div>
            <div>
              <h5 class="text-xs font-bold text-white mb-0.5">${v.model}</h5>
              <span class="text-[11px] text-gray-400 font-mono">اللوحة: <b class="text-gray-300">${v.plate}</b></span>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded bg-white/5 text-[10px] text-indigo-300 font-semibold border border-white/5">مركبة نشطة</span>
        </div>
      `).join('');
    }
  }

  // Notifications
  const notifsCountEl = document.getElementById('cdetail-notifs-count');
  if (notifsCountEl) notifsCountEl.innerText = char.notifications.length;

  const notifsListEl = document.getElementById('cdetail-notifs-list');
  if (notifsListEl) {
    notifsListEl.innerHTML = char.notifications.map(n => `
      <div class="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 transition-all hover:border-indigo-500/30">
        <div class="flex items-center gap-2.5">
          ${n.isNew ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-sm">جديد</span>' : ''}
          <h5 class="text-xs font-bold text-white">${n.title}</h5>
        </div>
        <span class="text-[10px] text-gray-400 font-mono flex-shrink-0"><i class="far fa-clock text-[9px] ml-1"></i>${n.date}</span>
      </div>
    `).join('');
  }
}

function renderUserProfile() {
  const viewA = document.getElementById('user-profile-view');
  const viewB = document.getElementById('character-detail-view');
  if (viewA) viewA.classList.remove('hidden');
  if (viewB) viewB.classList.add('hidden');
  switchUserSubtab(currentUserSubtab);
}

function initUserProfile() {
  renderUserProfile();
}
