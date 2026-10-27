# YDT Cümle Tamamlama

YDT İngilizce cümle tamamlama sorularını yapı, mantık ilişkisi ve bağlam üzerinden çalışmak için hazırlanmış Türkçe bir çalışma sitesidir.

## Açma

`index.html` dosyasını güncel bir tarayıcıda açın. Kurulum, paket indirme veya sunucu hesabı gerekmez. HTML, CSS ve çalışma verileri proje içindedir; çalışma ekranı internet bağlantısı olmadan kullanılabilir. ÖSYM kitapçığı bağlantısı yalnızca kaynak notundaki PDF bağlantısı seçildiğinde açılır.

Tarayıcı `file://` adresinde yerel kayıt kullanımını kısıtlarsa aynı klasörü basit bir yerel HTTP sunucusuyla açın. İlerleme, yanlışlar ve işaretli sorular tarayıcının `localStorage` alanında bu cihazda saklanır; başka cihaza aktarılmaz.

## İçerik ve çalışma akışı

- Türkçe yöntem rehberi: cümle iskeleti, bağlaç yönü, özne/zamir gönderimi, zaman çizgisi, kapsam ve çeldirici analizi.
- Beş sette toplam 50 özgün, beş seçenekli İngilizce soru.
- Öğrenme modunda anında geri bildirim, doğru cevabın açıklaması ve beş seçeneğin ayrı gerekçesi.
- İsteğe bağlı 50 dakikalık çalışma denemesi. Bu kişisel çalışma temposudur; resmî soru başı süre olarak sunulmaz.
- Cihazda ilerleme kaydı, set bazlı özet, hata defteri ve daha sonra bakılacak sorular.

ÖSYM'nin 2026 YDT İngilizce kitapçığında cümle tamamlama bölümü 21–28. sorulardır. Sitede bu soru biçimi örnek alınmış, yayımlanan sorular kopyalanmamış ve çalışma soruları özgün yazılmıştır.

## Dosyalar

- `index.html` — uygulama iskeleti
- `style.css` — responsive tasarım ve erişilebilir durum stilleri
- `content.js` — yöntem rehberi ve strateji içerikleri
- `questions.js` — 50 soru, cevap anahtarı ve seçenek gerekçeleri
- `app.js` — gezinme, çalışma modları, yerel kayıt ve ilerleme ekranı
