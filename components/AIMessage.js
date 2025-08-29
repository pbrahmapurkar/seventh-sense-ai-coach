// AIMessage – Seventh Sense
// Small card that fetches and displays a deterministic motivational nudge

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';
let Clipboard;
try { Clipboard = require('expo-clipboard'); } catch (e) { Clipboard = null; }
import { getMotivation, buildMotivationPrompt } from '../utils/ai';

/**
 * @typedef {Object} AIMessageProps
 * @property {object} ctx
 * @property {string} [initialMessage]
 * @property {boolean} [autoLoad]
 * @property {(msg:string)=>void} [onMessage]
 * @property {import('react-native').ViewStyle} [style]
 * @property {string} [title]
 */

function AIMessage({ ctx, initialMessage, autoLoad = false, onMessage, style, title }) {
  const theme = useTheme();
  const [message, setMessage] = useState(initialMessage || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refresh = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const msg = await getMotivation(ctx || {});
      if (!mountedRef.current) return;
      setMessage(msg || '');
      onMessage?.(msg || '');
    } catch (e) {
      if (!mountedRef.current) return;
      setError("Couldn't get a message. Try again.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [ctx, loading, onMessage]);

  const handleCopy = useCallback(async () => {
    try {
      if (Clipboard && typeof Clipboard.setStringAsync === 'function') {
        await Clipboard.setStringAsync(message || '');
      }
    } catch {}
  }, [message]);

  useEffect(() => {
    if (initialMessage) return;
    if (autoLoad) refresh();
  }, [autoLoad, initialMessage, refresh]);

  const border = theme?.colors?.border || 'rgba(0,0,0,0.1)';
  const cardBg = theme?.colors?.card || (theme?.dark ? '#111827' : '#FFFFFF');
  const textColor = theme?.colors?.text || (theme?.dark ? '#F3F4F6' : '#111827');
  const primary = theme?.colors?.primary || '#4F46E5';
  const danger = theme?.colors?.notification || '#DC2626';

  const display = message || (ctx?.habitName ? 'Tap refresh for a fresh nudge.' : 'Add a habit to get motivation.');

  return (
    <View
      style={[styles.card, { backgroundColor: cardBg, borderColor: border }, style]}
      accessibilityLabel="Motivation card"
      accessibilityRole="summary"
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: textColor }]} accessibilityRole="header" allowFontScaling>
          {title || 'Motivation'}
        </Text>
        {loading ? (
          <Text style={[styles.loading, { color: textColor }]} allowFontScaling>
            Refreshing…
          </Text>
        ) : null}
      </View>

      <Pressable
        onLongPress={message ? handleCopy : undefined}
        accessibilityLabel="Motivational message"
        accessibilityHint={message ? 'Long-press to copy' : undefined}
        disabled={!message}
      >
        <Text style={[styles.message, { color: textColor }]} allowFontScaling numberOfLines={4}>
          {display}
        </Text>
      </Pressable>

      <View style={styles.footerRow}>
        {error ? (
          <Text style={[styles.error, { color: danger }]} allowFontScaling>
            {error}
          </Text>
        ) : (
          <View />
        )}

        <Pressable
          onPress={refresh}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Refresh motivation"
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: loading ? 'rgba(0,0,0,0.15)' : primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={styles.buttonText} allowFontScaling>
            {loading ? 'Refreshing…' : 'Refresh'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  loading: {
    fontSize: 12,
    opacity: 0.7,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 44,
  },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  error: {
    fontSize: 12,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default AIMessage;
