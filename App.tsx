import React, {useEffect} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from './src/app/navigation/AppNavigator';
import {trackAppOpened} from './src/modules/analytics';
import {installGlobalErrorHandler} from './src/shared/errors';
import {FeatureFlagProvider} from './src/release';
import {AppThemeProvider} from './src/theme';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    installGlobalErrorHandler();
    trackAppOpened();
  }, []);

  return (
    <FeatureFlagProvider>
      <SafeAreaProvider>
        <AppThemeProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <AppNavigator />
        </AppThemeProvider>
      </SafeAreaProvider>
    </FeatureFlagProvider>
  );
}

export default App;
