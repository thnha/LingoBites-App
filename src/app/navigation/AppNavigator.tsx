import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  BootGateScreen,
  OnboardingNameScreen,
  useAccountStore,
} from '@modules/account';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {
  CreateStackParamList,
  HomeStackParamList,
  LessonsStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  RootTabParamList,
} from './types';
import {
  CreateScreen,
  HomeScreen,
  PasteTextScreen,
  ImageCaptureScreen,
} from '@modules/input';
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
import {CurriculumLessonScreen} from '@modules/curriculumLesson';
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
import {accountGateRouteForPhase} from './accountGate';
import {getRootStackRouteNames} from './rootStackRoutes';
import {tabBarVisibilityOptions} from './immersiveTabRoutes';
import {isIngestionRouteEnabled} from './ingestionRouteGate';
import {
  YouTubeInputScreen,
  YouTubeHistoryScreen,
  YouTubeProcessingScreen,
  YouTubeLessonRouteScreen,
} from '@modules/youtube';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CreateStack = createNativeStackNavigator<CreateStackParamList>();
const LessonsStack = createNativeStackNavigator<LessonsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        component={HomeScreen}
        name="HomeMain"
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        component={ContentLessonRuntimeScreen}
        name="ContentLessonRuntime"
        options={{headerShown: false, gestureEnabled: false}}
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

function CreateStackNavigator() {
  const {config} = useFeatureFlags();
  const canMount = (route: string) =>
    isIngestionRouteEnabled(route, config.features);

  return (
    <CreateStack.Navigator>
      <CreateStack.Screen
        component={CreateScreen}
        name="CreateMain"
        options={{headerShown: false}}
      />
      {config.features.youtubeLearning && (
        <>
          <CreateStack.Screen
            component={YouTubeInputScreen}
            name="YouTubeInput"
            // SETE-289: the fromHome exit contract lives in the header
            // Back handler — the iOS swipe gesture would bypass it and
            // pop to CreateMain, so it stays disabled (same as
            // YouTubeProcessing below). Android system Back is
            // intercepted via beforeRemove in the screen itself.
            options={{headerShown: false, gestureEnabled: false}}
          />
          {/* SETE-289: YouTubeHistory lives on the RootStack (above the
              tabs), so it is no longer a CreateStack route. */}
          <CreateStack.Screen
            component={YouTubeProcessingScreen}
            name="YouTubeProcessing"
            options={{headerShown: false, gestureEnabled: false}}
          />
          <CreateStack.Screen
            component={YouTubeLessonRouteScreen}
            name="YouTubeLesson"
            options={{headerShown: false, orientation: 'portrait'}}
          />
        </>
      )}
      {canMount('PasteText') && (
        <CreateStack.Screen
          component={PasteTextScreen}
          name="PasteText"
          options={{headerShown: false}}
        />
      )}
      {canMount('ImageCapture') && (
        <CreateStack.Screen
          component={ImageCaptureScreen}
          name="ImageCapture"
          options={{headerShown: false}}
        />
      )}
      {canMount('OCRReview') && (
        <CreateStack.Screen
          component={OCRReviewScreen}
          name="OCRReview"
          options={{headerShown: false}}
        />
      )}
      {canMount('Analyzing') && (
        <CreateStack.Screen
          component={AnalyzingScreen}
          name="Analyzing"
          options={{headerShown: false, gestureEnabled: false}}
        />
      )}
      <CreateStack.Screen
        component={LessonResultScreen}
        name="LessonResult"
        options={{headerShown: false}}
      />
      {canMount('ProgressiveLesson') && (
        <CreateStack.Screen
          component={ProgressiveLessonScreen}
          name="ProgressiveLesson"
          options={{headerShown: false}}
        />
      )}
      <CreateStack.Screen
        component={SentenceDetailScreen}
        name="SentenceDetail"
        options={{headerShown: false}}
      />
      <CreateStack.Screen
        component={WordDetailScreen}
        name="WordDetail"
        options={{headerShown: false}}
      />
      <CreateStack.Screen
        component={GrammarDetailScreen}
        name="GrammarDetail"
        options={{headerShown: false}}
      />
      <CreateStack.Screen
        component={PracticeScreen}
        name="Practice"
        options={{headerShown: false}}
      />
    </CreateStack.Navigator>
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
        component={CurriculumLessonScreen}
        name="CurriculumLesson"
        options={{headerShown: false, gestureEnabled: false}}
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
      {/* Developer-only screens — not registered on production builds. */}
      {__DEV__ ? (
        <ProfileStack.Screen
          component={FeatureStatusScreen}
          name="FeatureStatus"
          options={{headerShown: false}}
        />
      ) : null}
      {__DEV__ ? (
        <ProfileStack.Screen
          component={TtsSpikeScreen}
          name="TtsSpike"
          options={{headerShown: false}}
        />
      ) : null}
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

function TabNavigator() {
  return (
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
        component={CreateStackNavigator}
        name="Create"
        options={({route}) => ({
          title: 'Create',
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
  );
}

/**
 * SETE-289: a root stack above the Tab.Navigator. `YouTubeHistory` (and
 * the lesson/detail screens it opens) render here, so no bottom bar is
 * shown and no tab state is touched — the "independent of the bottom tab"
 * behavior comes from the navigation structure, not a tab-bar workaround.
 */
export function AppNavigator() {
  const {config} = useFeatureFlags();
  const rootRouteNames = getRootStackRouteNames(config.features);
  const phase = useAccountStore(state => state.phase);
  const boot = useAccountStore(state => state.boot);
  useEffect(() => {
    void boot();
  }, [boot]);

  if (accountGateRouteForPhase(phase) !== 'Tabs') {
    return (
      <NavigationContainer>
        <RootStack.Navigator
          id="RootStack"
          screenOptions={{headerShown: false}}
        >
          {accountGateRouteForPhase(phase) === 'Onboarding' ? (
            <RootStack.Screen
              component={OnboardingNameScreen}
              name="Onboarding"
            />
          ) : (
            <RootStack.Screen component={BootGateScreen} name="BootGate" />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    );
  }
  return (
    <NavigationContainer>
      <RootStack.Navigator id="RootStack" screenOptions={{headerShown: false}}>
        <RootStack.Screen component={TabNavigator} name="Tabs" />
        {rootRouteNames.includes('YouTubeHistory') && (
          <RootStack.Screen
            component={YouTubeHistoryScreen}
            name="YouTubeHistory"
          />
        )}
        {rootRouteNames.includes('YouTubeLesson') && (
          <RootStack.Screen
            component={YouTubeLessonRouteScreen}
            name="YouTubeLesson"
            options={{headerShown: false, orientation: 'portrait'}}
          />
        )}
        {rootRouteNames.includes('SentenceDetail') && (
          <RootStack.Screen
            component={SentenceDetailScreen}
            name="SentenceDetail"
          />
        )}
        {rootRouteNames.includes('WordDetail') && (
          <RootStack.Screen component={WordDetailScreen} name="WordDetail" />
        )}
        {rootRouteNames.includes('GrammarDetail') && (
          <RootStack.Screen
            component={GrammarDetailScreen}
            name="GrammarDetail"
          />
        )}
        {rootRouteNames.includes('Practice') && (
          <RootStack.Screen component={PracticeScreen} name="Practice" />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
