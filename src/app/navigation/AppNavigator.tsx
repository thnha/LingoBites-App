import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {
  HomeStackParamList,
  LessonsStackParamList,
  ProfileStackParamList,
  RootTabParamList,
} from './types';
import {HomeScreen, PasteTextScreen, ImageCaptureScreen} from '@modules/input';
import {OCRReviewScreen} from '@modules/ocr';
import {AnalyzingScreen} from '@modules/ai-analysis';
import {
  LessonResultScreen,
  LessonsHistoryScreen,
  ProgressiveLessonScreen,
  SavedLessonDetailScreen,
  SentenceDetailScreen,
  WordDetailScreen,
  GrammarDetailScreen,
  FlashcardListScreen,
} from '@modules/lesson';
import {PracticeScreen} from '@modules/practice';
import {DailyReviewScreen} from '@modules/review';
import {TodayScreen} from '@modules/today';
import {
  ContentLessonListScreen,
  ContentLessonDetailScreen,
  ContentLessonRuntimeScreen,
} from '@modules/content';
import {SpeakingRoomScreen, SpeakingShadowingActivity} from '@modules/speaking';
import {
  PrivacyNoteScreen,
  ProgressReportScreen,
  ProfileScreen,
  FeatureStatusScreen,
} from '@modules/settings';
import {TtsSpikeScreen} from '@modules/tts';
import {useFeatureFlags} from '@/release';
import {TabBar} from './TabBar';
import {tabBarVisibilityOptions} from './immersiveTabRoutes';
import {isIngestionRouteEnabled} from './ingestionRouteGate';
import {
  YouTubeInputScreen,
  YouTubeProcessingScreen,
  YouTubeManualTranscriptScreen,
  YouTubeLessonRouteScreen,
} from '@modules/youtube';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const LessonsStack = createNativeStackNavigator<LessonsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function HomeStackNavigator() {
  const {config} = useFeatureFlags();
  const canMount = (route: string) =>
    isIngestionRouteEnabled(route, config.features);

  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        component={HomeScreen}
        name="HomeMain"
        options={{headerShown: false}}
      />
      {config.features.youtubeLearning && (
        <>
          <HomeStack.Screen
            component={YouTubeInputScreen}
            name="YouTubeInput"
            options={{headerShown: false}}
          />
          <HomeStack.Screen
            component={YouTubeProcessingScreen}
            name="YouTubeProcessing"
            options={{headerShown: false, gestureEnabled: false}}
          />
          <HomeStack.Screen
            component={YouTubeManualTranscriptScreen}
            name="YouTubeManualTranscript"
            options={{headerShown: false}}
          />
          <HomeStack.Screen
            component={YouTubeLessonRouteScreen}
            name="YouTubeLesson"
            options={{headerShown: false}}
          />
        </>
      )}
      <HomeStack.Screen
        component={ContentLessonRuntimeScreen}
        name="ContentLessonRuntime"
        options={{headerShown: false, gestureEnabled: false}}
      />
      {canMount('PasteText') && (
        <HomeStack.Screen
          component={PasteTextScreen}
          name="PasteText"
          options={{headerShown: false}}
        />
      )}
      {canMount('ImageCapture') && (
        <HomeStack.Screen
          component={ImageCaptureScreen}
          name="ImageCapture"
          options={{headerShown: false}}
        />
      )}
      {canMount('OCRReview') && (
        <HomeStack.Screen
          component={OCRReviewScreen}
          name="OCRReview"
          options={{headerShown: false}}
        />
      )}
      {canMount('Analyzing') && (
        <HomeStack.Screen
          component={AnalyzingScreen}
          name="Analyzing"
          options={{headerShown: false, gestureEnabled: false}}
        />
      )}
      <HomeStack.Screen
        component={LessonResultScreen}
        name="LessonResult"
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        component={SavedLessonDetailScreen}
        name="SavedLessonDetail"
        options={{headerShown: false}}
      />
      {canMount('ProgressiveLesson') && (
        <HomeStack.Screen
          component={ProgressiveLessonScreen}
          name="ProgressiveLesson"
          options={{headerShown: false}}
        />
      )}
      <HomeStack.Screen
        component={FlashcardListScreen}
        name="FlashcardList"
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        component={DailyReviewScreen}
        name="DailyReview"
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        component={TodayScreen}
        name="Today"
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        component={SentenceDetailScreen}
        name="SentenceDetail"
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        component={WordDetailScreen}
        name="WordDetail"
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        component={GrammarDetailScreen}
        name="GrammarDetail"
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        component={PracticeScreen}
        name="Practice"
        options={{headerShown: false}}
      />
    </HomeStack.Navigator>
  );
}

function LessonsStackNavigator() {
  const {config} = useFeatureFlags();
  const canMount = (route: string) =>
    isIngestionRouteEnabled(route, config.features);

  return (
    <LessonsStack.Navigator>
      <LessonsStack.Screen
        component={LessonsHistoryScreen}
        name="LessonsList"
        options={{headerShown: false}}
      />
      <LessonsStack.Screen
        component={SavedLessonDetailScreen}
        name="SavedLessonDetail"
        options={{headerShown: false}}
      />
      {canMount('ProgressiveLesson') && (
        <LessonsStack.Screen
          component={ProgressiveLessonScreen}
          name="ProgressiveLesson"
          options={{headerShown: false}}
        />
      )}
      <LessonsStack.Screen
        component={FlashcardListScreen}
        name="FlashcardList"
        options={{headerShown: false}}
      />
      <LessonsStack.Screen
        component={ContentLessonListScreen}
        name="ContentLessonList"
        options={{headerShown: false}}
      />
      <LessonsStack.Screen
        component={ContentLessonDetailScreen}
        name="ContentLessonDetail"
        options={{headerShown: false}}
      />
      <LessonsStack.Screen
        component={ContentLessonRuntimeScreen}
        name="ContentLessonRuntime"
        options={{headerShown: false, gestureEnabled: false}}
      />
      <LessonsStack.Screen
        component={SpeakingRoomScreen}
        name="SpeakingRoom"
        options={{headerShown: false}}
      />
      <LessonsStack.Screen
        component={SpeakingShadowingActivity}
        name="SpeakingShadowing"
        options={{headerShown: false}}
      />
      <LessonsStack.Screen
        component={TodayScreen}
        name="Today"
        options={{headerShown: false}}
      />
      <LessonsStack.Screen
        component={SentenceDetailScreen}
        name="SentenceDetail"
        options={{headerShown: false}}
      />
      <LessonsStack.Screen
        component={WordDetailScreen}
        name="WordDetail"
        options={{headerShown: false}}
      />
      <LessonsStack.Screen
        component={GrammarDetailScreen}
        name="GrammarDetail"
        options={{headerShown: false}}
      />
      <LessonsStack.Screen
        component={PracticeScreen}
        name="Practice"
        options={{headerShown: false}}
      />
    </LessonsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  const {config} = useFeatureFlags();
  const canMount = (route: string) =>
    isIngestionRouteEnabled(route, config.features);

  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        component={ProfileScreen}
        name="ProfileMain"
        options={{headerShown: false}}
      />
      <ProfileStack.Screen
        component={PrivacyNoteScreen}
        name="PrivacyNote"
        options={{headerShown: false}}
      />
      <ProfileStack.Screen
        component={ProgressReportScreen}
        name="ProgressReport"
        options={{headerShown: false}}
      />
      <ProfileStack.Screen
        component={FeatureStatusScreen}
        name="FeatureStatus"
        options={{headerShown: false}}
      />
      <ProfileStack.Screen
        component={TtsSpikeScreen}
        name="TtsSpike"
        options={{headerShown: false}}
      />
      {canMount('ProgressiveLesson') && (
        <ProfileStack.Screen
          component={ProgressiveLessonScreen}
          name="ProgressiveLesson"
          options={{headerShown: false}}
        />
      )}
    </ProfileStack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{headerShown: false}}
        tabBar={props => <TabBar {...props} />}
      >
        <Tab.Screen
          component={HomeStackNavigator}
          name="Home"
          options={({route}) => ({
            title: 'Home',
            ...tabBarVisibilityOptions({route}),
          })}
        />
        <Tab.Screen
          component={LessonsStackNavigator}
          name="Lessons"
          options={({route}) => ({
            title: 'Lessons',
            ...tabBarVisibilityOptions({route}),
          })}
        />
        <Tab.Screen
          component={ProfileStackNavigator}
          name="Profile"
          options={({route}) => ({
            title: 'Profile',
            ...tabBarVisibilityOptions({route}),
          })}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
