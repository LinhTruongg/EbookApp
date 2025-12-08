import { Alert } from 'react-native';

class ErrorHandler {

  static handle(error, options = {}) {

    const {

      showAlert = true,

      logToConsole = __DEV__, // Chỉ log trong development

      title = 'Lỗi',

      defaultMessage = 'Có lỗi xảy ra, vui lòng thử lại',

    } = options;



    // Log ra console trong development

    if (logToConsole) {

      console.error('🔴 Error:', error);

    }



    // Hiển thị alert cho user (nếu cần)

    if (showAlert) {

      Alert.alert(

        title,

        error.message || defaultMessage,

        [{ text: 'Đóng' }]

      );

    }



    // Có thể gửi error lên logging service (Sentry, Firebase Crashlytics)

    if (!__DEV__) {

      // this.reportToSentry(error);

    }



    return error;

  }



  static handlePaymentError(error) {

    const message = this.getPaymentErrorMessage(error);

    

    if (__DEV__) {

      console.log('💳 Payment Error:', message);

    }



    Alert.alert('Thanh toán thất bại', message);

  }



  static getPaymentErrorMessage(error) {

    const errorMap = {

      'payment flow': 'Phiên thanh toán đã hết hạn',

      'insufficient': 'Không đủ điểm',

      'already owned': 'Bạn đã sở hữu sách này',

      'network': 'Lỗi kết nối, vui lòng kiểm tra internet',

    };



    for (const [key, value] of Object.entries(errorMap)) {

      if (error.message?.toLowerCase().includes(key)) {

        return value;

      }

    }



    return 'Không thể xử lý thanh toán, vui lòng thử lại';

  }

}



export default ErrorHandler;

