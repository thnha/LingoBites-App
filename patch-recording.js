const fs = require('fs');
const path = 'src/modules/speaking/recordingService.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "import AudioRecorderPlayer from 'react-native-audio-recorder-player';",
  "import AudioRecorderPlayer from 'react-native-audio-recorder-player';\nimport { Platform } from 'react-native';\nimport { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';"
);

const permissionsCode = `
export async function preflightMicrophonePermission(): Promise<'granted' | 'denied' | 'not_requested' | 'unavailable'> {
  const permission = Platform.OS === 'ios'
    ? PERMISSIONS.IOS.MICROPHONE
    : PERMISSIONS.ANDROID.RECORD_AUDIO;
  
  const status = await check(permission);
  if (status === RESULTS.UNAVAILABLE) return 'unavailable';
  if (status === RESULTS.GRANTED) return 'granted';
  if (status === RESULTS.DENIED) return 'not_requested';
  return 'denied';
}

export async function requestMicrophonePermission(): Promise<'granted' | 'denied' | 'unavailable'> {
  const permission = Platform.OS === 'ios'
    ? PERMISSIONS.IOS.MICROPHONE
    : PERMISSIONS.ANDROID.RECORD_AUDIO;
  
  const status = await request(permission);
  if (status === RESULTS.UNAVAILABLE) return 'unavailable';
  if (status === RESULTS.GRANTED) return 'granted';
  return 'denied';
}
`;

code = code.replace("function getRecorder()", permissionsCode + "\nfunction getRecorder()");

const startRecordingOld = `export type StartRecordingResult =
  | {ok: true; filePath: string}
  | {ok: false; errorCode: 'UNAVAILABLE' | 'STORAGE_ERROR'; message: string};`;

const startRecordingNew = `export type StartRecordingResult =
  | {ok: true; filePath: string}
  | {
      ok: false;
      errorCode: 'UNAVAILABLE' | 'PERMISSION_DENIED' | 'NO_INPUT_DEVICE' | 'TRANSIENT_FAILURE';
      message: string;
    };`;

code = code.replace(startRecordingOld, startRecordingNew);

const oldStartFn = `  if (!nativeFsAvailable()) {
    return {
      ok: false,
      errorCode: 'UNAVAILABLE',
      message: 'Tính năng ghi âm chưa sẵn sàng trên thiết bị này.',
    };
  }
  const directory = \`\${recordingsRoot()}/\${sanitizeRecordingSegment(mode)}\`;
  await ensureDirectory(directory);
  const filePath = \`\${directory}/\${sanitizeRecordingSegment(recordingId)}.m4a\`;

  try {
    await getRecorder().startRecorder(filePath);
    return {ok: true, filePath};
  } catch {
    return {
      ok: false,
      errorCode: 'STORAGE_ERROR',
      message: 'Không thể bắt đầu ghi âm. Vui lòng thử lại.',
    };
  }
}`;

const newStartFn = `  if (!nativeFsAvailable()) {
    return {
      ok: false,
      errorCode: 'UNAVAILABLE',
      message: 'Tính năng ghi âm chưa sẵn sàng trên thiết bị này.',
    };
  }

  const perm = await preflightMicrophonePermission();
  if (perm === 'unavailable') {
    return { ok: false, errorCode: 'NO_INPUT_DEVICE', message: 'Không tìm thấy micro trên thiết bị này.' };
  }
  if (perm === 'not_requested') {
    const requested = await requestMicrophonePermission();
    if (requested !== 'granted') {
      return { ok: false, errorCode: 'PERMISSION_DENIED', message: 'LingoBites cần micro để ghi âm phần luyện nói của bạn.' };
    }
  } else if (perm === 'denied') {
    return { ok: false, errorCode: 'PERMISSION_DENIED', message: 'LingoBites cần micro để ghi âm phần luyện nói của bạn.' };
  }

  const directory = \`\${recordingsRoot()}/\${sanitizeRecordingSegment(mode)}\`;
  await ensureDirectory(directory);
  const filePath = \`\${directory}/\${sanitizeRecordingSegment(recordingId)}.m4a\`;

  try {
    await getRecorder().startRecorder(filePath);
    return {ok: true, filePath};
  } catch {
    return {
      ok: false,
      errorCode: 'TRANSIENT_FAILURE',
      message: 'Không thể bắt đầu ghi âm. Vui lòng thử lại.',
    };
  }
}`;

code = code.replace(oldStartFn, newStartFn);

fs.writeFileSync(path, code);
