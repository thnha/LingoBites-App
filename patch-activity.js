const fs = require('fs');
const path = 'src/modules/speaking/activities/SpeakingShadowingActivity.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "import React, {useMemo, useState} from 'react';",
  "import React, {useEffect, useMemo, useState} from 'react';"
);

code = code.replace(
  "import {Alert, Pressable, ScrollView, StyleSheet, View} from 'react-native';",
  "import {Alert, Linking, Pressable, ScrollView, StyleSheet, View} from 'react-native';"
);

code = code.replace(
  "  startRecording,",
  "  requestMicrophonePermission,\n  startRecording,"
);

const oldHandleToggleRecording = `  async function handleToggleRecording() {
    if (phase === 'idle') {
      const start = await startRecording('shadowing', \`shadow-\${Date.now()}\`);
      if (!start.ok) {
        Alert.alert('Ghi âm', start.message);
        return;
      }
      setFilePath(start.filePath);
      setStartedAtMs(Date.now());
      setPhase('recording');
      return;
    }`;

const newHandleToggleRecording = `  useEffect(() => {
    // Pre-flight check: request/verify microphone permission when the speaking activity opens
    requestMicrophonePermission();
  }, []);

  async function handleToggleRecording() {
    if (phase === 'idle') {
      const start = await startRecording('shadowing', \`shadow-\${Date.now()}\`);
      if (!start.ok) {
        if (start.errorCode === 'PERMISSION_DENIED') {
          Alert.alert(
            'Cần quyền truy cập micro',
            start.message,
            [
              { text: 'Huỷ', style: 'cancel' },
              { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() }
            ]
          );
        } else if (start.errorCode === 'NO_INPUT_DEVICE') {
          Alert.alert('Ghi âm', start.message, [{ text: 'OK' }]);
        } else if (start.errorCode === 'TRANSIENT_FAILURE') {
          Alert.alert('Ghi âm', start.message, [
            { text: 'Huỷ', style: 'cancel' },
            { text: 'Thử lại', onPress: () => handleToggleRecording() }
          ]);
        } else {
          Alert.alert('Ghi âm', start.message);
        }
        return;
      }
      setFilePath(start.filePath);
      setStartedAtMs(Date.now());
      setPhase('recording');
      return;
    }`;

code = code.replace(oldHandleToggleRecording, newHandleToggleRecording);

fs.writeFileSync(path, code);
