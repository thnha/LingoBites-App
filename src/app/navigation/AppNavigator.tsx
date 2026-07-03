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
import {HomeScreen} from '../../modules/input/HomeScreen';
import {PasteTextScreen} from '../../modules/input/PasteTextScreen';
import {ImageCaptureScreen} from '../../modules/input/ImageCaptureScreen';
import {OCRReviewScreen} from '../../modules/ocr/OCRReviewScreen';
import {AnalyzingScreen} from '../../modules/ai-analysis/AnalyzingScreen';
import {LessonResultScreen} from '../../modules/lesson/LessonResultScreen';
import {LessonsHistoryScreen} from '../../modules/lesson/LessonsHistoryScreen';
import {SavedLessonDetailScreen} from '../../modules/lesson/SavedLessonDetailScreen';
import {SentenceDetailScreen} from '../../modules/lesson/SentenceDetailScreen';
import {WordDetailScreen} from '../../modules/lesson/WordDetailScreen';
import {GrammarDetailScreen} from '../../modules/lesson/GrammarDetailScreen';
import {PracticeScreen} from '../../modules/practice/PracticeScreen';
import {PrivacyNoteScreen} from '../../modules/settings/PrivacyNoteScreen';
import {ProfileScreen} from '../../modules/settings/ProfileScreen';
import {TabBar} from './TabBar';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const LessonsStack = createNativeStackNavigator<LessonsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        component={HomeScreen}
        name="HomeMain"
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        component={PasteTextScreen}
        name="PasteText"
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        component={ImageCaptureScreen}
        name="ImageCapture"
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        component={OCRReviewScreen}
        name="OCRReview"
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        component={AnalyzingScreen}
        name="Analyzing"
        options={{headerShown: false, gestureEnabled: false}}
      />
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
    </ProfileStack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{headerShown: false}} tabBar={props => <TabBar {...props} />}>
        <Tab.Screen component={HomeStackNavigator} name="Home" options={{title: 'Home'}} />
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
