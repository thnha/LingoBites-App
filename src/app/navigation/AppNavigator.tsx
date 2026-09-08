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
import {useFeatureEnabled} from '@/release';
import {TabBar} from './TabBar';
import {isIngestionRouteHiddenForMvp} from './ingestionRouteGate';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const LessonsStack = createNativeStackNavigator<LessonsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function HomeStackNavigator() {
  const mvpReviewFlowEnabled = useFeatureEnabled('lingobitesMvpReviewFlow');

  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        component={HomeScreen}
        name="HomeMain"
        options={{headerShown: false}}
      />
      {!isIngestionRouteHiddenForMvp('PasteText', mvpReviewFlowEnabled) && (
        <HomeStack.Screen
          component={PasteTextScreen}
          name="PasteText"
          options={{headerShown: false}}
        />
      )}
      {!isIngestionRouteHiddenForMvp('ImageCapture', mvpReviewFlowEnabled) && (
        <HomeStack.Screen
          component={ImageCaptureScreen}
          name="ImageCapture"
          options={{headerShown: false}}
        />
      )}
      {!isIngestionRouteHiddenForMvp('OCRReview', mvpReviewFlowEnabled) && (
        <HomeStack.Screen
          component={OCRReviewScreen}
          name="OCRReview"
          options={{headerShown: false}}
        />
      )}
      {!isIngestionRouteHiddenForMvp('Analyzing', mvpReviewFlowEnabled) && (
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
          options={{title: 'Home'}}
        />
        <Tab.Screen
          component={LessonsStackNavigator}
          name="Lessons"
          options={{title: 'Lessons'}}
        />
        <Tab.Screen
          component={ProfileStackNavigator}
          name="Profile"
          options={{title: 'Profile'}}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
