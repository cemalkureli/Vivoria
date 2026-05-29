import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Dimensions,
} from 'react-native';
import { C } from '../utils/theme';

const { height } = Dimensions.get('window');

const CATEGORY_COLOR = {
  sabah:    C.lime,
  bakim:    C.purple,
  beslenme: C.green,
  vitamin:  C.orange,
  hareket:  C.green,
  is:       C.blue,
  su:       C.blue,
  barfiks:  C.lime,
  spor:     C.red,
  gece:     C.purple,
};

export default function TaskModal({ task, visible, onClose, onDone, canComplete = true }) {
  if (!task) return null;

  const accent = CATEGORY_COLOR[task.category] || C.lime;
  const hasSteps = task.steps && task.steps.length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.handle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          {/* Header çizgisi */}
          <View style={[s.accentBar, { backgroundColor: accent }]} />

          {/* Saat + Başlık */}
          <Text style={[s.time, { color: accent }]}>⏰ {task.time}</Text>
          <Text style={s.title}>{task.label}</Text>

          {/* Kısa açıklama */}
          {task.desc ? (
            <Text style={s.desc}>{task.desc}</Text>
          ) : null}

          {/* Adım adım talimatlar */}
          {hasSteps && (
            <View style={s.stepsWrap}>
              <Text style={s.stepsTitle}>📋 KULLANIM TALİMATI</Text>
              {task.steps.map((step, i) => {
                // Her adımın ilk satırı başlık, geri kalanı açıklama
                const lines = step.split('\n');
                const stepTitle = lines[0];
                const stepBody  = lines.slice(1).join('\n');

                return (
                  <View key={i} style={[s.stepCard, { borderLeftColor: accent }]}>
                    {/* Adım numarası + başlık */}
                    <View style={s.stepHeader}>
                      <View style={[s.stepBadge, { backgroundColor: accent + '22', borderColor: accent }]}>
                        <Text style={[s.stepBadgeText, { color: accent }]}>{i + 1}</Text>
                      </View>
                      <Text style={s.stepTitle}>{stepTitle}</Text>
                    </View>

                    {/* Adım gövdesi */}
                    {stepBody ? (
                      <Text style={s.stepBody}>{stepBody}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 8 }} />
        </ScrollView>

        {/* Tamamlandı butonu */}
        <TouchableOpacity
          style={[s.doneBtn, canComplete ? { backgroundColor: accent } : s.doneBtnLocked]}
          onPress={canComplete ? onDone : null}
          disabled={!canComplete}
          activeOpacity={canComplete ? 0.8 : 1}
        >
          {canComplete ? (
            <Text style={s.doneBtnText}>✓  TAMAMLANDI</Text>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={s.doneBtnTextLocked}>🔒  Henüz vakti gelmedi</Text>
              <Text style={s.doneBtnTimeLocked}>{task.time}'de tamamlanabilir</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={s.skipBtn} onPress={onClose}>
          <Text style={s.skipBtnText}>Kapat</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: C.s1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: height * 0.85,
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: C.border2,
    borderRadius: 100,
    alignSelf: 'center',
    marginVertical: 14,
  },
  accentBar: { height: 2, borderRadius: 2, marginBottom: 14 },
  time:  { fontSize: 13, letterSpacing: 1, marginBottom: 4 },
  title: {
    color: C.text, fontSize: 22,
    fontWeight: '800', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  desc: {
    color: C.muted, fontSize: 13,
    lineHeight: 20, marginBottom: 14,
  },

  // Adımlar
  stepsWrap: {
    backgroundColor: C.s2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  stepsTitle: {
    color: C.muted, fontSize: 10,
    letterSpacing: 2, fontWeight: '800',
    marginBottom: 6,
  },
  stepCard: {
    backgroundColor: C.s1,
    borderRadius: 10,
    borderLeftWidth: 3,
    padding: 12,
    marginBottom: 4,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 6,
  },
  stepBadge: {
    width: 22, height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepBadgeText: { fontSize: 10, fontWeight: '800' },
  stepTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    lineHeight: 18,
  },
  stepBody: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 32, // badge genişliği kadar içeri
    marginTop: 2,
  },

  // Tamamlandı butonu
  doneBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  doneBtnText: { color: C.bg, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  doneBtnLocked: {
    backgroundColor: C.s2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  doneBtnTextLocked: { color: C.muted, fontSize: 15, fontWeight: '700' },
  doneBtnTimeLocked: { color: C.dim, fontSize: 11, marginTop: 4 },

  skipBtn:     { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: C.border },
  skipBtnText: { color: C.muted, fontSize: 14 },
});