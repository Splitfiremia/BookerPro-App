import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  TouchableWithoutFeedback 
} from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';

type AlertModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
};

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  onClose,
  type = 'info',
}) => {
  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return COLORS.success || '#10B981';
      case 'error':
        return COLORS.error || '#EF4444';
      case 'warning':
        return COLORS.warning || '#F59E0B';
      case 'info':
      default:
        return COLORS.info || '#3B82F6';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={[styles.header, { backgroundColor: getTypeColor() }]}>
                <Text style={styles.title}>{title}</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.message}>{message}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: getTypeColor() }]} 
                onPress={onClose}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  content: {
    padding: 16,
  },
  message: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  button: {
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
});

export default AlertModal;