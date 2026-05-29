// src/data/tasks.js

export function getTodayTaskSet() {
  const day = new Date().getDay();
  if (day === 6) return 'cumartesi';
  if (day === 0) return 'pazar';
  return 'hafta_ici';
}

// ─── HAFTAİÇİ (Pazartesi–Cuma) ───────────────────────────────────────────────
export const HAFTA_ICI_TASKS = [
  { id:'wi_wake_up',       time:'07:30', label:'⏰ Uyan!',                    category:'sabah',    desc:'Yataktan kalk, güne başla.' },
  { id:'wi_vakum',         time:'07:35', label:'🫁 Vakum Hareketi',           category:'sabah',    desc:'Aç karnına 5 dakika. 3 set × 15 saniye.',
    steps:['Nefesi tamamen dışarı ver','Karnı içe çek ve yukarı kaldır — tutabildiğin kadar tut','3 set × 15 saniye · Metabolizma ve iç organ sağlığı için'] },
  { id:'wi_detoks',        time:'07:40', label:'🧃 Detoks İksiri',            category:'sabah',
    desc:'Zencefil+Limon+Pancar+Zerdeçal+Kara Biber+Ceylon Tarçını · Aç karnına 200ml ılık su',
    steps:[
      'Zencefil — 1-2cm taze rendelenmiş\nAnti-inflamatuar · Sindirim hızlandırır · Bağırsak hareketi ↑',
      'Limon — ½ taze sıkılmış\nKaraciğer detoksu · C vitamini · pH dengesi',
      'Pancar — ¼ küçük, suyunu sık\nNitrat → NO → kan dolaşımı ↑ · Cilt yenilenmesi',
      'Zerdeçal — ¼ tsp + 1 tutam kara biber\nKurkumin emilimi için biber ŞART · Güçlü anti-inflamatuar',
      'Ceylon Tarçını — ¼ tsp (Çin tarçını değil!)\nKan şekeri dengesi · Antioksidan',
      '200ml ılık su (50-60°C) · Hepsini karıştır · 1dk beklet · Yavaşça iç',
    ],
  },
  { id:'wi_cilt_sabah',    time:'07:45', label:'🧴 Sabah Cilt Rutini',        category:'bakim',
    desc:'Evde 3 adım · Dışarı çıkacaksan 4 adım · ~3 dakika',
    steps:[
      '① COSRX Low pH Cleanser\nIslak yüze fındık büyüklüğü · 30sn masaj · Ilık durula · PAT PAT kuru — sürme!\n→ Yüz KURU',
      '② The Ordinary HA 2% + B5\nYüze birkaç damla su serp · 3-4 damla PAT PAT · 20-30sn bekle\n→ Yüz NEMLİ ⚠️ Kuru yüze vurursan ters etki!',
      '③ The Ordinary Niacinamide 10% + Zinc\n3-4 damla PAT PAT · 30sn bekle\n→ Evdeysen RUTİN TAMAMDIR',
      '④ Isntree SPF50+ — SADECE DIŞARI ÇIKACAKSAN\n2 parmak uzunluğu · Hafifçe yay · 5dk bekle',
    ],
  },
  { id:'wi_kahvalti',      time:'08:00', label:'🍳 Kahvaltı — Öğün 1',        category:'beslenme',
    desc:'Protein: 28g | Carb: 27g | Yağ: 26g | ~458 kcal',
    steps:[
      '4 yumurta — haşlanmış veya omlet\nGünün en önemli protein kaynağı',
      '25g tuvsuz mısır patlaması\nDüşük kalori · Lif kaynağı',
      'Roka, maydanoz, salatalık\nAntioksidan · Sindirim desteği',
      '1 tsp zeytinyağı\nSağlıklı yağ · D3 emilimi artırır',
    ],
  },
  { id:'wi_vitamin_sabah', time:'08:05', label:'💊 Sabah Vitamini',           category:'vitamin',
    desc:'D3+K2 · Omega-3 · C Vitamini — tok karnına',
    steps:[
      'D3 Vitamini + K2 — 2000-3000 IU + 100mcg\nTok karnına · Yumurta yağıyla emilir',
      'Omega-3 Balık Yağı — 2 kapsül (~1g EPA+DHA)\nTok karnına · Max 2 — fazlası kan sulandırır',
      'C Vitamini — 500mg · Tok karnına',
    ],
  },
  { id:'wi_dis_1',         time:'08:10', label:'🦷 Diş #1',                   category:'bakim',
    desc:'Kahvaltı sonrası · Parodontax + su püskürtücü + gargara',
    steps:[
      'Parodontax macunla 2 dakika fırçala\nDiş eti için özel formula · Köpürtme, hafifçe bas',
      'Su püskürtücü — diş aralarını temizle (günde 1 kez sabah)',
      'Parodontax gargara — 30sn çalkala',
      '⚠️ SALI + CUMA: Hidrojen Peroksit Gargara\n%3 H₂O₂ + eşit miktarda su · 60sn çalkala · YUTMA!\nHaftada 2 kez · Beyazlatma + antibakteriyal',
    ],
  },
  { id:'wi_adim_sabah',    time:'08:15', label:'🚶 Sabah 1000 Adım',          category:'hareket', desc:'Ev içinde 1000 adım.' },
  { id:'wi_deep_work_1',   time:'09:00', label:'💻 Deep Work #1',             category:'is',      desc:'Odaklanma bloğu. Bildirimleri kapat.' },
  { id:'wi_su_1',          time:'09:30', label:'💧 Su — 250ml',               category:'su',      desc:'Bir bardak su iç.' },
  { id:'wi_barfiks_1',     time:'09:50', label:'💪 Barfiks — S1',             category:'barfiks', desc:'' },
  { id:'wi_support',       time:'10:45', label:'🎧 Support Bloğu',            category:'is',      desc:'Support görevlerine geç.' },
  { id:'wi_barfiks_2',     time:'10:50', label:'💪 Barfiks — S2',             category:'barfiks', desc:'' },
  { id:'wi_su_2',          time:'11:00', label:'💧 Su — 250ml',               category:'su',      desc:'Bir bardak su iç.' },
  { id:'wi_barfiks_3',     time:'11:50', label:'💪 Barfiks — S3',             category:'barfiks', desc:'' },
  { id:'wi_barfiks_4',     time:'12:10', label:'💪 Barfiks — S4',             category:'barfiks', desc:'' },
  { id:'wi_ogun_2',        time:'12:30', label:'🥤 Öğün 2 — Protein Shake',  category:'beslenme', desc:'Protein: 25g | ~132 kcal · 1 ölçek whey + 300ml su' },
  { id:'wi_barfiks_5',     time:'13:20', label:'💪 Barfiks — S5',             category:'barfiks', desc:'' },
  { id:'wi_deep_work_2',   time:'13:45', label:'💻 Deep Work #2',             category:'is',      desc:'İkinci odaklanma bloğu.' },
  { id:'wi_barfiks_6',     time:'14:20', label:'💪 Barfiks — S6',             category:'barfiks', desc:'' },
  { id:'wi_su_3',          time:'14:30', label:'💧 Su — 250ml',               category:'su',      desc:'Bir bardak su iç.' },
  { id:'wi_barfiks_7',     time:'15:20', label:'💪 Barfiks — S7',             category:'barfiks', desc:'' },
  { id:'wi_ogun_3',        time:'16:00', label:'🍗 Öğün 3 — Tavuk+Makarna', category:'beslenme',
    desc:'Protein: 86g | Carb: 130g | Yağ: 13g | ~977 kcal',
    steps:[
      '300g ızgara/haşlama tavuk göğsü\nYüksek protein · Düşük yağ',
      '1 bardak makarna (180g) VEYA pirinç\nKarmaşık karbonhidrat · Antrenman öncesi enerji\nDinlenme günü: 120g',
      'Buharda sebze + 1 tsp zeytinyağı',
    ],
  },
  { id:'wi_dis_2',         time:'16:05', label:'🦷 Diş #2 + Milk Thistle',    category:'bakim',
    desc:'Tavuk öğünü sonrası',
    steps:[
      'Parodontax macunla 2 dakika fırçala',
      'Parodontax gargara — 30sn',
      'Milk Thistle — 150-200mg silymarin\nSpor günleri (Sal/Çar/Per/Cmt/Paz) · Karaciğer koruması',
    ],
  },
  { id:'wi_preworkout',    time:'17:20', label:'⚡ Pre-Workout Stack',         category:'vitamin', sporOnly:true,
    desc:'Spora 10dk kala · Kreatin + Pre-workout + Elektrolit',
    steps:[
      'Kreatin Monohidrat — 5g · 500ml suya karıştır',
      'Pre-Workout (kafein+beta-alanin) — üretici dozu · Kalp için doz aşma',
      'Elektrolit (Na,K,Mg) — 1 porsiyon · Suya ekle',
    ],
  },
  { id:'wi_spor_hazirlik', time:'17:30', label:'🏃 Spora Çık!',               category:'spor',    sporOnly:true, desc:'Yola çık — 18:00\'de antrenmanda olman lazım.' },
  { id:'wi_antrenman',     time:'18:00', label:'🏋️ Antrenman Başladı',        category:'spor',    sporOnly:true, desc:'Odaklan. Telefonu cebine koy.' },
  { id:'wi_soguma',        time:'19:30', label:'✅ Antrenman Bitti',           category:'spor',    sporOnly:true, desc:'5-10dk soğuma ve germe.' },
  { id:'wi_ogun_4',        time:'19:45', label:'🥤 Öğün 4 — Shake + Duş',    category:'beslenme',
    desc:'Protein: 32g | Carb: 64g | ~414 kcal',
    steps:[
      '1 ölçek whey protein + 300ml su',
      '1 orta muz · Hızlı karbonhidrat',
      '50g yulaf (dinlenme: 30g)',
      'Sonra duş al 🚿',
    ],
  },
  { id:'wi_dis_3',         time:'19:55', label:'🦷 Diş #3',                   category:'bakim',
    desc:'Yulaf+Shake sonrası · Parodontax + gargara',
    steps:['Parodontax macunla 2 dakika fırçala','Parodontax gargara — 30sn'],
  },
  { id:'wi_adim_aksam',    time:'20:10', label:'🚶 Akşam 1000 Adım',          category:'hareket', desc:'Ev içinde 1000 adım.' },
  { id:'wi_barfiks_8',     time:'20:30', label:'💪 Barfiks — S8 (Son)',       category:'barfiks', desc:'' },
  { id:'wi_su_4',          time:'21:00', label:'💧 Su — 250ml',               category:'su',      desc:'Günün son su alarmı.' },
  { id:'wi_cilt_gece',     time:'22:00', label:'🌙 Gece Cilt Rutini',         category:'bakim',
    desc:'4 adım + Gua Sha · ~10 dakika',
    steps:[
      '① Anua Heartleaf Cleansing Oil\nYüz KURU · 2-3 pompa · 60sn masaj · Az su → beyazlaşır → durula\n⚠️ Islak yüze değil!',
      '② COSRX Low pH Cleanser\n30sn masaj · PAT PAT kuru → Yüz KURU',
      '③ The Ordinary HA 2% + B5\nBirkaç damla su serp · 3-4 damla PAT PAT',
      '④ The Ordinary Niacinamide 10% + Zinc\n3-4 damla PAT PAT · 30sn bekle',
      '⑤ Gua Sha — Yüz nemli iken · 15-30° açı\n1.Boyun↑ · 2.Çene→kulak · 3.Yanak→şakak · 4.Göz altı→dış · 5.Alın↑',
    ],
  },
  { id:'wi_gece_vitamin',  time:'22:30', label:'💊 Gece Vitamini + Kapanış',  category:'vitamin',
    desc:'Magnezyum + Psilyum · Yarın planı gözden geçir',
    steps:[
      'Magnezyum Glisinát — 300-400mg · Uyku kalitesi + kas gevşeme',
      'Psyllium Husk — 5g · 250ml suyla HIZLA iç (koyulaşmadan)',
      'Yarın planını gözden geçir · Uyku saati 23:30',
    ],
  },
  { id:'wi_uyku', time:'23:30', label:'😴 Uyku Vakti', category:'gece', desc:'Telefonu bırak. İyi geceler.' },
];

// ─── CUMARTESİ ───────────────────────────────────────────────────────────────
export const CUMARTESI_TASKS = [
  { id:'ct_wake_up',       time:'08:30', label:'⏰ Uyan!',                    category:'sabah',    desc:'Hafta sonu — 1 saat fazla uyku.' },
  { id:'ct_vakum',         time:'08:35', label:'🫁 Vakum Hareketi',           category:'sabah',    desc:'Aç karnına 5 dakika. 3 set × 15 saniye.' },
  { id:'ct_detoks',        time:'08:40', label:'🧃 Detoks İksiri',            category:'sabah',
    desc:'Zencefil+Limon+Pancar+Zerdeçal+Tarçın+200ml ılık su',
    steps:[
      'Zencefil — 1-2cm taze rendelenmiş',
      'Limon — ½ taze sıkılmış',
      'Pancar — ¼ küçük, suyunu sık',
      'Zerdeçal — ¼ tsp + 1 tutam kara biber (emilim için şart)',
      'Ceylon Tarçını — ¼ tsp',
      '200ml ılık su · Hepsini karıştır · 1dk beklet · İç',
    ],
  },
  { id:'ct_cilt_sabah',    time:'08:45', label:'🧴 Sabah Cilt Rutini',        category:'bakim',
    desc:'Dışarı çıkılacak → 4 adım · SPF şart',
    steps:[
      '① COSRX Cleanser · Islak yüze · 30sn · PAT PAT kuru',
      '② HA 2% + B5 · Su serp · PAT PAT',
      '③ Niacinamide · PAT PAT',
      '④ Isntree SPF50+ · 2 parmak uzunluğu · ATLANMAZ',
    ],
  },
  { id:'ct_kahvalti',      time:'09:00', label:'🍳 Kahvaltı — Öğün 1',        category:'beslenme',
    desc:'Protein: 28g | ~458 kcal',
    steps:['4 yumurta (haşlanmış/omlet)','25g tuzsuz mısır patlaması','Roka, maydanoz, salatalık + zeytinyağı'],
  },
  { id:'ct_vitamin',       time:'09:05', label:'💊 Sabah Vitamini',           category:'vitamin',  desc:'D3+K2 · Omega-3 · C Vitamini' },
  { id:'ct_dis_1',         time:'09:10', label:'🦷 Diş #1',                   category:'bakim',
    desc:'Kahvaltı sonrası · Parodontax + su püskürtücü + H₂O₂ gargara',
    steps:[
      'Parodontax macunla 2 dakika fırçala',
      'Su püskürtücü — günde 1 kez',
      '⚠️ CUMARTESİ: Hidrojen Peroksit Gargara\n%3 H₂O₂ : su = 1:1 · 60sn · YUTMA!',
    ],
  },
  { id:'ct_adim_sabah',    time:'09:15', label:'🚶 1000 Adım',                category:'hareket', desc:'Sabah 1000 adım.' },
  { id:'ct_youtube',       time:'09:30', label:'🎬 YouTube Projeleri',        category:'is',      desc:'Shorts, müzik playlist, içerik üretimi — 10:30\'a kadar.' },
  { id:'ct_su_1',          time:'10:00', label:'💧 Su — 250ml',               category:'su',      desc:'Bir bardak su iç.' },
  { id:'ct_spor_hazirlik', time:'10:30', label:'👕 Spor Hazırlık',            category:'spor',    desc:'Spor kıyafetini giy. Çanta: havlu, su şişesi, kulaklık.' },
  { id:'ct_preworkout',    time:'10:55', label:'⚡ Pre-Workout Stack',         category:'vitamin',
    desc:'Kreatin + Pre-workout + Elektrolit',
    steps:['Kreatin — 5g · 500ml suya','Pre-Workout — üretici dozu','Elektrolit — 1 porsiyon'],
  },
  { id:'ct_yola_cik',      time:'11:00', label:'🏃 Yola Çık!',                category:'spor',    desc:'11:30\'da spor salonunda olman lazım.' },
  { id:'ct_spor',          time:'11:30', label:'🏋️ Spor Başladı',             category:'spor',    desc:'Odaklan. Hypertrophy Max — Cumartesi: PUSH' },
  { id:'ct_spor_bitis',    time:'13:00', label:'✅ Spor Bitti',               category:'spor',    desc:'5-10dk soğuma.' },
  { id:'ct_ogun_2',        time:'13:30', label:'🥤 Öğün 2 — Protein Shake',  category:'beslenme', desc:'Protein: 25g | ~132 kcal · 1 ölçek whey + 300ml su' },
  { id:'ct_dus',           time:'13:45', label:'🚿 Duş',                      category:'sabah',   desc:'Spor sonrası duş.' },
  { id:'ct_pc',            time:'14:00', label:'💻 PC — Kişisel Zaman',       category:'is',      desc:'YouTube, oyun, kişisel projeler.' },
  { id:'ct_barfiks_1',     time:'14:30', label:'💪 Barfiks — S1',             category:'barfiks', desc:'' },
  { id:'ct_alisveris',     time:'15:00', label:'🛒 Alışveriş Hatırlatma',     category:'sabah',
    desc:'Pazar için detoks malzemelerini kontrol et!\nZencefil · Limon · Pancar · Zerdeçal · Tarçın · Kara Biber\nEksik varsa bugün al.' },
  { id:'ct_barfiks_2',     time:'15:20', label:'💪 Barfiks — S2',             category:'barfiks', desc:'' },
  { id:'ct_barfiks_3',     time:'16:10', label:'💪 Barfiks — S3',             category:'barfiks', desc:'' },
  { id:'ct_ogun_3',        time:'16:50', label:'🍗 Öğün 3 — Tavuk+Makarna', category:'beslenme',
    desc:'Protein: 86g | ~977 kcal',
    steps:['300g ızgara/haşlama tavuk göğsü','1 bardak makarna (180g) VEYA pirinç','Buharda sebze + zeytinyağı'],
  },
  { id:'ct_dis_2',         time:'17:05', label:'🦷 Diş #2 + Milk Thistle',   category:'bakim',
    desc:'Tavuk öğünü sonrası',
    steps:['Parodontax macunla 2 dakika fırçala','Parodontax gargara — 30sn','Milk Thistle — 150-200mg'],
  },
  { id:'ct_adim_2',        time:'17:15', label:'🚶 1000 Adım',                category:'hareket', desc:'Solid yemek sonrası 1000 adım.' },
  { id:'ct_barfiks_4',     time:'17:30', label:'💪 Barfiks — S4',             category:'barfiks', desc:'' },
  { id:'ct_barfiks_5',     time:'18:20', label:'💪 Barfiks — S5',             category:'barfiks', desc:'' },
  { id:'ct_su_2',          time:'19:00', label:'💧 Su — 250ml',               category:'su',      desc:'Bir bardak su iç.' },
  { id:'ct_ogun_4',        time:'19:45', label:'🥤 Öğün 4 — Shake',          category:'beslenme', desc:'Protein: 32g | ~414 kcal · Whey + muz + yulaf' },
  { id:'ct_dis_3',         time:'19:55', label:'🦷 Diş #3',                   category:'bakim',
    desc:'Yulaf+Shake sonrası',
    steps:['Parodontax macunla 2 dakika fırçala','Parodontax gargara — 30sn'],
  },
  { id:'ct_adim_3',        time:'20:10', label:'🚶 1000 Adım',                category:'hareket', desc:'Akşam 1000 adım.' },
  { id:'ct_barfiks_6',     time:'20:30', label:'💪 Barfiks — S6',             category:'barfiks', desc:'' },
  { id:'ct_su_3',          time:'21:00', label:'💧 Su — 250ml',               category:'su',      desc:'Günün son su alarmı.' },
  // ── GECE: 22:00 Gece Vitamini → 22:30 Cilt Rutini → 23:00 Uyku ──
  { id:'ct_gece_vitamin',  time:'22:00', label:'💊 Gece Vitamini + Kapanış',  category:'vitamin',
    desc:'Magnezyum + Psilyum · Yarın planı gözden geçir',
    steps:[
      'Magnezyum Glisinát — 300-400mg · Uyku kalitesi + kas gevşeme',
      'Psyllium Husk — 5g · 250ml suyla HIZLA iç',
      'Yarın planını gözden geçir',
    ],
  },
  { id:'ct_cilt_gece',     time:'22:30', label:'🌙 Gece Cilt Rutini',         category:'bakim',
    desc:'4 adım + Gua Sha · ~10 dakika',
    steps:[
      '① Anua Cleansing Oil — Kuru yüze · 60sn · Emülsifiye · Durula',
      '② COSRX Cleanser — 30sn · PAT PAT kuru',
      '③ HA 2% + B5 — Su serp · PAT PAT',
      '④ Niacinamide — PAT PAT',
      '⑤ Gua Sha — Nemli yüze · Boyun→Çene→Yanak→Göz altı→Alın',
    ],
  },
  { id:'ct_uyku', time:'23:00', label:'😴 Uyku Vakti', category:'gece', desc:'Telefonu bırak. İyi geceler.' },
];

// ─── PAZAR ───────────────────────────────────────────────────────────────────
export const PAZAR_TASKS = [
  { id:'pz_wake_up',       time:'08:30', label:'⏰ Uyan!',                    category:'sabah',    desc:'Pazar — dinlenme günü, spor yok.' },
  { id:'pz_vakum',         time:'08:35', label:'🫁 Vakum Hareketi',           category:'sabah',    desc:'Aç karnına 5 dakika. 3 set × 15 saniye.' },
  { id:'pz_detoks',        time:'08:40', label:'🧃 Detoks İksiri',            category:'sabah',    desc:'Zencefil+Limon+Pancar+Zerdeçal+Tarçın+200ml ılık su.' },
  { id:'pz_cilt_sabah',    time:'08:45', label:'🧴 Sabah Cilt Rutini',        category:'bakim',
    desc:'Evde → 3 adım · SPF yok',
    steps:[
      '① COSRX Cleanser · Islak yüze · 30sn · PAT PAT kuru',
      '② HA 2% + B5 · Su serp · PAT PAT',
      '③ Niacinamide · PAT PAT · RUTİN TAMAM',
    ],
  },
  { id:'pz_kahvalti',      time:'09:00', label:'🍳 Kahvaltı — Öğün 1',        category:'beslenme',
    desc:'Protein: 28g | ~458 kcal',
    steps:['4 yumurta (haşlanmış/omlet)','25g tuzsuz mısır patlaması','Roka, maydanoz, salatalık + zeytinyağı'],
  },
  { id:'pz_vitamin',       time:'09:05', label:'💊 Sabah Vitamini',           category:'vitamin',  desc:'D3+K2 · Omega-3 · C Vitamini' },
  { id:'pz_dis_1',         time:'09:10', label:'🦷 Diş #1',                   category:'bakim',
    desc:'Kahvaltı sonrası · Parodontax + su püskürtücü + gargara',
    steps:[
      'Parodontax macunla 2 dakika fırçala',
      'Su püskürtücü — günde 1 kez',
      'Parodontax gargara — 30sn',
    ],
  },
  { id:'pz_adim_sabah',    time:'09:15', label:'🚶 1000 Adım',                category:'hareket', desc:'Sabah 1000 adım.' },
  { id:'pz_youtube',       time:'09:30', label:'🎬 YouTube / Oyun / Proje',  category:'is',      desc:'Kişisel projeler, oyun, YouTube — 11:00\'e kadar.' },
  { id:'pz_barfiks_1',     time:'09:50', label:'💪 Barfiks — S1',             category:'barfiks', desc:'' },
  { id:'pz_su_1',          time:'10:00', label:'💧 Su — 250ml',               category:'su',      desc:'Bir bardak su iç.' },
  { id:'pz_barfiks_2',     time:'10:50', label:'💪 Barfiks — S2',             category:'barfiks', desc:'' },
  { id:'pz_su_2',          time:'11:00', label:'💧 Su — 250ml',               category:'su',      desc:'Bir bardak su iç.' },
  { id:'pz_barfiks_3',     time:'11:50', label:'💪 Barfiks — S3',             category:'barfiks', desc:'' },
  { id:'pz_ogun_2',        time:'13:00', label:'🍗 Öğün 2 — Yulaf+Sebze',   category:'beslenme',
    desc:'Solid öğün · Yulaf 180g + sebze + zeytinyağı',
    steps:['180g yulaf (haşlanmış)','Buharda sebze — brokoli, havuç, kabak','1 tsp zeytinyağı'],
  },
  { id:'pz_dis_2',         time:'13:05', label:'🦷 Diş #2',                   category:'bakim',
    desc:'Yulaf öğünü sonrası',
    steps:['Parodontax macunla 2 dakika fırçala','Parodontax gargara — 30sn'],
  },
  { id:'pz_adim_2',        time:'13:25', label:'🚶 1000 Adım',                category:'hareket', desc:'Solid yemek sonrası 1000 adım.' },
  { id:'pz_pc',            time:'14:00', label:'💻 PC — Oyun / Proje',        category:'is',      desc:'Kişisel zaman. Oyun, YouTube, projeler.' },
  { id:'pz_barfiks_4',     time:'14:40', label:'💪 Barfiks — S4',             category:'barfiks', desc:'' },
  { id:'pz_barfiks_5',     time:'15:40', label:'💪 Barfiks — S5',             category:'barfiks', desc:'' },
  { id:'pz_barfiks_6',     time:'16:30', label:'💪 Barfiks — S6',             category:'barfiks', desc:'' },
  { id:'pz_su_3',          time:'16:50', label:'💧 Su — 250ml',               category:'su',      desc:'Bir bardak su iç.' },
  { id:'pz_ogun_3',        time:'18:00', label:'🥤 Öğün 3 — Yulaf+Shake',   category:'beslenme',
    desc:'Protein: 32g | ~414 kcal',
    steps:['50g yulaf','1 ölçek whey + 300ml su','1 orta muz'],
  },
  { id:'pz_dis_3',         time:'18:05', label:'🦷 Diş #3',                   category:'bakim',
    desc:'Yulaf+Shake sonrası',
    steps:['Parodontax macunla 2 dakika fırçala','Parodontax gargara — 30sn'],
  },
  { id:'pz_adim_3',        time:'18:15', label:'🚶 1000 Adım',                category:'hareket', desc:'Akşam 1000 adım.' },
  { id:'pz_barfiks_7',     time:'18:30', label:'💪 Barfiks — S7',             category:'barfiks', desc:'' },
  { id:'pz_barfiks_8',     time:'20:30', label:'💪 Barfiks — S8 (Son)',       category:'barfiks', desc:'' },
  { id:'pz_su_4',          time:'21:00', label:'💧 Su — 250ml',               category:'su',      desc:'Günün son su alarmı.' },
  // ── GECE: 22:00 Gece Vitamini → 22:30 Cilt Rutini → 23:00 Uyku ──
  { id:'pz_gece_vitamin',  time:'22:00', label:'💊 Gece Vitamini + Kapanış',  category:'vitamin',
    desc:'Magnezyum + Psilyum · Yarın planı gözden geçir',
    steps:[
      'Magnezyum Glisinát — 300-400mg · Uyku kalitesi + kas gevşeme',
      'Psyllium Husk — 5g · 250ml suyla HIZLA iç',
      'Yarın planını gözden geçir',
    ],
  },
  { id:'pz_cilt_gece',     time:'22:30', label:'🌙 Gece Cilt Rutini',         category:'bakim',
    desc:'4 adım + Gua Sha · ~10 dakika',
    steps:[
      '① Anua Cleansing Oil — Kuru yüze · 60sn · Emülsifiye · Durula',
      '② COSRX Cleanser — 30sn · PAT PAT kuru',
      '③ HA 2% + B5 — Su serp · PAT PAT',
      '④ Niacinamide — PAT PAT',
      '⑤ Gua Sha — Nemli yüze · Boyun→Çene→Yanak→Göz altı→Alın',
    ],
  },
  { id:'pz_uyku', time:'23:00', label:'😴 Uyku Vakti', category:'gece', desc:'Telefonu bırak. İyi geceler.' },
];

// ─── NAMAZ ───────────────────────────────────────────────────────────────────
export const NAMAZ_TASKS = [
  { id:'namaz_sabah',  label:'🕌 Sabah Namazı',  key:'sabah'  },
  { id:'namaz_ogle',   label:'🕌 Öğle Namazı',   key:'ogle'   },
  { id:'namaz_ikindi', label:'🕌 İkindi Namazı', key:'ikindi' },
  { id:'namaz_aksam',  label:'🕌 Akşam Namazı',  key:'aksam'  },
  { id:'namaz_yatsi',  label:'🕌 Yatsı Namazı',  key:'yatsi'  },
];

const NAMAZ_ALARM_TABLE = {
  1:  { sabah:'07:54', ogleIkindi:'15:17', aksamYatsi:'19:04' },
  2:  { sabah:'07:18', ogleIkindi:'15:47', aksamYatsi:'19:34' },
  3:  { sabah:'06:28', ogleIkindi:'16:13', aksamYatsi:'20:05' },
  4:  { sabah:'05:42', ogleIkindi:'16:31', aksamYatsi:'20:42' },
  5:  { sabah:'05:13', ogleIkindi:'16:42', aksamYatsi:'21:24' },
  6:  { sabah:'05:09', ogleIkindi:'16:51', aksamYatsi:'22:08' },
  7:  { sabah:'05:14', ogleIkindi:'16:55', aksamYatsi:'21:52' },
  8:  { sabah:'05:38', ogleIkindi:'16:35', aksamYatsi:'20:56' },
  9:  { sabah:'06:08', ogleIkindi:'16:03', aksamYatsi:'20:00' },
  10: { sabah:'06:38', ogleIkindi:'15:27', aksamYatsi:'19:15' },
  11: { sabah:'07:13', ogleIkindi:'15:07', aksamYatsi:'18:54' },
  12: { sabah:'07:47', ogleIkindi:'15:07', aksamYatsi:'18:54' },
};

export function getTodayTasks() {
  const set = getTodayTaskSet();
  if (set === 'cumartesi') return CUMARTESI_TASKS;
  if (set === 'pazar')     return PAZAR_TASKS;
  return HAFTA_ICI_TASKS;
}

// Namaz görevlerini bugünün saatleriyle döndürür
export function getTodayNamazTasks() {
  const month  = new Date().getMonth() + 1;
  const vakitler = NAMAZ_ALARM_TABLE[month] || { sabah:'06:00', ogleIkindi:'13:00', aksamYatsi:'20:00' };
  return [
    { id:'namaz_sabah',       time: vakitler.sabah,      label:'🕌 Sabah Namazı',   category:'namaz', desc:'Sabah namazı · Güneş doğmadan önce' },
    { id:'namaz_ogle_ikindi', time: vakitler.ogleIkindi, label:'🕌 Öğle + İkindi',  category:'namaz', desc:'Öğle ve ikindi namazları' },
    { id:'namaz_aksam_yatsi', time: vakitler.aksamYatsi, label:'🕌 Akşam + Yatsı',  category:'namaz', desc:'Akşam ve yatsı namazları' },
  ];
}

// Bildirim planlamak için tüm görevleri (rutin + namaz) birleştirir
export function getAllSchedulableTasks() {
  return [...getTodayTasks(), ...getTodayNamazTasks()];
}

export const TASKS        = HAFTA_ICI_TASKS;
export const TIMED_TASKS  = HAFTA_ICI_TASKS;
export const KELIME_TIMES = ['09:00', '13:30', '20:30'];