import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
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
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (value) {
      try {
        if (value.includes('T')) {
          return new Date(value);
        } else {
          return new Date(value + 'T00:00:00');
        }
      } catch (e) {
        return new Date();
      }
    }
    return new Date();
  });
  const webInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<any>(null);

  useEffect(() => {
    if (value) {
      try {
        let newDate: Date;
        if (value.includes('T')) {
          newDate = new Date(value);
        } else {
          newDate = new Date(value + 'T00:00:00');
        }
        if (!isNaN(newDate.getTime())) {
          setCurrentDate(newDate);
          console.log('DateTimeField: value updated, new date:', newDate.toISOString());
          if (Platform.OS === 'web' && webInputRef.current) {
            const yyyy = newDate.getUTCFullYear();
            const mm = String(newDate.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(newDate.getUTCDate()).padStart(2, '0');
            webInputRef.current.value = `${yyyy}-${mm}-${dd}`;
            console.log('📅 Updated web input value to:', webInputRef.current.value);
          }
        } else {
          console.warn('DateTimeField: Invalid date value:', value);
        }
      } catch (e) {
        console.error('Error parsing value:', e, 'value:', value);
      }
    } else {
      console.log('DateTimeField: value is empty');
    }
  }, [value]);


  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'set' && selectedDate) {
        const iso = selectedDate.toISOString();
        onChange(iso);
      }
    } else if (Platform.OS === 'ios' && selectedDate) {
      setCurrentDate(selectedDate);
    }
  };

  const handleConfirm = () => {
    if (currentDate) {
      const iso = currentDate.toISOString();
      onChange(iso);
    }
    setShow(false);
  };

  const handleCancel = () => {
    setCurrentDate(value ? new Date(value) : new Date());
    setShow(false);
  };

  const handleWebInputChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const inputValue = input.value;
    console.log('📅 Web input change event fired, value:', inputValue);
    if (inputValue) {
      const selected = new Date(`${inputValue}T00:00:00`);
      const isoString = selected.toISOString();
      console.log('📅 Calling onChange with ISO string:', isoString);
      onChange(isoString);
    }
  };

  const openWebPicker = () => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      console.log('Not web platform or document undefined');
      return;
    }

    console.log('📅 Opening web date picker...');
    
    try {
      const input = document.createElement('input');
      input.type = 'date';
      
      if (value) {
        try {
          let date: Date;
          if (value.includes('T')) {
            date = new Date(value);
          } else {
            date = new Date(value + 'T00:00:00');
          }
          if (!isNaN(date.getTime())) {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            input.value = `${yyyy}-${mm}-${dd}`;
            console.log('📅 Set input value to:', input.value, 'from value:', value);
          }
        } catch (e) {
          console.error('Error setting input value:', e);
        }
      } else if (currentDate) {
        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dd = String(currentDate.getDate()).padStart(2, '0');
        input.value = `${yyyy}-${mm}-${dd}`;
        console.log('📅 Set input value to:', input.value, 'from currentDate');
      }

      if (minimumDate) {
        const yyyy = minimumDate.getFullYear();
        const mm = String(minimumDate.getMonth() + 1).padStart(2, '0');
        const dd = String(minimumDate.getDate()).padStart(2, '0');
        input.min = `${yyyy}-${mm}-${dd}`;
      }

      if (maximumDate) {
        const yyyy = maximumDate.getFullYear();
        const mm = String(maximumDate.getMonth() + 1).padStart(2, '0');
        const dd = String(maximumDate.getDate()).padStart(2, '0');
        input.max = `${yyyy}-${mm}-${dd}`;
      }

      input.style.position = 'fixed';
      input.style.top = '0';
      input.style.left = '0';
      input.style.width = '100%';
      input.style.height = '100%';
      input.style.opacity = '0';
      input.style.pointerEvents = 'auto';
      input.style.zIndex = '999999';
      input.style.cursor = 'pointer';

      const handleChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        console.log('📅 handleChange event fired, input.value:', target.value);
        if (target.value) {
          const [year, month, day] = target.value.split('-').map(Number);
          const selected = new Date(year, month - 1, day);
          const isoString = selected.toISOString();
          console.log('📅 Selected date (local):', selected.toLocaleDateString('vi-VN'), 'input value:', target.value, 'ISO:', isoString);
          onChange(isoString);
        }
        setTimeout(() => {
          cleanup();
        }, 200);
      };

      const cleanup = () => {
        console.log('📅 Cleaning up input element');
        if (document.body.contains(input)) {
          input.removeEventListener('change', handleChange);
          document.body.removeChild(input);
        }
      };

      input.addEventListener('change', handleChange);

      document.body.appendChild(input);
      console.log('📅 Input element appended to body');
      
      setTimeout(() => {
        try {
          console.log('📅 Attempting to open date picker...');
          input.focus();
          if (typeof input.showPicker === 'function') {
            console.log('📅 Using showPicker() method');
            try {
              const pickerPromise = input.showPicker();
              if (pickerPromise && typeof pickerPromise.catch === 'function') {
                pickerPromise.catch((err: any) => {
                  console.log('📅 showPicker() failed, falling back to click():', err);
                  input.click();
                });
              } else {
                input.click();
              }
            } catch (showPickerErr) {
              console.log('📅 showPicker() threw error, using click():', showPickerErr);
              input.click();
            }
          } else {
            console.log('📅 Using click() method');
            input.click();
          }
        } catch (err) {
          console.error('❌ Error triggering date picker:', err);
          try {
            input.click();
          } catch (clickErr) {
            console.error('❌ Error clicking input:', clickErr);
          }
        }
      }, 50);
    } catch (e) {
      console.error('❌ Error opening web date picker:', e);
    }
  };

  const formatDisplay = () => {
    if (!value) {
      console.log('formatDisplay: no value, returning placeholder');
      return placeholder;
    }
    
    try {
      let dateToFormat: Date;
      
      if (value.includes('T')) {
        dateToFormat = new Date(value);
      } else {
        dateToFormat = new Date(value + 'T00:00:00');
      }
      
      if (isNaN(dateToFormat.getTime())) {
        console.warn('Invalid date value:', value);
        return placeholder;
      }
      
      if (mode === 'time') {
        return dateToFormat.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      
      const year = dateToFormat.getFullYear();
      const month = String(dateToFormat.getMonth() + 1).padStart(2, '0');
      const day = String(dateToFormat.getDate()).padStart(2, '0');
      
      const formatted = `${day}/${month}/${year}`;
      console.log('formatDisplay: value=', value, 'dateToFormat local=', dateToFormat.toLocaleDateString('vi-VN'), 'dateToFormat ISO=', dateToFormat.toISOString(), 'formatted=', formatted);
      return formatted;
    } catch (e) {
      console.error('Error formatting date:', e, 'value:', value);
      return placeholder;
    }
  };

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS === 'web') {
      openWebPicker();
    } else {
      if (value) {
        setCurrentDate(new Date(value));
      } else {
        setCurrentDate(new Date());
      }
      setShow(true);
    }
  };

  const displayText = formatDisplay();
  console.log('DateTimeField render - value:', value, 'displayText:', displayText);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.field, disabled && styles.fieldDisabled]}
        onPress={handlePress}
        disabled={disabled}
      >
        <Text style={[styles.valueText, !value && styles.placeholderText]}>{displayText}</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && show && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={show}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Hủy</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label || 'Chọn ngày'}</Text>
                <TouchableOpacity onPress={handleConfirm} style={styles.modalButton}>
                  <Text style={[styles.modalButtonText, styles.modalButtonConfirm]}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={currentDate}
                mode={mode === 'datetime' ? 'date' : mode}
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={currentDate}
          mode={mode === 'datetime' ? 'date' : mode}
          display="default"
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
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  field: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  fieldDisabled: {
    opacity: 0.6,
  },
  valueText: {
    fontSize: 16,
    color: '#374151',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalButton: {
    padding: 8,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalButtonConfirm: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  datePicker: {
    width: '100%',
    height: 200,
  },
});


