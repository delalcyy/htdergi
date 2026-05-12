export const CATEGORIES = [
  { id: 'love',       label: 'Sevgililik' },
  { id: 'wedding',    label: 'Evlilik' },
  { id: 'birthday',   label: 'Doğum Günü' },
  { id: 'baby',       label: 'Bebek' },
  { id: 'graduation', label: 'Mezuniyet' },
  { id: 'career',     label: 'Kariyer' },
] as const;

export type CategoryLabel = typeof CATEGORIES[number]['label'];

export interface Question {
  id: string;
  text: string;
}

export const QUESTIONS: Record<CategoryLabel, Question[]> = {
  'Sevgililik': [
    { id: 'sv-01', text: 'Onu ilk gördüğün an zaman dursa ne yapmak isterdin?' },
    { id: 'sv-02', text: 'Hayatına girmeden önce sende eksik olan şey neydi?' },
    { id: 'sv-03', text: 'Partnerinin sadece sana gösterdiği bir hali var mı?' },
    { id: 'sv-04', text: 'Birlikte yaşadığınız hangi anı sonsuza kadar saklamak isterdin?' },
    { id: 'sv-05', text: 'Onun hangi bakışı seni hâlâ heyecanlandırıyor?' },
    { id: 'sv-06', text: 'Aşkınızı tek bir şarkıyla anlatacak olsan hangi şarkıyı seçerdin?' },
    { id: 'sv-07', text: 'Partnerin yanında en çok hangi halini seviyorsun?' },
    { id: 'sv-08', text: 'Onsuz bir hayat düşünmek sana ne hissettiriyor?' },
    { id: 'sv-09', text: 'Yıllar sonra bu röportajı tekrar okuduğunda ne hissetmek istersin?' },
    { id: 'sv-10', text: 'Ve artık klasikleşen soru… hangi takımı tutuyor?' },
  ],
  'Evlilik': [
    { id: 'ev-01', text: 'Eşin hayatına girdiğinde sende ilk değişen şey ne oldu?' },
    { id: 'ev-02', text: 'Onunla ilk kez gerçekten "biz olduk" dediğin an hangisiydi?' },
    { id: 'ev-03', text: 'Birlikte sessiz kaldığınız halde en çok anlaştığınız an hangisi?' },
    { id: 'ev-04', text: 'Eşinin hangi küçük detayı seni her gün yeniden etkiliyor?' },
    { id: 'ev-05', text: 'Aşkınızı anlatan tek bir fotoğraf olsa nasıl görünürdü?' },
    { id: 'ev-06', text: 'Evlilik sana aşk hakkında ne öğretti?' },
    { id: 'ev-07', text: 'Eşin seni herkesten farklı nasıl seviyor?' },
    { id: 'ev-08', text: 'Birlikte yaşlanmayı düşündüğünde ilk ne hayal ediyorsun?' },
    { id: 'ev-09', text: 'Çocuklarınız bir gün bu röportajı okusa ne hissetsin isterdin?' },
    { id: 'ev-10', text: 'Ve evdeki tatlı rekabet… hangi takımı tutuyorsunuz?' },
  ],
  'Doğum Günü': [
    { id: 'bd-01', text: 'Şu anki halin çocukluk hayaline ne kadar yakın?' },
    { id: 'bd-02', text: 'Hayatında "iyi ki yaşamışım" dediğin an hangisi?' },
    { id: 'bd-03', text: 'Seni gerçekten tanıyan biri seni nasıl anlatırdı?' },
    { id: 'bd-04', text: 'Yeni yaşında en çok neyi değiştirmek istiyorsun?' },
    { id: 'bd-05', text: 'Kendinle gurur duyduğun bir an var mı?' },
    { id: 'bd-06', text: 'Şimdiye kadar aldığın en unutulmaz mesaj neydi?' },
    { id: 'bd-07', text: 'Hayatının filminde seni kim oynardı?' },
    { id: 'bd-08', text: 'Bir günlüğüne her şeyi bırakıp gitme şansın olsa nereye giderdin?' },
    { id: 'bd-09', text: 'Gelecekteki kendine tek bir cümle bırakacak olsan ne yazardın?' },
    { id: 'bd-10', text: 'Ve merak edilen soru… hangi takımı tutuyorsun?' },
  ],
  'Bebek': [
    { id: 'bb-01', text: 'Anne/baba olacağını öğrendiğin an ilk ne hissettin?' },
    { id: 'bb-02', text: 'Bebeğini ilk kucağına aldığında zaman durmuş gibi oldu mu?' },
    { id: 'bb-03', text: 'Onun sende hangi özelliği almasını istersin?' },
    { id: 'bb-04', text: 'Bebeğin için kurduğun en büyük hayal ne?' },
    { id: 'bb-05', text: 'Bu süreçte seni en çok duygulandıran an hangisiydi?' },
    { id: 'bb-06', text: 'Ona hayat hakkında öğretmek istediğin ilk şey ne olurdu?' },
    { id: 'bb-07', text: 'Gece uykusuz kalsan bile seni mutlu eden şey ne oluyor?' },
    { id: 'bb-08', text: 'Çocuğunun seni yıllar sonra nasıl hatırlamasını istersin?' },
    { id: 'bb-09', text: 'Bir gün bu röportajı okuyacak olsa ona ne söylemek isterdin?' },
    { id: 'bb-10', text: 'Ve şimdiden karar verildi mi… hangi takımı tutmasını istiyorsun?' },
  ],
  'Mezuniyet': [
    { id: 'mz-01', text: 'Bu yolculuk boyunca seni en çok değiştiren şey ne oldu?' },
    { id: 'mz-02', text: 'Okul hayatında asla unutamayacağın bir an var mı?' },
    { id: 'mz-03', text: 'Mezun olduğun gün ilk kimi görmek istedin?' },
    { id: 'mz-04', text: 'En zor zamanında seni ayakta tutan şey neydi?' },
    { id: 'mz-05', text: 'Hayatının bu dönemini tek bir kelimeyle anlatsan ne derdin?' },
    { id: 'mz-06', text: 'Şimdi geçmişe dönsen hangi günü tekrar yaşamak isterdin?' },
    { id: 'mz-07', text: 'Kendinle en çok gurur duyduğun an hangisiydi?' },
    { id: 'mz-08', text: 'Gelecekle ilgili seni en çok heyecanlandıran şey ne?' },
    { id: 'mz-09', text: 'Yıllar sonra bugünkü haline ne söylemek isterdin?' },
    { id: 'mz-10', text: 'Ve kampüslerin vazgeçilmez konusu… hangi takımı tutuyorsun?' },
  ],
  'Kariyer': [
    { id: 'kr-01', text: 'Başarıyı ilk kez gerçekten hissettiğin an neydi?' },
    { id: 'kr-02', text: 'Bugünkü haline gelene kadar seni en çok zorlayan şey ne oldu?' },
    { id: 'kr-03', text: 'Kariyerinde unutamadığın bir dönüm noktası var mı?' },
    { id: 'kr-04', text: 'Çocukluk hayalinle bugünkü hayatın ne kadar benziyor?' },
    { id: 'kr-05', text: 'İş hayatında seni diğer insanlardan ayıran özellik ne?' },
    { id: 'kr-06', text: 'Yorulduğunda devam etmeni sağlayan şey ne oluyor?' },
    { id: 'kr-07', text: 'Başarının arkasında kimlerin desteği var?' },
    { id: 'kr-08', text: 'Bir gün her şeyi bırakıp başka bir hayat kurma şansın olsa ne yapardın?' },
    { id: 'kr-09', text: 'Gelecekte insanların seni nasıl hatırlamasını istersin?' },
    { id: 'kr-10', text: 'Ve yoğun tempoya rağmen kaçırılmayan soru… hangi takımı tutuyorsun?' },
  ],
};

export function buildEmptyAnswers(category: CategoryLabel): Record<string, string> {
  const qs = QUESTIONS[category] ?? [];
  return Object.fromEntries(qs.map(q => [q.id, '']));
}
