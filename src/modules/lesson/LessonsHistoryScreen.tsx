import React, {useCallback, useMemo, useState} from 'react';
import {FlatList, Pressable, ScrollView, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {LessonsStackParamList, RootTabParamList} from '../../app/navigation/types';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import {Chip} from '../../components/Chip';
import {LibraryLessonCard} from '../../components/LibraryLessonCard';
import {IconButton} from '../../components/IconButton';
import {MaterialIcon} from '../../components/MaterialIcon';
import {Medallion} from '../../components/Medallion';
import {SectionHeader} from '../../components/SectionHeader';
import {TextField} from '../../components/TextField';
import {NO_LESSONS_MESSAGE} from '../../shared/copy/userMessages';
import {
  useLibraryStore,
  type LibrarySubjectFilter,
} from '../../store/useLibraryStore';
import {useAppTheme} from '../../theme';
import type {LibraryLessonCardView} from '../../types/lesson';

type Props = NativeStackScreenProps<LessonsStackParamList, 'LessonsList'>;

const FILTER_CHIPS: Array<{key: LibrarySubjectFilter; label: string}> = [
  {key: 'all', label: 'Tất cả'},
  {key: 'grammar', label: 'Ngữ pháp'},
  {key: 'vocabulary', label: 'Từ vựng'},
  {key: 'idioms', label: 'Thành ngữ'},
];

/** Placeholder stats until progress store ships (handoff visual parity). */
const SUMMARY_PLACEHOLDER = {
  accuracy: '85%',
  streakDays: 5,
} as const;

export function LessonsHistoryScreen({navigation}: Props) {
  const {theme} = useAppTheme();
  const tabNavigation = navigation.getParent<NavigationProp<RootTabParamList>>();
  const query = useLibraryStore(state => state.query);
  const subjectFilter = useLibraryStore(state => state.subjectFilter);
  const setQuery = useLibraryStore(state => state.setQuery);
  const setSubjectFilter = useLibraryStore(state => state.setSubjectFilter);
  const [lessons, setLessons] = useState<LibraryLessonCardView[]>(() =>
    useLibraryStore.getState().getLibraryCards(),
  );

  const summary = useMemo(() => useLibraryStore.getState().getSummary(), [lessons]);

  const refresh = useCallback(() => {
    setLessons(useLibraryStore.getState().getLibraryCards());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const wordCountLabel = useMemo(() => {
    if (summary.wordCount >= 1000) {
      return `${(summary.wordCount / 1000).toFixed(1).replace('.0', '')}k`;
    }
    return String(summary.wordCount);
  }, [summary.wordCount]);

  const listEmpty = lessons.length === 0;

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
            Bài học
          </AppText>
        </View>
        <IconButton
          accessibilityLabel="Cài đặt"
          icon="settings"
          onPress={() => tabNavigation?.navigate('Profile')}
          tone="surface"
        />
      </View>

      <FlatList
        contentContainerStyle={{
          gap: 14,
          paddingBottom: 28,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        data={lessons}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          listEmpty ? (
            <View style={{alignItems: 'center', gap: theme.spacing.md, paddingVertical: 24}}>
              <Medallion label="📖" />
              <AppText color="secondary" style={{textAlign: 'center'}}>
                {query || subjectFilter !== 'all'
                  ? 'Không tìm thấy bài học phù hợp.'
                  : NO_LESSONS_MESSAGE}
              </AppText>
            </View>
          ) : null
        }
        ListFooterComponent={
          <View style={{gap: 12, marginTop: theme.spacing.sm}}>
            <SectionHeader title="Tổng kết học tập" />
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 12}}>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: theme.colors.accentSoft,
                  borderRadius: 18,
                  flexBasis: '47%',
                  flexGrow: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 16,
                }}>
                <AppText style={{color: theme.colors.primary, fontSize: 26, fontWeight: '700'}}>
                  {summary.lessonCount}
                </AppText>
                <AppText style={{color: theme.colors.primary, fontSize: 12, fontWeight: '600'}}>
                  Bài đã học
                </AppText>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: theme.colors.tertiarySoft,
                  borderRadius: 18,
                  flexBasis: '47%',
                  flexGrow: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 16,
                }}>
                <AppText style={{color: theme.colors.tertiary, fontSize: 26, fontWeight: '700'}}>
                  {wordCountLabel}
                </AppText>
                <AppText style={{color: theme.colors.tertiary, fontSize: 12, fontWeight: '600'}}>
                  Từ đã biết
                </AppText>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: theme.colors.secondarySoft,
                  borderRadius: 18,
                  flexBasis: '47%',
                  flexGrow: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 16,
                }}>
                <AppText style={{color: theme.colors.secondary, fontSize: 26, fontWeight: '700'}}>
                  {SUMMARY_PLACEHOLDER.accuracy}
                </AppText>
                <AppText style={{color: theme.colors.secondary, fontSize: 12, fontWeight: '600'}}>
                  Độ chính xác
                </AppText>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: theme.colors.accentSoft,
                  borderRadius: 18,
                  flexBasis: '47%',
                  flexGrow: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 16,
                }}>
                <AppText style={{color: theme.colors.primary, fontSize: 26, fontWeight: '700'}}>
                  {SUMMARY_PLACEHOLDER.streakDays}
                </AppText>
                <AppText style={{color: theme.colors.primary, fontSize: 12, fontWeight: '600'}}>
                  Chuỗi ngày
                </AppText>
              </View>
            </View>
          </View>
        }
        ListHeaderComponent={
          <View style={{gap: theme.spacing.md, marginBottom: 2}}>
            <View>
              <View
                pointerEvents="none"
                style={{
                  alignItems: 'center',
                  bottom: 0,
                  justifyContent: 'center',
                  left: 16,
                  position: 'absolute',
                  top: 0,
                  zIndex: 1,
                }}>
                <MaterialIcon color={theme.colors.primary} name="search" size={22} />
              </View>
              <TextField
                onChangeText={value => {
                  setQuery(value);
                  refresh();
                }}
                placeholder="Tìm bài học, chủ đề…"
                style={{
                  borderColor: theme.colors.accentSoft,
                  borderRadius: theme.radius.pill,
                  borderWidth: 2,
                  paddingLeft: 48,
                }}
                value={query}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{gap: 10, paddingBottom: 2}}>
              {FILTER_CHIPS.map(chip => (
                <Chip
                  key={chip.key}
                  label={chip.label}
                  onPress={() => {
                    setSubjectFilter(chip.key);
                    refresh();
                  }}
                  tone={subjectFilter === chip.key ? 'accent' : 'neutral'}
                />
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({item}) => (
          <LibraryLessonCard
            lesson={item}
            onPress={() =>
              navigation.navigate('SavedLessonDetail', {lessonId: item.id})
            }
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </AppScreen>
  );
}
