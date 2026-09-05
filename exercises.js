/* ============ EGZERSİZ GÖRSELLERİ ============
   - İki kare tekniği (başlangıç/bitiş pozu, keskin geçiş)
   - Dolgulu silüet figürler: konik uzuvlar, saç, şort, el/ayak
   - Ekipman etiketi + yön oku + efor anında yükselen istif
*/
"use strict";

/* Türkçe kas isimleri */
const MUSCLE_TR = {
  chest: "Göğüs", delts: "Omuz", rearDelts: "Arka omuz",
  biceps: "Biceps", triceps: "Triceps", forearms: "Ön kol",
  abs: "Karın", obliques: "Yan karın", traps: "Trapez",
  lats: "Kanat (Lat)", midBack: "Orta sırt", lowerBack: "Bel",
  glutes: "Kalça", quads: "Ön bacak", hamstrings: "Arka bacak", calves: "Baldır",
  adductors: "İç bacak"
};

/* Filtre sözlükleri */
const EX_GROUPS = {
  chest: "Göğüs", back: "Sırt", shoulders: "Omuz",
  arms: "Kol", legs: "Bacak", core: "Karın"
};
const EQUIP_TR = {
  machine: "Makine", cable: "Kablo", dumbbell: "Dambıl",
  barbell: "Barbell", body: "Vücut Ağırlığı"
};

/* Hareket kütüphanesi: kaslar + animasyon + grup + ekipman + hedef + adımlar
   Adım metinleri bu uygulama için yazılmış özgün özetlerdir. */
const EX_INFO = {
  /* ---- GÖĞÜS · MAKİNE ---- */
  "Machine Chest Press":      { g: "chest", eq: "machine", t: "3 × 10", p: ["chest"], s: ["delts", "triceps"], anim: "chestPress",
    steps: ["Sırtını yaslayıp tutamaçları göğüs hizasına ayarla.", "Kolları öne doğru tam uzat, dirsekleri kilitleme.", "Ağırlığı kontrollü şekilde göğsüne doğru geri getir."] },
  "Incline Chest Press Machine": { g: "chest", eq: "machine", t: "3 × 10", p: ["chest"], s: ["delts", "triceps"], anim: "chestPress",
    steps: ["Eğimli sırtlığa yaslan, tutamaçlar üst göğüs hizasında olsun.", "Yukarı-öne doğru it, üst göğüste sıkışmayı hisset.", "Yavaşça başlangıca dön."] },
  "Decline Chest Press Machine": { g: "chest", eq: "machine", t: "3 × 10", p: ["chest"], s: ["triceps", "delts"], anim: "chestPress",
    steps: ["Sırtlığı hafif aşağı eğimli ayarla ve otur.", "Tutamaçları alt göğüs hizasından öne doğru it.", "Direnci hissederek kontrollü geri dön."] },
  "Pec Deck":                 { g: "chest", eq: "machine", t: "3 × 12", p: ["chest"], s: ["delts"], anim: "pecDeck",
    steps: ["Otur, ön kollarını/ellerini pedlere yerleştir.", "Kollarını önde birleştir, göğsünü sık.", "Kolları kontrollü şekilde geriye aç, göğüste esneme hisset."] },
  "Chest Press (Plate-Loaded)": { g: "chest", eq: "machine", t: "3 × 10", p: ["chest"], s: ["delts", "triceps"], anim: "chestPress",
    steps: ["Plakaları tak, oturağı göğüs hizasına ayarla.", "İki kolu birlikte öne it.", "Ağırlığı yavaşça geri indir, plakaları çarptırma."] },
  "Smith Machine Bench Press": { g: "chest", eq: "machine", t: "3 × 8", p: ["chest"], s: ["delts", "triceps"], anim: "benchPress",
    steps: ["Bench'i barın altına yerleştir, bar göğüs hizasında olsun.", "Barı kilitten çevirerek çıkar, göğsüne indir.", "Göğüsten yukarı doğru güçlü şekilde it."] },
  "Smith Machine Incline Press": { g: "chest", eq: "machine", t: "3 × 8", p: ["chest"], s: ["delts", "triceps"], anim: "benchPress",
    steps: ["Eğimli bench'i Smith barının altına kur.", "Barı üst göğsüne kadar indir.", "Yukarı-öne doğru it, dirsekleri kilitleme."] },
  "Smith Machine Decline Press": { g: "chest", eq: "machine", t: "3 × 8", p: ["chest"], s: ["triceps", "delts"], anim: "benchPress",
    steps: ["Aşağı eğimli bench'i barın altına kur.", "Barı alt göğsüne indir.", "Kontrollü şekilde yukarı it."] },
  "Seated Dip Machine":       { g: "chest", eq: "machine", t: "3 × 10", p: ["chest", "triceps"], s: ["delts"], anim: "chestPress",
    steps: ["Otur, tutamaçları kavra, göğsünü hafif öne eğ.", "Kollarını aşağı-geriye doğru bastır.", "Dirsekler 90°'ye gelene kadar yavaşça geri dön."] },
  "Assisted Dip Machine":     { g: "chest", eq: "machine", t: "3 × 10", p: ["chest", "triceps"], s: ["delts"], anim: "pushup",
    steps: ["Diz pedine çık, tutamaçları kavra (destek ağırlığı ne kadar yüksekse hareket o kadar kolay).", "Gövdeni hafif öne eğerek dirseklerini bük ve alçal.", "Göğsünle iterek yukarı çık."] },

  /* ---- GÖĞÜS · KABLO ---- */
  "Cable Crossover (High)":   { g: "chest", eq: "cable", t: "3 × 12", p: ["chest"], s: ["delts"], anim: "pecDeck",
    steps: ["Makaraları en üste ayarla, ortada bir adım öne çık.", "Kollarını hafif bükük tutarak aşağı-öne, kalça hizasında birleştir.", "Göğsünü sıkıp yavaşça geriye aç."] },
  "Cable Crossover (Low)":    { g: "chest", eq: "cable", t: "3 × 12", p: ["chest"], s: ["delts"], anim: "pecDeck",
    steps: ["Makaraları en alta ayarla, kulpları avuçlar öne bakacak şekilde tut.", "Kolları aşağıdan yukarı-öne, göz hizasında birleştir.", "Üst göğüste sıkışmayı hissedip kontrollü dön."] },
  "Cable Fly":                { g: "chest", eq: "cable", t: "3 × 12", p: ["chest"], s: ["delts"], anim: "pecDeck",
    steps: ["Makaraları göğüs hizasına ayarla, ortada dur.", "Hafif bükük kollarla kulpları önde birleştir.", "Gerilimi koruyarak kolları yanlara aç."] },
  "Cable Chest Press":        { g: "chest", eq: "cable", t: "3 × 10", p: ["chest"], s: ["delts", "triceps"], anim: "chestPress",
    steps: ["Sırtın makaralara dönük, kulplar göğüs hizasında; bir adım öne çık.", "İki kolu birlikte öne doğru uzat.", "Dirsekleri geriye alarak yavaşça dön."] },
  "Single-Arm Cable Fly":     { g: "chest", eq: "cable", t: "3 × 12", p: ["chest"], s: ["delts", "abs"], anim: "pecDeck",
    steps: ["Tek kulpu göğüs hizasından tut, yan dur.", "Kolu hafif bükük tutarak gövdenin önüne getir.", "Gövdeni döndürmeden kontrollü geri aç."] },

  /* ---- GÖĞÜS · DAMBIL/BARBELL/VÜCUT ---- */
  "Bench Press (Barbell)":    { g: "chest", eq: "barbell", t: "3 × 8",  p: ["chest"], s: ["delts", "triceps"], anim: "benchPress",
    steps: ["Bench'e uzan, barı omuzdan biraz geniş kavra.", "Barı göğsünün ortasına kontrollü indir.", "Ayaklardan destek alarak yukarı it."] },
  "Dambıl Bench Press":       { g: "chest", eq: "dumbbell", t: "3 × 10", p: ["chest"], s: ["delts", "triceps"], anim: "benchPress",
    steps: ["Bench'e uzan, dambılları göğüs hizasında tut.", "İkisini birlikte yukarı it, üstte hafifçe yaklaştır.", "Dirsekler 45° açıyla yavaşça indir."] },
  "Incline Dambıl Press":     { g: "chest", eq: "dumbbell", t: "3 × 10", p: ["chest"], s: ["delts", "triceps"], anim: "benchPress",
    steps: ["Bench'i 30–45° eğime ayarla ve uzan.", "Dambılları üst göğüs hizasından yukarı it.", "Kontrollü şekilde başlangıca indir."] },
  "Decline Dambıl Press":     { g: "chest", eq: "dumbbell", t: "3 × 10", p: ["chest"], s: ["triceps", "delts"], anim: "benchPress",
    steps: ["Aşağı eğimli bench'e uzan, ayaklarını sabitle.", "Dambılları alt göğüsten yukarı it.", "Yavaşça geri indir."] },
  "Dambıl Fly":               { g: "chest", eq: "dumbbell", t: "3 × 12", p: ["chest"], s: ["delts"], anim: "pecDeck",
    steps: ["Bench'e uzan, dambılları avuçlar birbirine bakacak şekilde yukarıda tut.", "Hafif bükük kollarla yanlara doğru aç.", "Göğsünü sıkarak tekrar birleştir."] },
  "Incline Dambıl Fly":       { g: "chest", eq: "dumbbell", t: "3 × 12", p: ["chest"], s: ["delts"], anim: "pecDeck",
    steps: ["Eğimli bench'e uzan, dambıllar yukarıda.", "Kolları kavis çizerek yanlara aç.", "Üst göğüsle sıkarak birleştir."] },
  "Dambıl Pullover":          { g: "chest", eq: "dumbbell", t: "3 × 12", p: ["chest", "lats"], s: ["triceps"], anim: "benchPress",
    steps: ["Bench'e uzan, tek dambılı iki elle göğsünün üstünde tut.", "Kolları hafif bükük tutarak dambılı başının arkasına indir.", "Göğüs ve kanat kaslarınla yukarı geri çek."] },
  "Dambıl Squeeze Press":     { g: "chest", eq: "dumbbell", t: "3 × 10", p: ["chest"], s: ["triceps", "delts"], anim: "benchPress",
    steps: ["Dambılları birbirine bastırarak göğsünün üstünde tut.", "Sıkıştırmayı bozmadan yukarı it.", "Aynı baskıyla yavaşça indir."] },
  "Push-Up":                  { g: "chest", eq: "body", t: "3 × 15", p: ["chest"], s: ["triceps", "delts", "abs"], anim: "pushup", bodyweight: true,
    steps: ["Eller omuz genişliğinde, vücut düz bir çizgide plank pozisyonu al.", "Dirsekleri bükerek göğsünü yere yaklaştır.", "Gövdeni sabit tutarak yukarı it."] },
  "Dips":                     { g: "chest", eq: "body", t: "3 × 10", p: ["chest"], s: ["triceps", "delts"], anim: "pushup", bodyweight: true,
    steps: ["Paralel barlarda kollar düz, gövde hafif öne eğik başla.", "Dirsekleri bükerek alçal.", "Göğsünle iterek başlangıca çık."] },

  /* ---- SIRT · MAKİNE ---- */
  "Seated Row Machine":       { g: "back", eq: "machine", t: "3 × 10", p: ["midBack", "lats"], s: ["biceps", "rearDelts"], anim: "row",
    steps: ["Otur, göğsünü pede yasla, tutamaçları kavra.", "Dirsekleri geriye çekerek kürek kemiklerini birleştir.", "Kolları kontrollü şekilde öne uzat."] },
  "High Row Machine":         { g: "back", eq: "machine", t: "3 × 10", p: ["lats", "midBack"], s: ["biceps", "rearDelts"], anim: "row",
    steps: ["Otur, göğsünü pede yasla, tutamaçları yukarıdan kavra.", "Dirsekleri aşağı-geriye çek.", "Yavaşça başlangıca dön."] },
  "T-Bar Row Machine":        { g: "back", eq: "machine", t: "3 × 10", p: ["midBack", "lats"], s: ["biceps", "rearDelts", "lowerBack"], anim: "row",
    steps: ["Göğüs pedine yaslan, tutamaçları kavra.", "Barı gövdene doğru çek, sırtını sık.", "Ağırlığı kontrollü indir."] },
  "Assisted Pull-Up Machine": { g: "back", eq: "machine", t: "3 × 8", p: ["lats"], s: ["biceps", "midBack"], anim: "pullup",
    steps: ["Diz pedine çık, barı geniş kavra (destek ağırlığı arttıkça kolaylaşır).", "Çenen bar hizasına gelene kadar kendini çek.", "Yavaşça kolların düzleşene kadar in."] },
  "Back Extension Machine":   { g: "back", eq: "machine", t: "3 × 12", p: ["lowerBack"], s: ["glutes", "hamstrings"], anim: "deadlift",
    steps: ["Pedleri ayarla, gövdeni öne doğru eğ.", "Belinle gövdeni düz konuma kaldır.", "Aşırı geriye yaslanmadan kontrollü in."] },
  "Smith Machine Row":        { g: "back", eq: "machine", t: "3 × 8", p: ["midBack", "lats"], s: ["biceps", "rearDelts", "lowerBack"], anim: "row",
    steps: ["Barın üstünde öne eğil, sırtın düz olsun.", "Barı karnına doğru çek.", "Kolları uzatarak yavaşça indir."] },

  /* ---- SIRT · KABLO ---- */
  "Lat Pulldown":             { g: "back", eq: "cable", t: "3 × 10", p: ["lats"], s: ["biceps", "midBack", "rearDelts"], anim: "pulldown",
    steps: ["Barı omuzdan geniş kavra, dizlerini pedin altına sabitle.", "Barı göğsünün üstüne doğru çek, dirsekler aşağıyı göstersin.", "Kanatlarını hissederek yavaşça yukarı bırak."] },
  "Close-Grip Lat Pulldown":  { g: "back", eq: "cable", t: "3 × 10", p: ["lats"], s: ["biceps", "midBack"], anim: "pulldown",
    steps: ["V-kulpu dar tutuşla kavra.", "Kulpu göğsüne doğru çek, göğsünü hafif dik tut.", "Kontrollü şekilde yukarı dön."] },
  "Straight-Arm Pulldown":    { g: "back", eq: "cable", t: "3 × 12", p: ["lats"], s: ["triceps", "abs"], anim: "pulldown",
    steps: ["Yüksek makaradaki barı düz kollarla omuz hizasında tut.", "Kolları bükmeden barı kalçana doğru indir.", "Kanatların gerilimini koruyarak yukarı dön."] },
  "Seated Cable Row":         { g: "back", eq: "cable", t: "3 × 10", p: ["midBack", "lats"], s: ["biceps", "rearDelts", "lowerBack"], anim: "row",
    steps: ["Otur, ayaklarını platforma daya, kulpu kavra.", "Dik gövdeyle kulpu karnına çek.", "Omuzları öne yuvarlamadan kontrollü uzat."] },
  "Single-Arm Cable Row":     { g: "back", eq: "cable", t: "3 × 10", p: ["lats", "midBack"], s: ["biceps", "obliques"], anim: "row",
    steps: ["Tek kulpu kavra, karşı ayağı önde durabilirsin.", "Dirseği gövdene yakın geriye çek.", "Gövdeni döndürmeden yavaşça uzat."] },
  "Cable Pullover":           { g: "back", eq: "cable", t: "3 × 12", p: ["lats"], s: ["triceps", "chest"], anim: "pulldown",
    steps: ["Yüksek makara karşısında hafif öne eğil, barı düz kollarla tut.", "Kolları bükmeden barı uyluklarına indir.", "Kanatları gererek başlangıca dön."] },

  /* ---- SIRT · DAMBIL/BARBELL/VÜCUT ---- */
  "One-Arm Dambıl Row":       { g: "back", eq: "dumbbell", t: "3 × 10", p: ["lats", "midBack"], s: ["biceps", "rearDelts"], anim: "row",
    steps: ["Bir dizini ve elini bench'e koy, diğer elde dambıl.", "Dambılı kalça yönünde beline doğru çek.", "Sırtını sıkıp yavaşça indir."] },
  "Bent-Over Dambıl Row":     { g: "back", eq: "dumbbell", t: "3 × 10", p: ["midBack", "lats"], s: ["biceps", "rearDelts", "lowerBack"], anim: "row",
    steps: ["Dizler hafif bükük, gövde öne eğik, sırt düz.", "İki dambılı birlikte karnına çek.", "Kontrollü şekilde aşağı uzat."] },
  "Dambıl Deadlift":          { g: "back", eq: "dumbbell", t: "3 × 8", p: ["lowerBack", "glutes", "hamstrings"], s: ["traps", "forearms", "quads"], anim: "deadlift",
    steps: ["Dambıllar bacaklarının önünde, sırt düz öne eğil.", "Kalça ve bacakla iterek dik konuma kalk.", "Kalçayı geriye alarak kontrollü in."] },
  "Renegade Row":             { g: "back", eq: "dumbbell", t: "3 × 8", p: ["lats", "midBack"], s: ["abs", "obliques", "biceps"], anim: "plank",
    steps: ["İki dambılın üstünde plank pozisyonu al.", "Bir dambılı beline doğru çek, gövdeyi sabit tut.", "İndir ve diğer kolla tekrarla."] },
  "Barbell Row":              { g: "back", eq: "barbell", t: "3 × 8",  p: ["midBack", "lats"], s: ["biceps", "rearDelts", "lowerBack"], anim: "row",
    steps: ["Barı omuz genişliğinde kavra, gövde öne eğik, sırt düz.", "Barı karnına doğru çek.", "Kolları uzatarak kontrollü indir."] },
  "T-Bar Row":                { g: "back", eq: "barbell", t: "3 × 10", p: ["midBack", "lats"], s: ["biceps", "rearDelts"], anim: "row",
    steps: ["Barın üstüne binip kulpu iki elle kavra.", "Barı göğsüne doğru çek.", "Yavaşça indir, beli bükme."] },
  "Pull-Up":                  { g: "back", eq: "body", t: "3 × 8",  p: ["lats"], s: ["biceps", "midBack"], anim: "pullup", bodyweight: true,
    steps: ["Barı omuzdan geniş kavra, asıl.", "Çenen bar hizasına gelene kadar kendini yukarı çek.", "Sallanmadan kontrollü in."] },
  "Deadlift":                 { g: "back", eq: "barbell", t: "3 × 5",  p: ["lowerBack", "glutes", "hamstrings"], s: ["traps", "forearms", "quads"], anim: "deadlift",
    steps: ["Bar ayak ortanda; kalçadan eğilip omuz genişliğinde kavra.", "Sırt düz, göğüs dik — bacaklarla iterek kalk.", "Kalçayı geriye alarak barı kontrollü indir."] },

  /* ---- OMUZ · MAKİNE ---- */
  "Shoulder Press Machine":   { g: "shoulders", eq: "machine", t: "3 × 10", p: ["delts"], s: ["triceps", "traps"], anim: "shoulderPress",
    steps: ["Otur, sırtını yasla, tutamaçlar omuz hizasında.", "Kolları yukarı doğru uzat, dirsekleri kilitleme.", "Kulak hizasına kadar kontrollü indir."] },
  "Lateral Raise Machine":    { g: "shoulders", eq: "machine", t: "3 × 12", p: ["delts"], s: ["traps"], anim: "latRaise",
    steps: ["Otur, kollarını yan pedlerin altına yerleştir.", "Dirseklerinle pedleri omuz hizasına kaldır.", "Yavaşça başlangıca indir."] },
  "Reverse Pec Deck":         { g: "shoulders", eq: "machine", t: "3 × 12", p: ["rearDelts"], s: ["midBack", "traps"], anim: "pecDeck",
    steps: ["Göğsün pede dönük otur, tutamaçları önde kavra.", "Kollarını hafif bükük tutarak geriye-yanlara aç.", "Arka omuzda sıkışmayı hissedip kontrollü dön."] },
  "Shrug Machine":            { g: "shoulders", eq: "machine", t: "3 × 12", p: ["traps"], s: ["forearms"], anim: "shrug",
    steps: ["Tutamaçları yanlardan kavra, kollar düz.", "Omuzlarını kulaklarına doğru kaldır.", "Tepede 1 sn tutup yavaşça indir."] },
  "Smith Machine Overhead Press": { g: "shoulders", eq: "machine", t: "3 × 8", p: ["delts"], s: ["triceps", "traps"], anim: "shoulderPress",
    steps: ["Barın altına otur/dur, bar çene hizasında.", "Barı başının üstüne doğru it.", "Kontrollü şekilde çene hizasına indir."] },

  /* ---- OMUZ · KABLO ---- */
  "Face Pull (Cable)":        { g: "shoulders", eq: "cable", t: "3 × 15", p: ["rearDelts"], s: ["traps", "midBack"], anim: "facePull",
    steps: ["Halatı yüz hizasındaki makaradan iki elle tut.", "Dirsekleri yukarıda tutarak halatı yüzüne doğru çek, uçları ayır.", "Arka omuzda sıkışıp yavaşça uzat."] },
  "Cable Lateral Raise":      { g: "shoulders", eq: "cable", t: "3 × 12", p: ["delts"], s: ["traps"], anim: "latRaise",
    steps: ["Alçak makaranın yanında dur, kulpu karşı elle tut.", "Kolu hafif bükük şekilde omuz hizasına kaldır.", "Direnci hissederek yavaşça indir."] },
  "Cable Front Raise":        { g: "shoulders", eq: "cable", t: "3 × 12", p: ["delts"], s: ["traps"], anim: "latRaise",
    steps: ["Sırtın makaraya dönük, kulp uyluk önünde.", "Düz kolla kulpu omuz hizasına öne kaldır.", "Kontrollü şekilde indir."] },
  "Cable Rear Delt Fly":      { g: "shoulders", eq: "cable", t: "3 × 12", p: ["rearDelts"], s: ["midBack"], anim: "pecDeck",
    steps: ["İki kabloyu çapraz kavra (sağ el sol kulp).", "Kollarını geriye-yanlara doğru aç.", "Arka omuzları sıkıp yavaşça dön."] },
  "Cable Upright Row":        { g: "shoulders", eq: "cable", t: "3 × 10", p: ["delts", "traps"], s: ["biceps"], anim: "shrug",
    steps: ["Alçak makara barını dar tutuşla kavra.", "Dirsekleri yukarı çekerek barı göğüs hizasına kaldır.", "Yavaşça aşağı indir."] },

  /* ---- OMUZ · DAMBIL ---- */
  "Dambıl Shoulder Press":    { g: "shoulders", eq: "dumbbell", t: "3 × 10", p: ["delts"], s: ["triceps", "traps"], anim: "shoulderPress",
    steps: ["Dambılları omuz hizasında, avuçlar öne bakacak şekilde tut.", "İkisini birlikte başının üstüne it.", "Kulak hizasına kadar kontrollü indir."] },
  "Arnold Press":             { g: "shoulders", eq: "dumbbell", t: "3 × 10", p: ["delts"], s: ["triceps", "traps"], anim: "shoulderPress",
    steps: ["Dambılları avuçlar sana dönük, çene önünde tut.", "Yukarı iterken bilekleri dışa çevir.", "İndirirken içe çevirerek başlangıca dön."] },
  "Dambıl Lateral Raise":     { g: "shoulders", eq: "dumbbell", t: "3 × 15", p: ["delts"], s: ["traps"], anim: "latRaise",
    steps: ["Dambıllar yanlarda, dirsekler hafif bükük.", "Kolları omuz hizasına kadar yanlara kaldır.", "Sallanmadan yavaşça indir."] },
  "Dambıl Front Raise":       { g: "shoulders", eq: "dumbbell", t: "3 × 12", p: ["delts"], s: ["traps"], anim: "latRaise",
    steps: ["Dambıllar uyluklarının önünde.", "Düz kollarla omuz hizasına öne kaldır.", "Kontrollü şekilde indir."] },
  "Bent-Over Reverse Fly":    { g: "shoulders", eq: "dumbbell", t: "3 × 12", p: ["rearDelts"], s: ["midBack", "traps"], anim: "pecDeck",
    steps: ["Gövde öne eğik, sırt düz, dambıllar aşağıda.", "Kolları hafif bükük şekilde yanlara aç.", "Arka omuzları sıkıp yavaşça indir."] },
  "Dambıl Upright Row":       { g: "shoulders", eq: "dumbbell", t: "3 × 10", p: ["delts", "traps"], s: ["biceps"], anim: "shrug",
    steps: ["Dambıllar uyluk önünde, dar duruş.", "Dirsekleri yukarı çekerek göğüs hizasına kaldır.", "Yavaşça indir."] },
  "Dambıl Shrug":             { g: "shoulders", eq: "dumbbell", t: "3 × 12", p: ["traps"], s: ["forearms"], anim: "shrug",
    steps: ["Ağır dambılları yanlarda tut.", "Omuzlarını kulaklarına doğru kaldır.", "Tepede sıkıp yavaşça bırak."] },

  /* ---- KOL · MAKİNE ---- */
  "Preacher Curl":            { g: "arms", eq: "machine", t: "3 × 10", p: ["biceps"], s: ["forearms"], anim: "curl",
    steps: ["Kollarını eğimli pede yasla, tutamacı kavra.", "Dirsekleri sabit tutarak yukarı kıvır.", "Kolları tam uzatmadan yavaşça indir."] },
  "Biceps Curl Machine":      { g: "arms", eq: "machine", t: "3 × 12", p: ["biceps"], s: ["forearms"], anim: "curl",
    steps: ["Otur, dirseklerini pedin üstüne hizala.", "Tutamaçları omuzlarına doğru kıvır.", "Direnci hissederek kontrollü aç."] },
  "Triceps Extension Machine": { g: "arms", eq: "machine", t: "3 × 12", p: ["triceps"], s: ["forearms"], anim: "pushdown",
    steps: ["Otur, dirsekler pedde, tutamaçlar yukarıda.", "Kollarını aşağı doğru tam uzat.", "Dirsekleri sabit tutarak yavaşça dön."] },
  "Triceps Dip Machine":      { g: "arms", eq: "machine", t: "3 × 10", p: ["triceps"], s: ["chest", "delts"], anim: "chestPress",
    steps: ["Otur, gövdeni dik tut, tutamaçları kavra.", "Kolları aşağı doğru bastırıp uzat.", "Dirsekler 90° olana kadar kontrollü dön."] },

  /* ---- KOL · KABLO ---- */
  "Cable Curl":               { g: "arms", eq: "cable", t: "3 × 12", p: ["biceps"], s: ["forearms"], anim: "curl",
    steps: ["Alçak makara barını omuz genişliğinde kavra.", "Dirsekleri gövdene sabitleyip yukarı kıvır.", "Gerilimi koruyarak yavaşça indir."] },
  "Rope Hammer Curl":         { g: "arms", eq: "cable", t: "3 × 12", p: ["biceps", "forearms"], s: [], anim: "curl",
    steps: ["Halatı avuçlar birbirine bakacak şekilde tut.", "Dirsekler sabit, halatı omuzlara doğru kıvır.", "Kontrollü şekilde indir."] },
  "Triceps Pushdown (Cable)": { g: "arms", eq: "cable", t: "3 × 12", p: ["triceps"], s: ["forearms"], anim: "pushdown",
    steps: ["Yüksek makara barını üstten kavra, dirsekler gövdende.", "Barı kalça hizasına kadar aşağı bastır.", "Dirsekleri oynatmadan yavaşça yukarı bırak."] },
  "Rope Pushdown":            { g: "arms", eq: "cable", t: "3 × 12", p: ["triceps"], s: ["forearms"], anim: "pushdown",
    steps: ["Halatı iki elle kavra, dirsekler sabit.", "Aşağıda halatın uçlarını yanlara ayır.", "Kontrollü şekilde yukarı dön."] },
  "Overhead Triceps Extension": { g: "arms", eq: "cable", t: "3 × 12", p: ["triceps"], s: ["forearms"], anim: "pushdown",
    steps: ["Sırtın makaraya dönük, halat başının arkasında.", "Dirsekleri sabit tutarak kolları öne-yukarı uzat.", "Kası gererek yavaşça dön."] },
  "Cable Kickback":           { g: "arms", eq: "cable", t: "3 × 12", p: ["triceps"], s: [], anim: "pushdown",
    steps: ["Öne eğil, üst kolunu gövdene paralel sabitle.", "Kulpu geriye doğru tam uzat.", "Dirseği oynatmadan yavaşça dön."] },

  /* ---- KOL · DAMBIL/BARBELL/VÜCUT ---- */
  "Dambıl Biceps Curl":       { g: "arms", eq: "dumbbell", t: "3 × 12", p: ["biceps"], s: ["forearms"], anim: "curl",
    steps: ["Dambıllar yanlarda, avuçlar öne dönük.", "Dirsekleri sabit tutarak omuzlara doğru kıvır.", "Sallanmadan yavaşça indir."] },
  "Hammer Curl":              { g: "arms", eq: "dumbbell", t: "3 × 12", p: ["biceps", "forearms"], s: [], anim: "curl",
    steps: ["Dambılları avuçlar birbirine bakacak şekilde tut.", "Bilek açısını bozmadan yukarı kıvır.", "Kontrollü şekilde indir."] },
  "Concentration Curl":       { g: "arms", eq: "dumbbell", t: "3 × 10", p: ["biceps"], s: ["forearms"], anim: "curl",
    steps: ["Otur, dirseğini uyluğunun iç kısmına daya.", "Dambılı omzuna doğru kıvır.", "Tepede sıkıp yavaşça indir."] },
  "Incline Dambıl Curl":      { g: "arms", eq: "dumbbell", t: "3 × 10", p: ["biceps"], s: ["forearms"], anim: "curl",
    steps: ["Eğimli bench'e yaslan, kollar aşağı sarksın.", "Dirsekleri geride tutarak yukarı kıvır.", "Kası gererek yavaşça indir."] },
  "Zottman Curl":             { g: "arms", eq: "dumbbell", t: "3 × 10", p: ["biceps", "forearms"], s: [], anim: "curl",
    steps: ["Avuçlar yukarı bakacak şekilde yukarı kıvır.", "Tepede bilekleri çevir (avuçlar aşağı).", "Bu tutuşla yavaşça indir ve tekrar çevir."] },
  "Dambıl Overhead Triceps Extension": { g: "arms", eq: "dumbbell", t: "3 × 12", p: ["triceps"], s: ["forearms"], anim: "shoulderPress",
    steps: ["Tek dambılı iki elle başının üstünde tut.", "Dirsekleri sabit tutarak dambılı ensene indir.", "Triceps'le yukarı doğru uzat."] },
  "Dambıl Kickback":          { g: "arms", eq: "dumbbell", t: "3 × 12", p: ["triceps"], s: [], anim: "pushdown",
    steps: ["Öne eğil, üst kolun gövdene paralel olsun.", "Dambılı geriye doğru tam uzat.", "Dirseği oynatmadan yavaşça dön."] },
  "Dambıl Wrist Curl":        { g: "arms", eq: "dumbbell", t: "3 × 15", p: ["forearms"], s: [], anim: "curl",
    steps: ["Ön kollarını uyluğuna yasla, bilekler dizden sarksın.", "Dambılı sadece bileğinle yukarı kıvır.", "Yavaşça aşağı bırak."] },
  "Barbell Curl":             { g: "arms", eq: "barbell", t: "3 × 10", p: ["biceps"], s: ["forearms"], anim: "curl",
    steps: ["Barı omuz genişliğinde alttan kavra.", "Dirsekler sabit, barı omuzlara doğru kıvır.", "Sallanmadan kontrollü indir."] },
  "Skullcrusher":             { g: "arms", eq: "barbell", t: "3 × 10", p: ["triceps"], s: ["forearms"], anim: "benchPress",
    steps: ["Bench'e uzan, barı dar tutuşla yukarıda tut.", "Dirsekleri sabit tutarak barı alnına doğru indir.", "Triceps'le yukarı uzat."] },
  "Bench Dips":               { g: "arms", eq: "body", t: "3 × 12", p: ["triceps"], s: ["delts", "chest"], anim: "pushup", bodyweight: true,
    steps: ["Ellerini arkandaki bench'in kenarına koy.", "Dirsekleri bükerek kalçanı aşağı indir.", "Triceps'le iterek yukarı çık."] },

  /* ---- BACAK · MAKİNE ---- */
  "Leg Press":                { g: "legs", eq: "machine", t: "3 × 12", p: ["quads", "glutes"], s: ["hamstrings", "calves"], anim: "legPress",
    steps: ["Otur, ayaklarını platforma omuz genişliğinde koy.", "Dizler 90° olana kadar platformu indir.", "Topuklardan iterek yukarı uzat, dizleri kilitleme."] },
  "Hack Squat":               { g: "legs", eq: "machine", t: "3 × 10", p: ["quads", "glutes"], s: ["hamstrings", "calves"], anim: "legPress",
    steps: ["Sırtını kızak pedine, omuzlarını pedlere yerleştir.", "Dizler 90°'yi geçene kadar çömel.", "Topuklardan iterek yukarı kalk."] },
  "Leg Extension":            { g: "legs", eq: "machine", t: "3 × 12", p: ["quads"], s: [], anim: "legExt",
    steps: ["Otur, ayak bileklerini alt pedin arkasına yerleştir.", "Bacaklarını tam uzatıp ön bacağı sık.", "Ağırlığı bırakmadan yavaşça indir."] },
  "Leg Curl":                 { g: "legs", eq: "machine", t: "3 × 12", p: ["hamstrings"], s: ["calves"], anim: "legCurl",
    steps: ["Pedleri ayarla, bilekler pedin altında/üstünde olacak şekilde yerleş.", "Topuklarını kalçana doğru kıvır.", "Kontrollü şekilde uzat."] },
  "Seated Leg Curl":          { g: "legs", eq: "machine", t: "3 × 12", p: ["hamstrings"], s: ["calves"], anim: "legCurl",
    steps: ["Otur, bacakların üst ped ile sabitlensin.", "Topukları oturağın altına doğru kıvır.", "Arka bacağı hissederek yavaşça uzat."] },
  "Calf Raise Machine":       { g: "legs", eq: "machine", t: "3 × 15", p: ["calves"], s: [], anim: "calfRaise",
    steps: ["Omuz pedlerinin altına gir, ayak uçların basamakta.", "Topukları olabildiğince yukarı kaldır.", "Topukları basamak altına esneterek indir."] },
  "Seated Calf Raise":        { g: "legs", eq: "machine", t: "3 × 15", p: ["calves"], s: [], anim: "calfRaise",
    steps: ["Otur, dizlerinin üstüne pedi yerleştir.", "Topukları yukarı kaldırıp baldırı sık.", "Yavaşça aşağı esnet."] },
  "Hip Abduction Machine":    { g: "legs", eq: "machine", t: "3 × 15", p: ["glutes"], s: [], anim: "legExt",
    steps: ["Otur, dizlerinin dış tarafı pedlere dayansın.", "Bacaklarını dışa doğru aç.", "Direnci hissederek yavaşça kapat."] },
  "Hip Adduction Machine":    { g: "legs", eq: "machine", t: "3 × 15", p: ["adductors"], s: [], anim: "legExt",
    steps: ["Otur, dizlerinin iç tarafı pedlere dayansın.", "Bacaklarını içe doğru birleştir.", "Kontrollü şekilde aç."] },
  "Glute Kickback Machine":   { g: "legs", eq: "machine", t: "3 × 12", p: ["glutes"], s: ["hamstrings"], anim: "hipThrust",
    steps: ["Pedallı platforma bir ayağını yerleştir, gövdeni yasla.", "Bacağını geriye-yukarı doğru it.", "Kalçanı sıkıp yavaşça dön."] },
  "Smith Machine Squat":      { g: "legs", eq: "machine", t: "3 × 8", p: ["quads", "glutes"], s: ["hamstrings", "lowerBack", "abs"], anim: "squat",
    steps: ["Barı trapezine yerleştir, kilitten çıkar.", "Kalçanı geriye alarak uylukların paralel olana dek çömel.", "Topuklardan iterek yukarı kalk."] },
  "Smith Machine Lunge":      { g: "legs", eq: "machine", t: "3 × 10", p: ["quads", "glutes"], s: ["hamstrings"], anim: "squat",
    steps: ["Bar omuzlarında, bir ayağın önde bir ayağın geride.", "Arka dizini yere yaklaştırarak alçal.", "Ön topuktan iterek yukarı çık."] },

  /* ---- BACAK · KABLO ---- */
  "Cable Glute Kickback":     { g: "legs", eq: "cable", t: "3 × 12", p: ["glutes"], s: ["hamstrings"], anim: "hipThrust",
    steps: ["Bilek kelepçesini tak, makaraya dönük hafif eğil.", "Bacağını düz şekilde geriye-yukarı savur.", "Kalçayı sıkıp kontrollü dön."] },
  "Cable Pull-Through":       { g: "legs", eq: "cable", t: "3 × 12", p: ["glutes", "hamstrings"], s: ["lowerBack"], anim: "deadlift",
    steps: ["Sırtın makaraya dönük, halatı bacaklarının arasından tut.", "Kalçanı geriye iterek öne eğil.", "Kalçanı sıkarak dik konuma gel."] },
  "Cable Hip Abduction":      { g: "legs", eq: "cable", t: "3 × 15", p: ["glutes"], s: [], anim: "legExt",
    steps: ["Bilek kelepçesi dış bacakta, makaranın yanında dur.", "Bacağını gövdenden uzağa yana aç.", "Yavaşça başlangıca dön."] },

  /* ---- BACAK · DAMBIL/BARBELL ---- */
  "Goblet Squat":             { g: "legs", eq: "dumbbell", t: "3 × 12", p: ["quads", "glutes"], s: ["hamstrings", "abs"], anim: "squat",
    steps: ["Dambılı iki elle göğsünün önünde dik tut.", "Dizleri dışa açarak derin çömel.", "Topuklardan iterek yukarı kalk."] },
  "Dambıl Lunge":             { g: "legs", eq: "dumbbell", t: "3 × 12", p: ["quads", "glutes"], s: ["hamstrings"], anim: "squat",
    steps: ["Dambıllar yanlarda, büyük bir adım öne at.", "Arka dizini yere yaklaştır.", "Ön topuktan iterek başlangıca dön."] },
  "Bulgarian Split Squat":    { g: "legs", eq: "dumbbell", t: "3 × 10", p: ["quads", "glutes"], s: ["hamstrings"], anim: "squat",
    steps: ["Arka ayağını bench'e koy, dambıllar yanlarda.", "Ön dizini bükerek alçal.", "Ön bacakla iterek yukarı çık."] },
  "Dambıl Romanian Deadlift": { g: "legs", eq: "dumbbell", t: "3 × 10", p: ["hamstrings", "glutes"], s: ["lowerBack"], anim: "deadlift",
    steps: ["Dambıllar uyluk önünde, dizler hafif bükük.", "Kalçanı geriye iterek dambılları bacak boyunca indir.", "Arka bacak gerilince kalçanla yukarı kalk."] },
  "Dambıl Step-Up":           { g: "legs", eq: "dumbbell", t: "3 × 10", p: ["quads", "glutes"], s: ["hamstrings", "calves"], anim: "squat",
    steps: ["Dambıllar yanlarda, sağlam bir platformun önünde dur.", "Bir ayağınla platforma çıkıp tam dikleş.", "Kontrollü şekilde geri in, bacak değiştir."] },
  "Dambıl Calf Raise":        { g: "legs", eq: "dumbbell", t: "3 × 15", p: ["calves"], s: [], anim: "calfRaise",
    steps: ["Dambıllar yanlarda, ayak uçların bir yükseltide.", "Topukları olabildiğince yukarı kaldır.", "Yavaşça aşağı esnet."] },
  "Dambıl Sumo Squat":        { g: "legs", eq: "dumbbell", t: "3 × 12", p: ["quads", "glutes", "adductors"], s: ["hamstrings"], anim: "squat",
    steps: ["Ayaklar geniş, uçlar dışa dönük; dambılı iki elle önünde tut.", "Dizleri dışa açarak çömel.", "İç bacağı hissederek yukarı kalk."] },
  "Squat (Barbell)":          { g: "legs", eq: "barbell", t: "3 × 8",  p: ["quads", "glutes"], s: ["hamstrings", "lowerBack", "abs"], anim: "squat",
    steps: ["Barı trapezine yerleştir, göğüs dik.", "Kalçanı geriye alarak uylukların paralel olana dek çömel.", "Topuklardan iterek yukarı kalk."] },
  "Romanian Deadlift":        { g: "legs", eq: "barbell", t: "3 × 10", p: ["hamstrings", "glutes"], s: ["lowerBack"], anim: "deadlift",
    steps: ["Bar uyluk önünde, dizler hafif bükük.", "Kalçanı geriye iterek barı bacak boyunca indir.", "Arka bacak gerilince kalçanla dikleş."] },
  "Hip Thrust":               { g: "legs", eq: "barbell", t: "3 × 10", p: ["glutes"], s: ["hamstrings"], anim: "hipThrust",
    steps: ["Sırtın bench'e, bar kalçanın üstünde.", "Kalçanı tavana doğru it, üstte gövde düz olsun.", "Kalçayı sıkıp kontrollü indir."] },

  /* ---- KARIN · MAKİNE ---- */
  "Ab Crunch Machine":        { g: "core", eq: "machine", t: "3 × 15", p: ["abs"], s: ["obliques"], anim: "crunch",
    steps: ["Otur, tutamaçları/pedleri kavra.", "Gövdeni öne doğru kıvırarak karnını sık.", "Karın gerilimini koruyarak yavaşça aç."] },
  "Rotary Torso Machine":     { g: "core", eq: "machine", t: "3 × 12", p: ["obliques"], s: ["abs"], anim: "crunch",
    steps: ["Otur, gövdeni pedlere sabitle.", "Belden değil karından güç alarak gövdeni yana döndür.", "Kontrollü şekilde dön ve diğer yönde tekrarla."] },
  "Captain's Chair Leg Raise": { g: "core", eq: "machine", t: "3 × 12", p: ["abs"], s: ["obliques"], anim: "crunch",
    steps: ["Dirseklerini pedlere koy, gövdeni sabit tut.", "Dizlerini göğsüne doğru kaldır.", "Sallanmadan yavaşça indir."] },

  /* ---- KARIN · KABLO/DAMBIL ---- */
  "Cable Crunch":             { g: "core", eq: "cable", t: "3 × 15", p: ["abs"], s: ["obliques"], anim: "crunch",
    steps: ["Makaranın önünde diz çök, halatı başının yanında tut.", "Karnını sıkarak dirseklerini dizlerine doğru kıvır.", "Kalçanı sabit tutarak yavaşça dön."] },
  "Cable Woodchopper":        { g: "core", eq: "cable", t: "3 × 12", p: ["obliques"], s: ["abs", "delts"], anim: "crunch",
    steps: ["Yüksek makaranın yanında dur, kulpu iki elle tut.", "Kollar düz, gövdeni döndürerek çapraz aşağı çek.", "Kontrollü şekilde başlangıca dön."] },
  "Pallof Press":             { g: "core", eq: "cable", t: "3 × 12", p: ["abs", "obliques"], s: ["delts"], anim: "plank",
    steps: ["Makaranın yanında dur, kulpu göğsünün önünde tut.", "Gövdeni döndürmeden kollarını öne uzat.", "Direnç seni çevirmeye çalışırken sabit kal, sonra dön."] },
  "Dambıl Russian Twist":     { g: "core", eq: "dumbbell", t: "3 × 20", p: ["obliques"], s: ["abs"], anim: "crunch",
    steps: ["Otur, gövdeni geriye yasla, dambılı iki elle tut.", "Dambılı bir yandan diğer yana döndür.", "Karnı sıkı tutarak ritmi koru."] },
  "Dambıl Side Bend":         { g: "core", eq: "dumbbell", t: "3 × 15", p: ["obliques"], s: [], anim: "crunch",
    steps: ["Tek elde dambıl, dik dur.", "Dambıl tarafına doğru yandan eğil.", "Yan karınla gövdeni dikleştir."] },
  "Weighted Crunch":          { g: "core", eq: "dumbbell", t: "3 × 15", p: ["abs"], s: [], anim: "crunch",
    steps: ["Sırtüstü uzan, dambılı göğsünde tut.", "Omuzlarını yerden kaldırarak karnını sık.", "Yavaşça geri in."] },

  /* ---- KARIN · VÜCUT AĞIRLIĞI ---- */
  "Plank":                    { g: "core", eq: "body", t: "3 × 45 sn", p: ["abs"], s: ["obliques", "lowerBack"], anim: "plank", bodyweight: true,
    steps: ["Dirsekler omuz altında, vücut düz bir çizgide dur.", "Karnını ve kalçanı sıkı tut.", "Nefes alarak süre boyunca pozisyonu koru."] },
  "Crunch":                   { g: "core", eq: "body", t: "3 × 20", p: ["abs"], s: [], anim: "crunch", bodyweight: true,
    steps: ["Sırtüstü uzan, dizler bükük, eller başın yanında.", "Omuzlarını yerden kaldırarak karnını sık.", "Boynunu çekmeden yavaşça geri in."] },
  "Leg Raise":                { g: "core", eq: "body", t: "3 × 15", p: ["abs"], s: ["obliques"], anim: "crunch", bodyweight: true,
    steps: ["Sırtüstü uzan, eller yanlarda, bacaklar düz.", "Bacaklarını 90°'ye kadar kaldır.", "Beli yerden ayırmadan yavaşça indir."] },
  "Russian Twist":            { g: "core", eq: "body", t: "3 × 20", p: ["obliques"], s: ["abs"], anim: "crunch", bodyweight: true,
    steps: ["Otur, gövdeni geriye yasla, ayakları hafif kaldır.", "Ellerini bir yandan diğer yana döndür.", "Karnı sıkı tutarak devam et."] },
  "Mountain Climber":         { g: "core", eq: "body", t: "3 × 30 sn", p: ["abs"], s: ["obliques", "delts"], anim: "plank", bodyweight: true,
    steps: ["Plank pozisyonunda başla.", "Dizlerini sırayla göğsüne doğru hızlıca çek.", "Kalçayı yükseltmeden ritmi koru."] }
};


/* ---------- iki kare motoru ---------- */
const DUR = "2.4s";
function frames(a, b) {
  return `
  <g>${a}
    <animate attributeName="opacity" values="1;0" keyTimes="0;0.5" calcMode="discrete" dur="${DUR}" repeatCount="indefinite"/>
  </g>
  <g opacity="0">${b}
    <animate attributeName="opacity" values="0;1" keyTimes="0;0.5" calcMode="discrete" dur="${DUR}" repeatCount="indefinite"/>
  </g>`;
}

/* ---------- silüet figür kiti ---------- */
const fmt = n => (+n).toFixed(1);

/* konik uzuv parçası: (x1,y1)->(x2,y2), genişlik w1->w2 */
function seg(x1, y1, x2, y2, w1, w2, cls = "fx") {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  return `<circle class="${cls}" cx="${fmt(x1)}" cy="${fmt(y1)}" r="${fmt(w1 / 2)}"/>` +
    `<circle class="${cls}" cx="${fmt(x2)}" cy="${fmt(y2)}" r="${fmt(w2 / 2)}"/>` +
    `<path class="${cls}" d="M${fmt(x1 + nx * w1 / 2)} ${fmt(y1 + ny * w1 / 2)} L${fmt(x2 + nx * w2 / 2)} ${fmt(y2 + ny * w2 / 2)} L${fmt(x2 - nx * w2 / 2)} ${fmt(y2 - ny * w2 / 2)} L${fmt(x1 - nx * w1 / 2)} ${fmt(y1 - ny * w1 / 2)} Z"/>`;
}

/* kol: omuz -> dirsek -> el (elde küçük yumruk) */
function arm(sx, sy, ex, ey, hx, hy, far = false) {
  const c = far ? "fx2" : "fx";
  return seg(sx, sy, ex, ey, 8, 6.5, c) + seg(ex, ey, hx, hy, 6.5, 4.8, c) +
    `<circle class="${c}" cx="${fmt(hx)}" cy="${fmt(hy)}" r="3.4"/>`;
}
/* bacak: kalça -> diz -> bilek */
function leg(hx, hy, kx, ky, ax, ay, far = false) {
  const c = far ? "fx2" : "fx";
  return seg(hx, hy, kx, ky, 10.5, 8, c) + seg(kx, ky, ax, ay, 8, 5.5, c);
}
function footS(x, y, dir = 1, far = false) {
  return seg(x, y, x + 11 * dir, y + 1.5, 5, 4, far ? "fx2" : "fx");
}
/* kafa + saç + boyun */
function headP(x, y, r = 8) {
  return seg(x, y + r - 2, x, y + r + 5, 5.5, 6.5, "fx") +
    `<circle class="fx" cx="${x}" cy="${y}" r="${r}"/>` +
    `<path class="an-hair" d="M${x - r} ${y - 1.5} A${r} ${r} 0 0 1 ${x + r} ${y - 1.5} Z"/>`;
}
/* yan gövde (dir: baktığı yön, göğüs çıkıntısı o tarafta) */
function torsoS(x, yS, yH, dir = 1) {
  return seg(x, yS, x, yH, 15, 13) +
    `<circle class="fx" cx="${fmt(x + 4.5 * dir)}" cy="${fmt(yS + 9)}" r="5"/>`;
}
/* ön gövde: omuz hattı -> bel */
function torsoF(cx, yS, yW) {
  return `<path class="fx" d="M${cx - 15} ${yS + 4} Q${cx - 15} ${yS - 3} ${cx - 8} ${yS - 3} L${cx + 8} ${yS - 3} Q${cx + 15} ${yS - 3} ${cx + 15} ${yS + 4} L${cx + 11} ${yW + 2} L${cx - 11} ${yW + 2} Z"/>` +
    `<circle class="fx" cx="${cx - 14}" cy="${yS + 3}" r="5.5"/>` +
    `<circle class="fx" cx="${cx + 14}" cy="${yS + 3}" r="5.5"/>`;
}
/* önden şort (bacak ayrımlı) */
function shortsF(cx, yW) {
  return `<path class="an-shortsf" d="M${cx - 11.5} ${yW} L${cx + 11.5} ${yW} L${cx + 13} ${yW + 13} L${cx + 3.5} ${yW + 13} L${cx} ${yW + 7} L${cx - 3.5} ${yW + 13} L${cx - 13} ${yW + 13} Z"/>`;
}
/* yandan şort */
const shortsS = (x, y, w = 15, h = 13) =>
  `<rect class="an-shortsf" x="${x}" y="${y}" width="${w}" height="${h}" rx="4.5"/>`;

/* kas vurgusu: parlama halkalı nokta */
function mus(x, y, r = 4) {
  return `<circle class="an-musglow" cx="${x}" cy="${y}" r="${r + 3.5}"/>` +
    `<circle class="an-mus" cx="${x}" cy="${y}" r="${r}"/>`;
}

/* ---------- makine / ekipman yardımcıları ---------- */
const P = (d, w, cls) => `<path class="${cls}" stroke-width="${w}" d="${d}"/>`;
const acc = (d, w = 5) => P(d, w, "an-acc");
const cable = d => P(d, 2.5, "an-cable");
const frameL = (d, w = 6) => P(d, w, "an-frame");
const thin = d => P(d, 3, "an-frame-thin");

function arrow(x1, y1, x2, y2) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const h = a => `L${fmt(x2 - 8 * Math.cos(ang - a))} ${fmt(y2 - 8 * Math.sin(ang - a))}`;
  return `<path class="an-arrow" d="M${x1} ${y1} L${x2} ${y2} M${x2} ${y2} ${h(0.5)} M${x2} ${y2} ${h(-0.5)}"/>`;
}
function dbFront(cx, cy) {
  return `<path class="an-ironbar" stroke-width="4" d="M${cx - 9} ${cy} H${cx + 9}"/>
    <rect class="an-iron" x="${cx - 14}" y="${cy - 8}" width="5.5" height="16" rx="2"/>
    <rect class="an-iron" x="${cx + 8.5}" y="${cy - 8}" width="5.5" height="16" rx="2"/>`;
}
function dbSide(cx, cy) {
  return `<circle class="an-iron" cx="${cx}" cy="${cy}" r="7.5"/>
    <circle class="an-ironbar2" cx="${cx}" cy="${cy}" r="2.5"/>`;
}
function stackBase(x, y) {
  const pl = yy => `<rect class="an-plate" x="${x}" y="${yy}" width="24" height="5" rx="2"/>`;
  return thin(`M${x + 4} ${y - 12} V${y + 38} M${x + 20} ${y - 12} V${y + 38}`) +
    pl(y + 20) + pl(y + 26) + pl(y + 32);
}
function stackLift(x, y, lift) {
  const dy = lift ? -11 : 0;
  const pl = yy => `<rect class="an-plate-lift" x="${x}" y="${yy}" width="24" height="5" rx="2"/>`;
  return thin(`M${x + 12} ${y - 12} V${y + dy + 2}`) + pl(y + dy) + pl(y + 6 + dy) + pl(y + 12 + dy);
}

const wrap = (inner, label) => `<svg class="ex-anim" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  ${thin("M8 142 H192")}${inner}
  ${label ? `<text x="10" y="13" class="an-label">${label}</text>` : ""}</svg>`;

/* ---------- sahneler (parçalı: base + A pozu + B pozu) ----------
   Her sahne {base, A, B, label} döndürür; poseSVG tek pozu durağan çizer,
   ANIMS istenirse iki kareyi animasyonlu üretir. */
const SCENES = {

  /* GÖĞÜS PRES — yan */
  chestPress: () => {
    const machine = frameL("M126 142 V30") + frameL("M62 142 V100") +
      `<rect class="an-pad" x="44" y="94" width="34" height="8" rx="3"/>
       <rect class="an-pad" x="36" y="46" width="9" height="48" rx="3"/>` +
      stackBase(144, 58);
    const body =
      leg(56, 92, 82, 92, 82, 126) + footS(82, 127) +
      shortsS(48, 84) + torsoS(56, 52, 88, 1) + headP(56, 34) + mus(62, 60);
    const A = body + thin("M126 36 L74 52") +
      arm(56, 56, 68, 68, 74, 54) + acc("M74 44 V64", 6) +
      stackLift(144, 58, false) + arrow(84, 34, 108, 34);
    const B = body + thin("M126 36 L92 54") +
      arm(56, 56, 74, 56, 92, 56) + acc("M92 46 V66", 6) +
      stackLift(144, 58, true);
    return { base: machine, A, B, label: "OTURMALI MAKİNE" };
  },

  /* OMUZ PRES — yan */
  shoulderPress: () => {
    const machine = frameL("M130 142 V22") + frameL("M62 142 V100") +
      `<rect class="an-pad" x="44" y="94" width="34" height="8" rx="3"/>
       <rect class="an-pad" x="36" y="42" width="9" height="52" rx="3"/>` +
      stackBase(148, 58);
    const body =
      leg(56, 92, 82, 92, 82, 126) + footS(82, 127) +
      shortsS(48, 84) + torsoS(56, 50, 88, 1) + headP(56, 32) + mus(60, 50);
    const A = body + thin("M130 28 L78 42") +
      arm(56, 54, 70, 62, 76, 44) + acc("M66 40 H88", 6) +
      stackLift(148, 58, false) + arrow(98, 42, 98, 18);
    const B = body + thin("M130 28 L70 12") +
      arm(56, 54, 64, 32, 68, 14) + acc("M58 10 H80", 6) +
      stackLift(148, 58, true);
    return { base: machine, A, B, label: "OTURMALI MAKİNE" };
  },

  /* PEC DECK — önden */
  pecDeck: () => {
    const machine = frameL("M100 142 V104") +
      thin("M68 14 Q100 4 132 14") +
      `<circle class="an-joint" cx="70" cy="15" r="3.5"/><circle class="an-joint" cx="130" cy="15" r="3.5"/>
       <rect class="an-pad" x="84" y="100" width="32" height="8" rx="3"/>`;
    const body =
      leg(94, 94, 90, 114, 90, 132) + footS(90, 133, -1) +
      leg(106, 94, 110, 114, 110, 132) + footS(110, 133, 1) +
      torsoF(100, 48, 82) + shortsF(100, 82) + headP(100, 27) +
      mus(93, 55) + mus(107, 55);
    const A = body +
      thin("M70 15 L72 30") + thin("M130 15 L128 30") +
      arm(87, 50, 72, 54, 70, 34) + arm(113, 50, 128, 54, 130, 34) +
      acc("M70 30 V58", 9) + acc("M130 30 V58", 9) +
      arrow(60, 20, 76, 12) + arrow(140, 20, 124, 12);
    const B = body +
      thin("M70 15 L85 32") + thin("M130 15 L115 32") +
      arm(87, 50, 84, 58, 83, 36) + arm(113, 50, 116, 58, 117, 36) +
      acc("M83 32 V60", 9) + acc("M117 32 V60", 9);
    return { base: machine, A, B, label: "OTURMALI MAKİNE" };
  },

  /* LATERAL RAISE — önden */
  latRaise: () => {
    const body =
      leg(94, 94, 91, 114, 91, 133) + footS(91, 134, -1) +
      leg(106, 94, 109, 114, 109, 133) + footS(109, 134, 1) +
      torsoF(100, 46, 82) + shortsF(100, 82) + headP(100, 25) +
      mus(86, 47) + mus(114, 47);
    const A = body +
      arm(87, 48, 81, 68, 78, 88) + arm(113, 48, 119, 68, 122, 88) +
      dbFront(76, 96) + dbFront(124, 96) +
      arrow(62, 84, 46, 60) + arrow(138, 84, 154, 60);
    const B = body +
      arm(87, 48, 67, 46, 47, 48) + arm(113, 48, 133, 46, 153, 48) +
      dbFront(42, 48) + dbFront(158, 48);
    return { base: "", A, B, label: "DAMBIL" };
  },

  /* TRICEPS PUSHDOWN — kablo */
  pushdown: () => {
    const machine = frameL("M140 142 V14 H100") +
      `<circle class="an-pulley" cx="100" cy="20" r="5"/>` +
      stackBase(150, 56);
    const body =
      leg(64, 96, 70, 116, 68, 134, true) + footS(68, 135, 1, true) +
      leg(64, 96, 58, 116, 60, 134) + footS(60, 135) +
      shortsS(56, 86, 15, 13) + torsoS(64, 50, 90, 1) + headP(64, 30) + mus(72, 58);
    const A = body +
      arm(64, 52, 78, 62, 84, 47) + acc("M74 45 H94") +
      cable("M100 25 L84 43") +
      stackLift(150, 56, false) + arrow(106, 58, 106, 84);
    const B = body +
      arm(64, 52, 78, 62, 86, 88) + acc("M76 88 H96") +
      cable("M100 25 L86 85") +
      stackLift(150, 56, true);
    return { base: machine, A, B, label: "KABLO İSTASYONU" };
  },

  /* LAT PULLDOWN — yan */
  pulldown: () => {
    const machine = frameL("M144 142 V12 H84") +
      `<circle class="an-pulley" cx="84" cy="18" r="5"/>` +
      frameL("M68 142 V108") +
      `<rect class="an-pad" x="46" y="102" width="44" height="7" rx="3"/>
       <rect class="an-pad" x="76" y="88" width="20" height="7" rx="3"/>` +
      stackBase(152, 52);
    const body =
      leg(64, 100, 90, 98, 90, 132) + footS(90, 133) +
      shortsS(56, 92, 16, 12) + torsoS(64, 60, 98, 1) + headP(64, 43) + mus(69, 74);
    const A = body +
      arm(64, 62, 76, 42, 84, 26) +
      acc("M64 16 L106 24") + cable("M84 18 L85 21") +
      stackLift(152, 52, false) + arrow(112, 30, 112, 52);
    const B = body +
      arm(64, 62, 74, 62, 86, 48) +
      acc("M66 40 L108 48") + cable("M84 18 L86 46") +
      stackLift(152, 52, true);
    return { base: machine, A, B, label: "KABLO • YÜKSEK MAKARA" };
  },

  /* SEATED ROW — alçak makara */
  row: () => {
    const machine =
      `<rect class="an-pad" x="34" y="104" width="62" height="7" rx="3"/>` +
      frameL("M52 142 V110") + frameL("M114 96 L122 122") +
      `<circle class="an-pulley" cx="130" cy="104" r="4.5"/>` +
      frameL("M148 142 V50") + stackBase(154, 56);
    const body =
      leg(54, 100, 92, 92, 114, 100) +
      shortsS(46, 92, 16, 12) + torsoS(54, 58, 96, 1) + headP(54, 40) + mus(50, 66);
    const A = body +
      arm(54, 60, 80, 66, 104, 66) + acc("M104 58 V74") +
      cable("M130 102 L105 66") +
      stackLift(154, 56, false) + arrow(96, 46, 72, 44);
    const B = body +
      arm(54, 60, 74, 72, 64, 62) + acc("M64 54 V70") +
      cable("M130 102 L65 62") +
      stackLift(154, 56, true);
    return { base: machine, A, B, label: "KABLO • ALÇAK MAKARA" };
  },

  /* BICEPS CURL — yan, dambıl */
  curl: () => {
    const body =
      leg(84, 96, 90, 116, 88, 134, true) + footS(88, 135, 1, true) +
      leg(84, 96, 78, 116, 80, 134) + footS(80, 135) +
      shortsS(76, 86, 15, 13) + torsoS(84, 50, 90, 1) + headP(84, 30) + mus(90, 62);
    const A = body +
      arm(84, 52, 88, 74, 94, 92) + dbSide(97, 96) +
      arrow(112, 86, 114, 58);
    const B = body +
      arm(84, 52, 88, 74, 78, 56) + dbSide(76, 52);
    return { base: "", A, B, label: "DAMBIL" };
  },

  /* FACE PULL — yüz hizası makara */
  facePull: () => {
    const machine = frameL("M142 142 V20") +
      `<circle class="an-pulley" cx="139" cy="46" r="5"/>` +
      stackBase(154, 60);
    const body =
      leg(60, 100, 66, 118, 64, 136, true) + footS(64, 137, 1, true) +
      leg(60, 100, 54, 118, 56, 136) + footS(56, 137) +
      shortsS(52, 90, 15, 13) + torsoS(60, 52, 94, 1) + headP(60, 33) + mus(58, 50);
    const A = body +
      arm(60, 54, 86, 50, 110, 46) +
      acc("M110 46 L122 40 M110 46 L122 52", 4) +
      cable("M139 46 L122 46") +
      stackLift(154, 60, false) + arrow(102, 30, 80, 28);
    const B = body +
      arm(60, 54, 86, 44, 72, 40) +
      acc("M72 40 L84 32 M72 40 L84 48", 4) +
      cable("M139 46 L84 40") +
      stackLift(154, 60, true);
    return { base: machine, A, B, label: "KABLO İSTASYONU" };
  },

  /* SHRUG — önden */
  shrug: () => {
    const legs =
      leg(94, 94, 91, 114, 91, 133) + footS(91, 134, -1) +
      leg(106, 94, 109, 114, 109, 133) + footS(109, 134, 1);
    const trap = y =>
      `<path class="an-mus" d="M86 ${y} L100 ${y - 7} L114 ${y} L100 ${y + 2} Z"/>` +
      `<circle class="an-musglow" cx="100" cy="${y - 3}" r="12"/>`;
    const A =
      legs + shortsF(100, 82) + torsoF(100, 46, 82) + trap(43) + headP(100, 25) +
      arm(87, 48, 83, 68, 83, 88) + arm(113, 48, 117, 68, 117, 88) +
      dbFront(81, 96) + dbFront(119, 96) +
      arrow(68, 60, 68, 42) + arrow(132, 60, 132, 42);
    const B =
      legs + shortsF(100, 82) + torsoF(100, 41, 82) + trap(38) + headP(100, 20) +
      arm(87, 43, 83, 63, 83, 84) + arm(113, 43, 117, 63, 117, 84) +
      dbFront(81, 92) + dbFront(119, 92);
    return { base: "", A, B, label: "DAMBIL" };
  },

  /* LEG PRESS — 45° kızak */
  legPress: () => {
    const machine =
      frameL("M28 142 L104 142") +
      P("M34 130 L64 94", 10, "an-pads") +
      thin("M56 134 L148 54");
    const body =
      seg(44, 90, 70, 112, 14, 13) +
      `<circle class="fx" cx="50" cy="93" r="5"/>` +
      shortsS(60, 103, 16, 13) + headP(38, 82) + mus(56, 100);
    const A = body +
      leg(70, 110, 92, 92, 84, 74) +
      `<circle class="fx" cx="84" cy="72" r="3.6"/>` +
      acc("M72 62 L96 84", 7) +
      `<circle class="an-iron" cx="92" cy="60" r="7"/><circle class="an-iron" cx="102" cy="70" r="7"/>` +
      arrow(114, 94, 134, 76) + mus(80, 102);
    const B = body +
      leg(70, 110, 98, 88, 118, 66) +
      `<circle class="fx" cx="120" cy="64" r="3.6"/>` +
      acc("M104 52 L128 72", 7) +
      `<circle class="an-iron" cx="122" cy="46" r="7"/><circle class="an-iron" cx="132" cy="56" r="7"/>`;
    return { base: machine, A, B, label: "45° KIZAK MAKİNESİ" };
  },

  /* LEG EXTENSION */
  legExt: () => {
    const machine = stackBase(18, 62) +
      frameL("M78 142 V100 M100 142 V100") +
      `<rect class="an-pad" x="58" y="90" width="46" height="9" rx="4"/>
       <rect class="an-pad" x="52" y="50" width="9" height="42" rx="3"/>`;
    const body =
      seg(72, 88, 102, 88, 11, 9) +
      shortsS(64, 82, 16, 12) + torsoS(72, 54, 86, 1) + headP(72, 36) +
      arm(72, 58, 76, 76, 84, 86) + mus(90, 84);
    const A = body +
      seg(102, 88, 100, 120, 8, 5.5) + `<circle class="fx" cx="100" cy="122" r="3.4"/>` +
      thin("M100 96 L102 116") +
      `<circle class="an-iron" cx="104" cy="122" r="5.5"/>` +
      stackLift(18, 62, false) + arrow(124, 112, 138, 90);
    const B = body +
      seg(102, 88, 134, 82, 8, 5.5) + `<circle class="fx" cx="136" cy="81" r="3.4"/>` +
      thin("M100 96 L130 88") +
      `<circle class="an-iron" cx="138" cy="78" r="5.5"/>` +
      stackLift(18, 62, true);
    return { base: machine, A, B, label: "OTURMALI MAKİNE" };
  },

  /* LEG CURL — ayna görünüm */
  legCurl: () => {
    const machine = stackBase(158, 62) +
      frameL("M100 142 V100 M122 142 V100") +
      `<rect class="an-pad" x="96" y="90" width="46" height="9" rx="4"/>
       <rect class="an-pad" x="139" y="50" width="9" height="42" rx="3"/>
       <rect class="an-pad" x="100" y="77" width="20" height="6" rx="3"/>`;
    const body =
      seg(128, 88, 98, 88, 11, 9) +
      shortsS(120, 82, 16, 12) + torsoS(128, 54, 86, -1) + headP(128, 36) +
      arm(128, 58, 124, 76, 116, 86) + mus(112, 93);
    const A = body +
      seg(98, 88, 66, 82, 8, 5.5) + `<circle class="fx" cx="64" cy="81" r="3.4"/>` +
      thin("M100 96 L70 90") +
      `<circle class="an-iron" cx="61" cy="79" r="5.5"/>` +
      stackLift(158, 62, false) + arrow(70, 100, 84, 120);
    const B = body +
      seg(98, 88, 96, 120, 8, 5.5) + `<circle class="fx" cx="96" cy="122" r="3.4"/>` +
      thin("M100 96 L98 116") +
      `<circle class="an-iron" cx="94" cy="126" r="5.5"/>` +
      stackLift(158, 62, true);
    return { base: machine, A, B, label: "OTURMALI MAKİNE" };
  },

  /* CALF RAISE */
  calfRaise: () => {
    const machine = frameL("M134 142 V24") +
      `<rect class="an-pad" x="56" y="128" width="46" height="8" rx="2"/>` +
      stackBase(148, 56);
    const figBody = dy =>
      seg(73, 94 + dy, 73, 120 + dy, 9.5, 6, "fx") +
      seg(80, 94 + dy, 80, 120 + dy, 9.5, 6, "fx2") +
      shortsS(68, 84 + dy, 15, 13) + torsoS(76, 48 + dy, 88 + dy, 1) + headP(76, 30 + dy) +
      arm(76, 52 + dy, 82, 70 + dy, 80, 86 + dy) +
      acc(`M60 ${44 + dy} H94`, 8) + mus(84, 112 + dy);
    const A = figBody(0) +
      thin("M134 32 L94 44") +
      footS(66, 125) + footS(74, 125, 1, true) +
      stackLift(148, 56, false) + arrow(110, 108, 110, 88);
    const B = figBody(-8) +
      thin("M134 32 L94 36") +
      seg(69, 112, 88, 121, 5, 4) + seg(76, 112, 95, 121, 5, 4, "fx2") +
      stackLift(148, 56, true);
    return { base: machine, A, B, label: "MAKİNE • AYAKTA" };
  },

  /* PLANK — tek poz */
  plank: () => ({
    base:
      `<rect class="an-pad" x="28" y="124" width="144" height="6" rx="3"/>` +
      seg(54, 98, 124, 104, 14, 12) +
      headP(44, 90) +
      shortsS(96, 96, 18, 12) +
      seg(54, 98, 48, 120, 7.5, 6) + seg(48, 120, 70, 122, 6, 5) +
      leg(124, 104, 148, 112, 160, 116) + footS(160, 112, 1) +
      `<circle class="an-musglow" cx="86" cy="100" r="10"/>
       <circle cx="86" cy="100" r="6" class="an-mus"/>`,
    A: "", B: "",
    label: "VÜCUT AĞIRLIĞI • MAT"
  }),

  /* BENCH PRESS — sırtüstü, yan */
  benchPress: () => {
    const bench =
      `<rect class="an-pad" x="34" y="100" width="92" height="9" rx="4"/>` +
      frameL("M48 142 V106 M112 142 V106");
    const body =
      seg(58, 96, 108, 96, 14, 12) +
      `<circle class="fx" cx="46" cy="94" r="8"/>` +
      `<path class="an-hair" d="M38 92 A8 8 0 0 1 54 92 Z" transform="rotate(-90 46 92)"/>` +
      shortsS(98, 88, 17, 12) +
      leg(112, 96, 130, 112, 130, 134) + footS(130, 135, 1) +
      mus(70, 92);
    const A = body +
      arm(64, 92, 76, 78, 72, 66) +
      acc("M58 64 H90", 5) + dbSide(72, 60) +
      arrow(104, 66, 104, 38);
    const B = body +
      arm(64, 92, 68, 68, 66, 44) +
      acc("M52 42 H84", 5) + dbSide(66, 38);
    return { base: bench, A, B, label: "BENCH • BARBELL" };
  },

  /* SQUAT — yan */
  squat: () => {
    const barA = acc("M56 46 H100", 5) + dbSide(76, 44);
    const barB = acc("M60 66 H104", 5) + dbSide(80, 64);
    const A =
      leg(80, 90, 80, 112, 80, 134) + footS(80, 135) +
      shortsS(72, 82, 16, 12) + torsoS(80, 50, 88, 1) + headP(80, 30) +
      arm(80, 52, 90, 58, 76, 48) + mus(84, 104) + barA +
      arrow(122, 70, 122, 98);
    const B =
      leg(72, 106, 96, 110, 90, 134) + footS(90, 135) +
      shortsS(64, 98, 16, 12) + seg(84, 70, 72, 106, 15, 13) +
      `<circle class="fx" cx="89" cy="78" r="5"/>` + headP(88, 52) +
      arm(84, 72, 94, 76, 82, 68) + mus(84, 116) + barB;
    return { base: "", A, B, label: "BARBELL • SQUAT" };
  },

  /* DEADLIFT — yan */
  deadlift: () => {
    const A =
      leg(70, 96, 78, 116, 74, 134) + footS(74, 135) +
      shortsS(62, 88, 16, 12) + seg(88, 64, 70, 96, 15, 13) +
      `<circle class="fx" cx="92" cy="72" r="5"/>` + headP(96, 50) +
      arm(88, 66, 94, 92, 98, 114) +
      acc("M84 118 H112", 5) + `<circle class="an-iron" cx="98" cy="122" r="9"/>` +
      mus(76, 92) + arrow(128, 108, 128, 76);
    const B =
      leg(76, 92, 78, 114, 76, 134) + footS(76, 135) +
      shortsS(68, 84, 16, 12) + torsoS(76, 50, 88, 1) + headP(76, 32) +
      arm(76, 54, 80, 76, 82, 96) +
      acc("M68 100 H96", 5) + `<circle class="an-iron" cx="82" cy="104" r="9"/>` +
      mus(72, 84);
    return { base: "", A, B, label: "BARBELL" };
  },

  /* PULL-UP — önden, bar */
  pullup: () => {
    const rig = frameL("M30 142 V16 M170 142 V16") + acc("M30 18 H170", 5);
    const fig = dy =>
      torsoF(100, 58 + dy, 92 + dy) + shortsF(100, 92 + dy) + headP(100, 38 + dy) +
      leg(94, 104 + dy, 92, 120 + dy, 100, 130 + dy, false) +
      leg(106, 104 + dy, 108, 120 + dy, 100, 130 + dy, true) +
      mus(88, 66 + dy) + mus(112, 66 + dy);
    const A = fig(14) +
      arm(87, 74, 85, 46, 84, 22) + arm(113, 74, 115, 46, 116, 22) +
      arrow(150, 70, 150, 42);
    const B = fig(-16) +
      arm(87, 44, 76, 34, 84, 22) + arm(113, 44, 124, 34, 116, 22);
    return { base: rig, A, B, label: "BAR • VÜCUT AĞIRLIĞI" };
  },

  /* PUSH-UP — yan */
  pushup: () => {
    const mat = `<rect class="an-pad" x="24" y="132" width="152" height="6" rx="3"/>`;
    const A =
      seg(56, 88, 124, 96, 14, 12) + headP(46, 80) +
      shortsS(96, 88, 18, 12) +
      leg(124, 96, 148, 106, 162, 112) + footS(162, 108, 1) +
      arm(58, 90, 56, 110, 54, 128) +
      mus(70, 86) + arrow(96, 66, 96, 46);
    const B =
      seg(56, 108, 124, 110, 14, 12) + headP(46, 100) +
      shortsS(96, 102, 18, 12) +
      leg(124, 110, 148, 116, 162, 120) + footS(162, 116, 1) +
      arm(58, 110, 44, 118, 54, 128) +
      mus(70, 106);
    return { base: mat, A, B, label: "VÜCUT AĞIRLIĞI" };
  },

  /* CRUNCH — sırtüstü, dizler bükülü */
  crunch: () => {
    const mat = `<rect class="an-pad" x="28" y="126" width="144" height="6" rx="3"/>`;
    const legs =
      leg(104, 116, 122, 94, 136, 118) + footS(136, 119, 1) +
      shortsS(94, 106, 18, 12);
    const A = legs +
      seg(58, 120, 104, 116, 14, 12) +
      `<circle class="fx" cx="46" cy="118" r="8"/>` +
      arm(60, 116, 74, 106, 86, 102) +
      mus(82, 112) + arrow(52, 96, 66, 82);
    const B = legs +
      seg(70, 102, 104, 116, 14, 12) +
      `<circle class="fx" cx="62" cy="92" r="8"/>` +
      arm(72, 100, 84, 94, 94, 96) +
      mus(88, 108);
    return { base: mat, A, B, label: "MAT • VÜCUT AĞIRLIĞI" };
  },

  /* HIP THRUST — sırt bench'te, kalça köprüsü */
  hipThrust: () => {
    const bench = `<rect class="an-pad" x="30" y="92" width="34" height="9" rx="4"/>` +
      frameL("M38 142 V98 M56 142 V98");
    const A = bench +
      seg(56, 92, 92, 116, 14, 12) +
      `<circle class="fx" cx="46" cy="86" r="8"/>` +
      shortsS(84, 108, 17, 12) +
      leg(92, 116, 118, 112, 120, 134) + footS(120, 135, 1) +
      acc("M78 104 H110", 5) + `<circle class="an-iron" cx="94" cy="104" r="8"/>` +
      mus(94, 122) + arrow(140, 116, 140, 92);
    const B = bench +
      seg(56, 90, 100, 92, 14, 12) +
      `<circle class="fx" cx="46" cy="84" r="8"/>` +
      shortsS(92, 84, 17, 12) +
      leg(100, 92, 118, 108, 120, 134) + footS(120, 135, 1) +
      acc("M84 80 H116", 5) + `<circle class="an-iron" cx="100" cy="80" r="8"/>` +
      mus(100, 98);
    return { base: "", A, B, label: "BENCH • BARBELL" };
  }
};

/* Tek pozu durağan çiz (adım görselleri): which = "A" | "B" */
function poseSVG(key, which) {
  const s = SCENES[key]();
  const pose = s.B ? (which === "B" ? s.B : s.A) : s.A;
  return wrap(s.base + pose, "");
}
function sceneLabel(key) { return SCENES[key]().label; }

/* Eski animasyonlu API — doğrulama ve olası geri dönüş için korunur */
const ANIMS = {};
for (const k of Object.keys(SCENES)) {
  ANIMS[k] = () => {
    const s = SCENES[k]();
    return wrap(s.base + (s.B ? frames(s.A, s.B) : s.A), s.label);
  };
}

/* Hareket detay bloğu (kart içine gömülür)
   Kas figürü yok; kaslar renkli etiketlerle, her adımın yanında o
   adımdaki duruşun durağan çizimi (1: başlangıç, ara: efor, son: dönüş). */
function exerciseDetailHTML(exName) {
  const info = EX_INFO[exName];
  if (!info) return "";
  const chips =
    info.p.map(m => `<span class="mchip mchip-p">${MUSCLE_TR[m]}</span>`).join("") +
    info.s.map(m => `<span class="mchip mchip-s">${MUSCLE_TR[m]}</span>`).join("");
  const all = info.steps || [];
  const poseFor = i => (i === 0 || i === all.length - 1) ? "A" : "B";
  const steps = all.map((s, i) =>
    `<li class="step-row">
       <div class="step-fig">${poseSVG(info.anim, poseFor(i))}</div>
       <div class="step-txt"><span class="step-num">${i + 1}</span>${s}</div>
     </li>`).join("");
  const link = "https://www.google.com/search?q=" +
    encodeURIComponent("vectorfitexercises " + exName + " exercise animation");
  return `
    <div class="ex-detail">
      <div class="ex-muscles">
        <span class="mhead">Kaslar</span>${chips}
        <span class="ex-equip">${sceneLabel(info.anim)}</span>
      </div>
      ${steps ? `<ol class="ex-steps">${steps}</ol>` : ""}
      <a class="ex-link" href="${link}" target="_blank" rel="noopener">🎬 Hareketin animasyonuna bak ↗</a>
    </div>`;
}
