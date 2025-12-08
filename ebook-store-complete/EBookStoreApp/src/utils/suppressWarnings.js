// Suppress React Native Web warnings in development
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const message = typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0] || '');
  const fullMessage = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg || '')).join(' ');
  
  if (
    typeof message === 'string' &&
    (
      message.includes('Invalid DOM property `transform-origin`') ||
      message.includes('Unknown event handler property') ||
      message.includes('onStartShouldSetResponder') ||
      message.includes('onResponderTerminationRequest') ||
      message.includes('onResponderGrant') ||
      message.includes('onResponderMove') ||
      message.includes('onResponderRelease') ||
      message.includes('onResponderTerminate') ||
      message.includes('StripeKeepJsAwakeTask') ||
      message.includes('No task registered for key') ||
      message.includes('Text strings must be rendered within a <Text> component')
    )
  ) {
    return;
  }

  if (
    fullMessage.includes('status code 401') ||
    fullMessage.includes('ERR_BAD_REQUEST') ||
    fullMessage.includes('Email hoặc mật khẩu không đúng') ||
    fullMessage.includes('Login failed') ||
    fullMessage.includes('SimpleApiService.login error') ||
    fullMessage.includes('AuthContext.login error') ||
    fullMessage.includes('SimpleApiService.verifyRegistrationOTP error') ||
    fullMessage.includes('SimpleApiService.verifyForgotPassword error') ||
    fullMessage.includes('Mã OTP không đúng') ||
    (fullMessage.includes('status') && fullMessage.includes('401')) ||
    (fullMessage.includes('response') && fullMessage.includes('success') && fullMessage.includes('false') && fullMessage.includes('401'))
  ) {
    return;
  }
  
  originalError.apply(console, args);
};

console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (
      message.includes('Invalid DOM property `transform-origin`') ||
      message.includes('Unknown event handler property') ||
      message.includes('onStartShouldSetResponder') ||
      message.includes('onResponderTerminationRequest') ||
      message.includes('onResponderGrant') ||
      message.includes('onResponderMove') ||
      message.includes('onResponderRelease') ||
      message.includes('onResponderTerminate') ||
      message.includes('StripeKeepJsAwakeTask') ||
      message.includes('No task registered for key') ||
      message.includes('Text strings must be rendered within a <Text> component')
    )
  ) {
    return;
  }
  originalWarn.apply(console, args);
};
