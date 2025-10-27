// Suppress React Native Web warnings in development
if (__DEV__ && typeof window !== 'undefined') {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
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
        message.includes('onResponderTerminate')
      )
    ) {
      return; // Suppress these warnings
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
        message.includes('onResponderTerminate')
      )
    ) {
      return; // Suppress these warnings
    }
    originalWarn.apply(console, args);
  };
}
