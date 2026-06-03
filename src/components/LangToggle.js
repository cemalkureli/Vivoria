import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { C } from '../utils/theme';
import { useLang } from '../context/LanguageContext';

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <View style={s.wrap}>
      {['tr', 'en'].map(l => (
        <TouchableOpacity
          key={l}
          style={[s.btn, lang === l && s.active]}
          onPress={() => setLang(l)}
          activeOpacity={0.7}
        >
          <Text style={[s.txt, lang === l && s.activeTxt]}>
            {l.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:      { flexDirection: 'row', backgroundColor: C.s2, borderRadius: 10, borderWidth: 1, borderColor: C.border2, overflow: 'hidden' },
  btn:       { paddingHorizontal: 12, paddingVertical: 6 },
  active:    { backgroundColor: C.orchid + '22' },
  txt:       { color: C.dim, fontSize: 11, fontWeight: '700' },
  activeTxt: { color: C.orchid },
});
