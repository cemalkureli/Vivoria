import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { C } from '../utils/theme';

export default function BakimScreen() {
  const sabah = [
    ['1','COSRX Low pH Gel Cleanser','Islak yüze · 1 nohut · 30sn · PAT PAT kuru → Yüz KURU'],
    ['2','Hyaluronic Acid 2% + B5','3 damla · hafif nemli cilt · bastırarak · ⚠️ Kuru yüze değil!'],
    ['3','Niacinamide 10% + Zinc 1%','2 damla · hafif nemli cilt · bastırarak'],
    ['4','Isntree SPF50+ Sun Gel','2 parmak · kuru cilt · bastırarak yay · ATLANMAZ'],
  ];

  const gece = [
    ['1','ANUA Heartleaf Cleansing Oil','Opsiyonel · 2 pompa · kuru yüze · 1dk masaj · az su → beyazlaşır → durula\n⚠️ Islak yüze değil!'],
    ['2','COSRX Low pH Gel Cleanser','1 nohut · ıslak yüze · 30sn · PAT PAT kuru → Yüz KURU'],
    ['3','Some By Mi AHA BHA Toner','Birkaç damla · PAT PAT · temizlik sonrası ilk adım · hafif eksfoliye\n⚠️ Doğrudan kuru cilde uygula'],
    ['4','Hyaluronic Acid 2% + B5','3 damla · hafif nemli cilt · bastırarak'],
    ['5','Niacinamide 10% + Zinc 1%','2 damla · hafif nemli cilt · bastırarak · son adım'],
  ];

  const sporSonrasi = [
    ['1','ANUA Oil','2 pompa · kuru yüze · masaj · durula'],
    ['2','COSRX Gel Cleanser','1 nohut · 30sn · PAT PAT kuru'],
    ['3','Some By Mi AHA BHA','Birkaç damla · PAT PAT · eksfoliye + tonerla'],
    ['4','Hyaluronic Acid','3 damla · hafif nemli cilt'],
    ['5','Niacinamide','2 damla · hafif nemli cilt · son adım'],
  ];

  return (
    <ScrollView style={{ flex:1, backgroundColor:C.bg }} contentContainerStyle={{ padding:16, paddingBottom:32 }}>

      <View style={s.infoCard}>
        <Text style={s.infoTitle}>🧴 Aktif Ürünler</Text>
        {[
          ['ANUA Heartleaf Cleansing Oil','Yüz · Akşam şart, sabah opsiyonel · 2 pompa'],
          ['COSRX Low pH Gel Cleanser','Yüz · Sabah + akşam + spor sonrası · 1 nohut'],
          ['Hyaluronic Acid 2% + B5','Yüz · Sabah + akşam · 3 damla · hafif nemli cilt'],
          ['Niacinamide 10% + Zinc 1%','Yüz · Sabah + akşam · 2 damla · hafif nemli cilt'],
          ['Isntree SPF50+ Sun Gel','Yüz · Sabah şart · 2 parmak · bastırarak yay'],
          ['Some By Mi AHA BHA Toner','Yüz · Akşam · Hafif eksfoliye · Birkaç damla'],
          ['Village 11 Factory AHA Body Peeling','Vücut · Haftada 2-3 kez · 2-3 pompa · durulama yok'],
        ].map(([isim, aciklama], i) => (
          <View key={i} style={{flexDirection:'row',gap:8,paddingVertical:6,borderTopWidth:i>0?1:0,borderTopColor:C.border}}>
            <Text style={{color:C.lime,fontSize:12,fontWeight:'800',width:18}}>{i+1}</Text>
            <View style={{flex:1}}>
              <Text style={{color:C.text,fontSize:12,fontWeight:'700'}}>{isim}</Text>
              <Text style={{color:C.muted,fontSize:11,marginTop:1}}>{aciklama}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={s.sectionTitle}>☀️ SABAH RUTİNİ — Her Gün (4 adım)</Text>
      {sabah.map(([n,isim,not],i)=>(
        <View key={i} style={s.row}>
          <View style={[s.num,{borderColor:n==='4'?C.orange:C.lime}]}>
            <Text style={{color:n==='4'?C.orange:C.lime,fontWeight:'800',fontSize:12}}>{n}</Text>
          </View>
          <View style={{flex:1}}>
            <Text style={s.name}>{isim}</Text>
            <Text style={s.note}>{not}</Text>
          </View>
        </View>
      ))}

      <Text style={[s.sectionTitle,{marginTop:16,color:C.purple}]}>🌙 AKŞAM RUTİNİ — Her Gün (5 adım)</Text>
      {gece.map(([n,isim,not],i)=>(
        <View key={i} style={s.row}>
          <View style={[s.num,{borderColor:n==='1'?C.muted:C.purple}]}>
            <Text style={{color:n==='1'?C.muted:C.purple,fontWeight:'800',fontSize:12}}>{n}</Text>
          </View>
          <View style={{flex:1}}>
            <Text style={s.name}>{isim}{n==='1'?' (opsiyonel)':''}</Text>
            <Text style={s.note}>{not}</Text>
          </View>
        </View>
      ))}

      <Text style={[s.sectionTitle,{marginTop:16,color:C.red}]}>🏃 SPOR SONRASI</Text>
      <View style={[s.infoCard,{borderColor:'rgba(248,113,113,0.3)',backgroundColor:'rgba(248,113,113,0.05)',marginBottom:8}]}>
        <Text style={{color:C.muted,fontSize:12}}>
          Spor sonrası tam gece rutinini uygula.{'\n'}
          Vücut için haftada 2-3 kez Village 11 Factory AHA Body Peeling — temiz kuru cilde, durulama yok.
        </Text>
      </View>
      {sporSonrasi.map(([n,isim,not],i)=>(
        <View key={i} style={s.row}>
          <View style={[s.num,{borderColor:C.red}]}>
            <Text style={{color:C.red,fontWeight:'800',fontSize:12}}>{n}</Text>
          </View>
          <View style={{flex:1}}>
            <Text style={s.name}>{isim}</Text>
            <Text style={s.note}>{not}</Text>
          </View>
        </View>
      ))}

      <Text style={[s.sectionTitle,{marginTop:16,color:C.orange}]}>⚡ İPUÇLARI</Text>
      {[
        ['Havlu','Yüz ve vücut tamponla kurula — sürme yok'],
        ['Sıra','Su bazlı → serum → krem → SPF'],
        ['Nemli cilt','HA ve Niacinamide hafif nemli ciltte kullan'],
        ['SPF','Dışarı çıkıyorsan ATLANMAZ'],
      ].map(([b,a],i)=>(
        <View key={i} style={{flexDirection:'row',gap:10,marginBottom:8}}>
          <Text style={{fontSize:12,width:100,color:C.orange,fontWeight:'700'}}>{b}</Text>
          <Text style={{color:C.muted,fontSize:12,flex:1}}>{a}</Text>
        </View>
      ))}

      <Text style={[s.sectionTitle,{marginTop:16}]}>🦷 DİŞ (günde 3 kez)</Text>
      {[
        {saat:'08:10',ne:'Parodontax macun + Su püskürtücü + Gargara',not:'Salı+Cuma: +H₂O₂ gargara (1:1, 60sn)'},
        {saat:'16:05',ne:'Parodontax macun + Gargara',not:'Tavuk öğünü sonrası'},
        {saat:'19:55',ne:'Parodontax macun + Gargara',not:'Yulaf+Shake sonrası'},
      ].map((r,i)=>(
        <View key={i} style={s.suRow}>
          <Text style={[s.suTime,{color:C.lime}]}>{r.saat}</Text>
          <View style={{flex:1}}>
            <Text style={s.suLabel}>{r.ne}</Text>
            {r.not&&<Text style={{color:C.muted,fontSize:11,marginTop:2}}>{r.not}</Text>}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  infoCard:   { backgroundColor:'rgba(232,244,74,0.06)', borderWidth:1, borderColor:'rgba(232,244,74,0.2)', borderRadius:14, padding:14, marginBottom:14 },
  infoTitle:  { color:C.lime, fontSize:14, fontWeight:'800', marginBottom:6 },
  sectionTitle:{ color:C.muted, fontSize:11, letterSpacing:2, fontWeight:'800', marginBottom:10 },
  row:        { flexDirection:'row', gap:12, backgroundColor:C.s1, borderWidth:1, borderColor:C.border, borderRadius:10, padding:12, marginBottom:6, alignItems:'flex-start' },
  num:        { width:24, height:24, borderRadius:12, borderWidth:1.5, borderColor:C.lime, alignItems:'center', justifyContent:'center', flexShrink:0 },
  name:       { color:C.text, fontSize:13, fontWeight:'700' },
  note:       { color:C.muted, fontSize:11, marginTop:2, lineHeight:16 },
  suRow:      { flexDirection:'row', alignItems:'flex-start', backgroundColor:C.s1, borderWidth:1, borderColor:C.border, borderRadius:10, padding:12, marginBottom:6, gap:10 },
  suTime:     { fontWeight:'800', fontSize:14, width:46 },
  suLabel:    { flex:1, color:C.text, fontSize:13 },
});
