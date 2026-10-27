window.YDT_MODULES = [
  {
    id: 0,
    title: "Cümle iskeleti",
    range: "01–10",
    short: "Yapı",
    description: "Boşluğun cümlede hangi görevi üstlenmesi gerektiğini bul.",
    focus: "Bağımlı cümle, devrik yapı, özne uyumu ve paralellik"
  },
  {
    id: 1,
    title: "Mantık bağları",
    range: "11–20",
    short: "İlişki",
    description: "Bağlaçların kurduğu beklenti, neden ve sonuç yönünü izle.",
    focus: "Karşıtlık, ödünleme, koşul, neden–sonuç ve amaç"
  },
  {
    id: 2,
    title: "Gönderim ve zaman",
    range: "21–30",
    short: "Tutarlılık",
    description: "Özne, zamir, zaman ve edilgenlik zincirini cümle boyunca koru.",
    focus: "Zamir gönderimi, zaman sırası, edilgen yapı ve ilgi cümleciği"
  },
  {
    id: 3,
    title: "Bağlam ve kapsam",
    range: "31–40",
    short: "Bağlam",
    description: "Konuya yakın görünen ama iddia yönünü bozan seçenekleri ele.",
    focus: "Kanıt–iddia bağı, kapsam, genelleme ve paragraf tutarlılığı"
  },
  {
    id: 4,
    title: "Karma zor set",
    range: "41–50",
    short: "Karma",
    description: "Dilbilgisi, bağlaç ve anlam ipuçlarını tek soruda birleştir.",
    focus: "Birden fazla çeldirici türünün aynı anda kullanıldığı sorular"
  }
];

window.YDT_METHOD = {
  steps: [
    {
      number: "01",
      title: "İskeleti kur",
      body: "Boşluğun solundaki bağlaca ve noktalama işaretine bak. Cümle tamamlanmış mı, yoksa bağımsız bir ana cümle mi bekliyor? Özne ve yüklemi zihninde bir anlığına işaretle.",
      cue: "Yapı sorusu: Boşlukta hangi tür cümle parçası bulunabilir?"
    },
    {
      number: "02",
      title: "Yönü tahmin et",
      body: "Although, despite, because, therefore, unless gibi işaretler cümlenin mantık yönünü belirler. Seçeneklere geçmeden önce boşluğun ne tür bir devam istediğini bir iki sözcükle tahmin et.",
      cue: "Örnek: Although → beklenti değişimi; because → gerekçe; therefore → sonuç."
    },
    {
      number: "03",
      title: "Anlamı doğrula",
      body: "Önce dilbilgisi bakımından mümkün seçenekleri tut. Sonra özne, zaman, zamir gönderimi, konu ve mantık ilişkisini birlikte denetle. Doğru seçenek, cümlenin iki yarısını da açıklamalı.",
      cue: "İki kapı: Dilbilgisi kapısı + bağlam kapısı. İkisi de açılmalı."
    }
  ],
  tactics: [
    {
      title: "Seçenekleri kapatıp tahmin et",
      label: "Ön tahmin",
      body: "Boşluğu önce seçeneklere bakmadan kendi sözlerinle tamamla. Birebir aynı ifadeyi arama; yalnızca gereken anlam yönünü ve yapı türünü belirle. Bu, seçeneklerin seni konuya yakın ama mantıken yanlış bir cevaba çekmesini zorlaştırır."
    },
    {
      title: "Boşluğun sol kenarını tara",
      label: "Sınır kontrolü",
      body: "Boşluktan hemen önceki bağlaç, virgül, noktalı virgül veya iki nokta üst üste hangi yapının geleceğini daraltır. Although ile başlayan yan cümleden sonra genellikle bağımsız ana cümle gerekir; noktalı virgülden sonra ise yeni bir bağımsız cümle beklenir."
    },
    {
      title: "Özne zincirini takip et",
      label: "Gönderim",
      body: "It, they, this, such findings gibi ifadelerin hangi isme döndüğünü bul. Ayrıca -ing veya -ed ile başlayan kısaltılmış yapıda eylemi yapan öznenin ana cümlenin öznesiyle uyuşup uyuşmadığını kontrol et."
    },
    {
      title: "Bağlacın yönünü işaretle",
      label: "Mantık oku",
      body: "Cümlenin ilk yarısını kısa bir etiketle özetle: olumlu bulgu, sorun, neden, beklenti veya koşul. Devamın bu etiketi desteklemesi mi, sınırlaması mı, yoksa sonuçlandırması mı gerektiğini belirle."
    },
    {
      title: "Konu eşleşmesine kanma",
      label: "Yakın çeldirici",
      body: "Bir seçenek cümledeki konuyu tekrar edebilir ama bağlaçla yanlış ilişki kurabilir. Konu kelimelerinin benzemesi tek başına kanıt değildir; iki yarı arasındaki bağı açıkça kuramayan seçeneği ele."
    },
    {
      title: "İddianın kapsamını ölç",
      label: "Kapsam",
      body: "Always, only, all, never gibi kesinlik bildiren sözcükleri; may, tends to, some gibi sınırlayıcı ifadelerle karşılaştır. Metin olasılık veya eğilim anlatırken kesin hüküm veren seçenek çoğu zaman gereğinden güçlüdür."
    },
    {
      title: "Zamanı olay sırasına çevir",
      label: "Zaman çizgisi",
      body: "Yalnızca tense adlarına bakma. Olayların hangisinin önce, hangisinin sonra gerçekleştiğini işaretle. By the time, since, after ve once gibi ipuçları, biçimce mümkün görünen seçenekler arasından kronolojik olarak tutarsız olanı eler."
    },
    {
      title: "İki turda ele",
      label: "Çift filtre",
      body: "İlk turda yapı bakımından imkânsız seçenekleri kaldır. İkinci turda kalanları anlam ilişkisine göre karşılaştır. Her turda tek ölçüt kullanmak, bir çeldiricinin dilbilgisi doğruluğuyla seni erken ikna etmesini önler."
    }
  ],
  traps: [
    {
      name: "Konu tuzağı",
      text: "Aynı kavramları tekrar eder ama cümlede istenen neden, karşıtlık veya sonuç bağını kurmaz."
    },
    {
      name: "Yapı tuzağı",
      text: "Anlamı makul görünür; ancak bağımlı yan cümleyi bağımsız cümle gereken yere koyar ya da paralel yapıyı bozar."
    },
    {
      name: "Özne tuzağı",
      text: "Cümle başındaki zamir veya kısaltılmış eylem, seçenekle birleşince yanlış kişiye ya da nesneye bağlanır."
    },
    {
      name: "Yön tuzağı",
      text: "Although, despite veya yet gibi bir işaretin kurduğu beklentinin tersine hareket eder."
    },
    {
      name: "Kapsam tuzağı",
      text: "Kaynağın söylediğinden daha kesin, daha genel veya daha nedensel bir iddia ekler."
    }
  ],
  routine: [
    "Cümlenin tamamlanmış olup olmadığını belirle.",
    "Bağlaç veya noktalama işaretini bir ilişki sözcüğüyle adlandır.",
    "Boşluğun beklediği özne ve yüklem tipini tahmin et.",
    "Yapı filtresinden geçenleri anlam yönüyle karşılaştır.",
    "Seçtiğin seçenekle cümleyi baştan sona oku; her iki yarının da neden doğru olduğunu açıkla."
  ],
  example: {
    stem: "Although the initial results were promising, ----.",
    answer: "the research team withheld its conclusion until the findings had been independently replicated.",
    logic: "Umut verici sonuç → erken hüküm vermeyi engelleyen bir sınırlama",
    explanation: "Although bir beklenti kurar ve devamında bu beklentiyi sınırlar. Bağımsız tekrar beklemek hem anlamca çekince oluşturur hem de dilbilgisel olarak bağımsız ana cümleyi tamamlar."
  },
  sourceNote: "ÖSYM'nin 2026 YDT İngilizce kitapçığında cümle tamamlama bölümü 21–28. sorulardır. Buradaki 50 çalışma sorusunun tamamı özgündür; resmî sınav sorusu değildir."
};
