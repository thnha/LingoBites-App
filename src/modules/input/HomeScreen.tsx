import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList, RootTabParamList} from '../../app/navigation/types';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import {IconButton} from '../../components/IconButton';
import {MaterialIcon} from '../../components/MaterialIcon';
import {Medallion} from '../../components/Medallion';
import {RecentLessonRow} from '../../components/RecentLessonRow';
import {SectionHeader} from '../../components/SectionHeader';
import {NO_LESSONS_MESSAGE} from '../../shared/copy/userMessages';
import {listLessons} from '../../shared/db/LessonRepository';
import {useAppTheme} from '../../theme';
import type {LessonCardView} from '../../types/lesson';
import {trackEvent} from '../analytics';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

export function HomeScreen({navigation}: Props) {
  const {theme} = useAppTheme();
  const tabNavigation = navigation.getParent<NavigationProp<RootTabParamList>>();
  const [recentLessons, setRecentLessons] = useState<LessonCardView[]>([]);

  function selectInputMethod(method: 'camera' | 'gallery' | 'paste_text') {
    trackEvent('input_method_selected', {method, screen: 'Home'});
    if (method === 'camera') {
      navigation.navigate('ImageCapture', {sourceType: 'camera'});
      return;
    }
    if (method === 'gallery') {
      navigation.navigate('ImageCapture', {sourceType: 'gallery'});
      return;
    }
    navigation.navigate('PasteText');
  }

  useFocusEffect(
    useCallback(() => {
      setRecentLessons(
        listLessons(3).map(item => ({
          id: item.id,
          title: item.title,
          meta: `${item.vocabularyCount} từ vựng`,
          blurb: item.previewText,
        })),
      );
    }, []),
  );

  const emptyRecent = useMemo(() => recentLessons.length === 0, [recentLessons]);

  return (
    <AppScreen>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          height: 56,
          justifyContent: 'space-between',
          paddingHorizontal: theme.gutter,
        }}>
        <View style={{alignItems: 'center', flexDirection: 'row', gap: 10, minWidth: 0}}>
          <MaterialIcon color={theme.colors.primary} name="translate" size={26} />
          <AppText
            numberOfLines={1}
            style={{color: theme.colors.primary, fontSize: 20, fontWeight: '600'}}>
            LingoBites
          </AppText>
        </View>
        <IconButton
          accessibilityLabel="Cài đặt"
          icon="settings"
          onPress={() => tabNavigation?.navigate('Profile')}
          tone="surface"
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.lg,
          paddingBottom: 28,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        showsVerticalScrollIndicator={false}>
        <View style={{gap: 6}}>
          <AppText variant="h1">Hôm nay bạn muốn học từ đâu?</AppText>
          <AppText color="secondary" variant="body">
            Chọn cách để lấy từ vựng từ bất cứ đoạn text nào bạn đọc.
          </AppText>
        </View>

        <Pressable
          accessibilityLabel="Chụp ảnh học ngay"
          accessibilityRole="button"
          onPress={() => selectInputMethod('camera')}
          style={({pressed}) => [
            {
              alignItems: 'center',
              backgroundColor: theme.colors.accent,
              borderRadius: theme.radius.xl,
              gap: 10,
              opacity: pressed ? theme.states.pressedOpacity : 1,
              paddingHorizontal: 24,
              paddingVertical: 32,
              shadowColor: theme.colors.primary,
              shadowOffset: {width: 0, height: 16},
              shadowOpacity: 0.16,
              shadowRadius: 34,
              elevation: 8,
            },
          ]}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.34)',
              borderRadius: 999,
              height: 84,
              justifyContent: 'center',
              width: 84,
            }}>
            <MaterialIcon color={theme.colors.accentInk} filled name="photo_camera" size={42} />
          </View>
          <AppText style={{color: theme.colors.accentInk, fontSize: 22, fontWeight: '600'}}>
            Chụp ảnh học ngay
          </AppText>
          <AppText style={{color: theme.colors.accentInk, fontSize: 12, opacity: 0.85}}>
            Chĩa camera vào tài liệu bất kỳ
          </AppText>
        </Pressable>

        <View style={{flexDirection: 'row', gap: 14}}>
          <Pressable
            accessibilityLabel="Upload ảnh"
            accessibilityRole="button"
            onPress={() => selectInputMethod('gallery')}
            style={({pressed}) => [
              {
                alignItems: 'center',
                backgroundColor: theme.colors.secondaryContainer,
                borderRadius: theme.radius.lg,
                flex: 1,
                gap: 10,
                opacity: pressed ? theme.states.pressedOpacity : 1,
                paddingHorizontal: 14,
                paddingVertical: 22,
                ...theme.shadow.strong,
              },
            ]}>
            <MaterialIcon color={theme.colors.text.inverse} name="upload_file" size={30} />
            <AppText style={{color: theme.colors.text.inverse, fontSize: 14, fontWeight: '600'}}>
              Upload ảnh
            </AppText>
          </Pressable>

          <Pressable
            accessibilityLabel="Dán text"
            accessibilityRole="button"
            onPress={() => selectInputMethod('paste_text')}
            style={({pressed}) => [
              {
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.accentSoft,
                borderRadius: theme.radius.lg,
                borderWidth: 2,
                flex: 1,
                gap: 10,
                opacity: pressed ? theme.states.pressedOpacity : 1,
                paddingHorizontal: 14,
                paddingVertical: 22,
                shadowColor: theme.colors.primary,
                shadowOffset: {width: 0, height: 8},
                shadowOpacity: 0.05,
                shadowRadius: 22,
                elevation: 2,
              },
            ]}>
            <MaterialIcon color={theme.colors.primary} name="content_paste" size={30} />
            <AppText style={{color: theme.colors.primary, fontSize: 14, fontWeight: '600'}}>
              Dán text
            </AppText>
          </Pressable>
        </View>

        <View style={{gap: 10}}>
          <SectionHeader
            title="Bài học gần đây"
            action={
              <Pressable
                accessibilityLabel="Xem tất cả bài học"
                accessibilityRole="button"
                onPress={() => tabNavigation?.navigate('Lessons')}
                style={{minHeight: 44, justifyContent: 'center'}}>
                <AppText style={{color: theme.colors.primary, fontWeight: '600'}}>
                  Xem tất cả
                </AppText>
              </Pressable>
            }
          />
          {emptyRecent ? (
            <View style={{alignItems: 'center', gap: theme.spacing.md, paddingVertical: 8}}>
              <Medallion label="📚" />
              <AppText color="secondary">{NO_LESSONS_MESSAGE}</AppText>
            </View>
          ) : (
            recentLessons.map((item, index) => (
              <RecentLessonRow
                key={item.id}
                index={index}
                lesson={item}
                onPress={() =>
                  navigation.navigate('SavedLessonDetail', {lessonId: item.id})
                }
              />
            ))
          )}
        </View>

        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.colors.tertiarySoft,
            borderRadius: theme.radius.lg,
            flexDirection: 'row',
            gap: 12,
            padding: 16,
          }}>
          <MaterialIcon color={theme.colors.tertiary} name="lightbulb" size={22} />
          <AppText
            style={{
              color: theme.colors.tertiary,
              flex: 1,
              fontSize: 13,
              fontWeight: '600',
            }}>
            Mẹo: chụp text rõ, đủ sáng để OCR chính xác hơn.
          </AppText>
        </View>
      </ScrollView>
    </AppScreen>
  );
}
