import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type DateTimeMode = 'date' | 'time' | 'datetime';

interface DateTimeFieldProps {
  label?: string;
  value?: string;
  onChange: (isoString: string) => void;
  mode?: DateTimeMode;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  disabled?: boolean;
}

export default function DateTimeField({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  placeholder = 'Chọn ngày...',
  disabled = false,
}: DateTimeFieldProps) {
  const [show, setShow] = useState(false);

  const currentDate = value ? new Date(value) : undefined;

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') setShow(false);
    if (selectedDate) {
      const iso = selectedDate.toISOString();
      onChange(iso);
    }
  };

  const openWebPicker = () => {
    try {
      const input = document.createElement('input');
      if (mode === 'time') {
        input.type = 'time';
      } else if (mode === 'datetime') {
        // Fallback to date-only for broader browser support
        input.type = 'date';
      } else {
        input.type = 'date';
      }

      if (currentDate) {
        if (input.type === 'time') {
          const hh = String(currentDate.getHours()).padStart(2, '0');
          const mm = String(currentDate.getMinutes()).padStart(2, '0');
          input.value = `${hh}:${mm}`;
        } else {
          const yyyy = currentDate.getFullYear();
          const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
          const dd = String(currentDate.getDate()).padStart(2, '0');
          input.value = `${yyyy}-${mm}-${dd}`;
        }
      }

      if (minimumDate && input.type !== 'time') {
        const yyyy = minimumDate.getFullYear();
        const mm = String(minimumDate.getMonth() + 1).padStart(2, '0');
        const dd = String(minimumDate.getDate()).padStart(2, '0');
        input.min = `${yyyy}-${mm}-${dd}`;
      }
      if (maximumDate && input.type !== 'time') {
        const yyyy = maximumDate.getFullYear();
        const mm = String(maximumDate.getMonth() + 1).padStart(2, '0');
        const dd = String(maximumDate.getDate()).padStart(2, '0');
        input.max = `${yyyy}-${mm}-${dd}`;
      }

      input.style.position = 'fixed';
      input.style.opacity = '0';
      input.style.pointerEvents = 'none';
      document.body.appendChild(input);

      input.onchange = () => {
        if (input.type === 'time') {
          const [h = '00', m = '00'] = (input.value || '').split(':');
          const base = currentDate || new Date();
          const selected = new Date(base);
          selected.setHours(parseInt(h, 10));
          selected.setMinutes(parseInt(m, 10));
          onChange(selected.toISOString());
        } else {
          if (input.value) {
            const selected = new Date(`${input.value}T00:00:00`);
            onChange(selected.toISOString());
          }
        }
        setTimeout(() => {
          document.body.removeChild(input);
        }, 0);
      };

      input.click();
    } catch (e) {
      // no-op fallback
    }
  };

  const formatDisplay = () => {
    if (!currentDate) return placeholder;
    if (mode === 'time') return currentDate.toLocaleTimeString();
    return currentDate.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.field, disabled && styles.fieldDisabled]}
        onPress={() => {
          if (disabled) return;
          if (Platform.OS === 'web') {
            openWebPicker();
          } else {
            setShow(true);
          }
        }}
        disabled={disabled}
      >
        <Text style={[styles.valueText, !currentDate && styles.placeholderText]}>{formatDisplay()}</Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={currentDate || new Date()}
          mode={mode === 'datetime' ? 'date' : mode}
          display={Platform.select({ ios: 'spinner', android: 'calendar' }) as any}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  field: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  fieldDisabled: {
    opacity: 0.6,
  },
  valueText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
});


