import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../utils/theme';

export default function Toast({ message, type = 'success', visible, onHide, duration = 2400 }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => onHide?.(), duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible || !message) return null;

  const config = {
    success: { color: C.emerald, icon: 'checkmark-circle-outline' },
    error:   { color: C.rose,    icon: 'alert-circle-outline' },
    info:    { color: C.cyan,    icon: 'information-circle-outline' },
    warning: { color: C.amber,   icon: 'warning-outline' },
  }[type] ?? { color: C.orchid, icon: 'notifications-outline' };

  return (
    <Animated.View
      entering={FadeInUp.springify()}
      exiting={FadeOutUp.duration(200)}
      style={[s.toast, { borderLeftColor: config.color }]}
    >
      <Ionicons name={config.icon} size={18} color={config.color} />
      <Text style={[s.text, { color: config.color }]}>{message}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  toast: {
    position: 'absolute', top: 60, left: 16, right: 16, zIndex: 999,
    backgroundColor: C.s1, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: C.border2, borderLeftWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 8,
  },
  text: { flex: 1, fontSize: 14, fontWeight: '600' },
});
