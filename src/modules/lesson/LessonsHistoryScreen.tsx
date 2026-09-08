import type {NavigationProp} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type {
  LessonsStackParamList,
  RootTabParamList,
} from '../../app/navigation/types';
import {AppButton} from '../../components/AppButton';
import {AppCard} from '../../components/AppCard';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import {Chip} from '../../components/Chip';
import {IconButton} from '../../components/IconButton';
import {LibraryLessonCard} from '../../components/LibraryLessonCard';
import {MaterialIcon} from '../../components/MaterialIcon';
import {Medallion} from '../../components/Medallion';
import {SectionHeader} from '../../components/SectionHeader';
import {TextField} from '../../components/TextField';
import {useTranslation} from 'react-i18next';
import type {LibrarySubjectFilter} from '../../store/useLibraryStore';
import {
  useContentLibrary,
  type ContentLessonListItem,
} from '../content';
import {useAppTheme, type AppTheme} from '../../theme';
import {bootstrapContentPackage} from '../content/bootstrap';
import {useLessonLibrary} from './useLessonLibrary';

type Props = NativeStackScreenProps<LessonsStackParamList, 'LessonsList'>;

const FILTER_CHIPS: Array<{key: LibrarySubjectFilter; label: string}> = [
  {key: 'all', label: 'Tất cả'},
  {key: 'grammar', label: 'Ngữ pháp'},
  {key: 'vocabulary', label: 'Từ vựng'},
  {key: 'idioms', label: 'Thành ngữ'},
];

export function LessonsHistoryScreen({navigation}: Props) {
  const {theme} = useAppTheme();
  const {t} = useTranslation();
  const themedStyles = useMemo(() => makeStyles(theme), [theme]);
  const tabNavigation =
    navigation.getParent<NavigationProp<RootTabParamList>>();
  const {
    query,
    subjectFilter,
    setQuery,
    setSubjectFilter,
    userLessons,
    summary,
    refresh,
  } = useLessonLibrary();
  const {listActivePackageLessons} = useContentLibrary();

  const [packagedLessons, setPackagedLessons] = useState<
    ContentLessonListItem[]
  >([]);
  const [bootstrapState, setBootstrapState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const runBootstrap = useCallback(async () => {
    setBootstrapState('loading');
    setBootstrapError(null);
    try {
      const res = await bootstrapContentPackage();
      const activeLessons = listActivePackageLessons();
      if (res.ok || activeLessons.length > 0) {
        setPackagedLessons(activeLessons);
        setBootstrapState('success');
      } else {
        setBootstrapState('error');
        setBootstrapError(
          res.error.message || 'Không thể chuẩn bị nội dung bài học.',
        );
      }
    } catch (e) {
      const activeLessons = listActivePackageLessons();
      if (activeLessons.length > 0) {
        setPackagedLessons(activeLessons);
        setBootstrapState('success');
      } else {
        setBootstrapState('error');
        setBootstrapError(
          (e as Error).message ||
            'Gói bài học chưa thể chuẩn bị. Vui lòng thử lại.',
        );
      }
    }
  }, [listActivePackageLessons]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      runBootstrap();
    }, [refresh, runBootstrap]),
  );

  const wordCountLabel = useMemo(() => {
    if (summary.wordCount >= 1000) {
      return `${(summary.wordCount / 1000).toFixed(1).replace('.0', '')}k`;
    }
    return String(summary.wordCount);
  }, [summary.wordCount]);

  const filteredPackagedLessons = useMemo(() => {
    if (!query.trim()) {
      return packagedLessons;
    }
    const q = query.toLowerCase();
    return packagedLessons.filter(
      item =>
        item.titleVi.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.blurbVi.toLowerCase().includes(q),
    );
  }, [packagedLessons, query]);

  const hasAnyLessons = userLessons.length > 0 || packagedLessons.length > 0;

  return (
    <AppScreen>
      <View style={themedStyles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialIcon
            color={theme.colors.primary}
            name="translate"
            size={26}
          />
          <AppText numberOfLines={1} style={themedStyles.headerTitle}>
            Bài học
          </AppText>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            accessibilityLabel="Bài học đóng gói"
            icon="school"
            onPress={() => navigation.navigate('ContentLessonList')}
            tone="surface"
          />
          <IconButton
            accessibilityLabel="Cài đặt"
            icon="settings"
            onPress={() => tabNavigation?.navigate('Profile')}
            tone="surface"
          />
        </View>
      </View>

      <FlatList
        contentContainerStyle={themedStyles.listContent}
        data={userLessons}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          !hasAnyLessons &&
          bootstrapState !== 'loading' &&
          bootstrapState !== 'error' ? (
            <View style={themedStyles.emptyState}>
              <Medallion label="📖" />
              <AppText color="secondary" style={styles.centerText}>
                {query || subjectFilter !== 'all'
                  ? 'Không tìm thấy bài học phù hợp.'
                  : t('lesson.no_lessons')}
              </AppText>
            </View>
          ) : null
        }
        ListFooterComponent={
          <View style={themedStyles.footer}>
            <SectionHeader title="Tổng kết học tập" />
            <View style={styles.summaryGrid}>
              <View
                style={[
                  themedStyles.summaryCard,
                  themedStyles.summaryCardAccent,
                ]}
              >
                <AppText style={themedStyles.summaryValuePrimary}>
                  {summary.lessonCount}
                </AppText>
                <AppText style={themedStyles.summaryLabelPrimary}>
                  Bài đã học
                </AppText>
              </View>
              <View
                style={[
                  themedStyles.summaryCard,
                  themedStyles.summaryCardTertiary,
                ]}
              >
                <AppText style={themedStyles.summaryValueTertiary}>
                  {wordCountLabel}
                </AppText>
                <AppText style={themedStyles.summaryLabelTertiary}>
                  Từ đã biết
                </AppText>
              </View>
              <View
                style={[
                  themedStyles.summaryCard,
                  themedStyles.summaryCardSecondary,
                ]}
              >
                <AppText
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={themedStyles.summaryEmptyValueSecondary}
                >
                  {summary.accuracyLabel}
                </AppText>
                <AppText style={themedStyles.summaryLabelSecondary}>
                  Độ chính xác
                </AppText>
              </View>
              <View
                style={[
                  themedStyles.summaryCard,
                  themedStyles.summaryCardAccent,
                ]}
              >
                <AppText
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={
                    summary.currentStreak > 0
                      ? themedStyles.summaryValuePrimary
                      : themedStyles.summaryEmptyValuePrimary
                  }
                >
                  {summary.currentStreak > 0
                    ? summary.currentStreak
                    : 'Chưa có dữ liệu'}
                </AppText>
                <AppText style={themedStyles.summaryLabelPrimary}>
                  Chuỗi ngày
                </AppText>
              </View>
            </View>
          </View>
        }
        ListHeaderComponent={
          <View style={themedStyles.listHeader}>
            <View>
              <View pointerEvents="none" style={styles.searchIcon}>
                <MaterialIcon
                  color={theme.colors.primary}
                  name="search"
                  size={22}
                />
              </View>
              <TextField
                onChangeText={value => {
                  setQuery(value);
                }}
                placeholder="Tìm bài học, chủ đề…"
                style={themedStyles.searchField}
                value={query}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
            >
              {FILTER_CHIPS.map(chip => (
                <Chip
                  key={chip.key}
                  label={chip.label}
                  onPress={() => setSubjectFilter(chip.key)}
                  tone={subjectFilter === chip.key ? 'accent' : 'neutral'}
                />
              ))}
            </ScrollView>

            {bootstrapState === 'loading' && packagedLessons.length === 0 && (
              <AppCard
                testID="content-bootstrap-loading-card"
                style={themedStyles.bootstrapCard}
              >
                <ActivityIndicator
                  color={theme.colors.primary}
                  size="large"
                  testID="content-bootstrap-loading"
                />
                <AppText variant="h3">Đang chuẩn bị gói bài học…</AppText>
                <AppText color="secondary" style={styles.centerText}>
                  Hệ thống đang khởi tạo 16 bài học đóng gói offline.
                </AppText>
              </AppCard>
            )}

            {bootstrapState === 'error' && packagedLessons.length === 0 && (
              <AppCard
                testID="content-bootstrap-error-card"
                style={themedStyles.bootstrapErrorCard}
              >
                <Medallion label="⚠️" />
                <AppText variant="h3">
                  Không thể chuẩn bị nội dung bài học
                </AppText>
                <AppText color="secondary" style={styles.centerText}>
                  {bootstrapError ??
                    'Gói bài học chưa thể chuẩn bị. Vui lòng thử lại.'}
                </AppText>
                <AppButton
                  accessibilityLabel="Thử lại"
                  onPress={runBootstrap}
                  testID="content-bootstrap-retry"
                  title="Thử lại"
                />
              </AppCard>
            )}

            {filteredPackagedLessons.length > 0 && (
              <View style={themedStyles.packagedSection}>
                <SectionHeader title="Bài học theo lộ trình (MVP)" />
                {filteredPackagedLessons.map(item => (
                  <Pressable
                    accessibilityRole="button"
                    key={item.id}
                    onPress={() =>
                      navigation.navigate('ContentLessonDetail', {
                        lessonId: item.id,
                      })
                    }
                    testID={`packaged-lesson-${item.id}`}
                  >
                    <AppCard style={themedStyles.packagedCard}>
                      <View style={styles.packagedCardHeader}>
                        <AppText style={styles.flexOne} variant="h3">
                          {item.titleVi}
                        </AppText>
                        <Chip label={item.level} tone="accent" />
                      </View>
                      <AppText color="secondary">{item.blurbVi}</AppText>
                      <AppText color="muted" variant="label">
                        {`${item.titleEn} · ${item.estimatedDurationMinutes} phút`}
                      </AppText>
                    </AppCard>
                  </Pressable>
                ))}
              </View>
            )}

            {userLessons.length > 0 && (
              <View style={themedStyles.userLessonsSection}>
                <SectionHeader title="Bài học cá nhân / Đã lưu" />
              </View>
            )}
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

const styles = StyleSheet.create({
  centerText: {
    textAlign: 'center',
  },
  filterContent: {
    gap: 10,
    paddingBottom: 2,
  },
  flexOne: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  packagedCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchIcon: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 16,
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    bootstrapCard: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xl,
    },
    bootstrapErrorCard: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: 20,
    },
    emptyState: {
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.xl,
    },
    footer: {
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      height: 56,
      justifyContent: 'space-between',
      paddingHorizontal: theme.gutter,
    },
    headerTitle: {
      color: theme.colors.primary,
      fontSize: theme.typography.size.lg,
      fontWeight: theme.typography.weight.medium,
    },
    listContent: {
      gap: 14,
      paddingBottom: 28,
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
    listHeader: {
      gap: theme.spacing.md,
      marginBottom: 2,
    },
    packagedCard: {
      gap: theme.spacing.xs,
    },
    packagedSection: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    searchField: {
      borderColor: theme.colors.accentSoft,
      borderRadius: theme.radius.pill,
      borderWidth: 2,
      paddingLeft: 48,
    },
    summaryCard: {
      alignItems: 'center',
      borderRadius: 18,
      flexBasis: '47%',
      flexGrow: 1,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
    },
    summaryCardAccent: {
      backgroundColor: theme.colors.accentSoft,
    },
    summaryCardSecondary: {
      backgroundColor: theme.colors.secondarySoft,
    },
    summaryCardTertiary: {
      backgroundColor: theme.colors.tertiarySoft,
    },
    summaryEmptyValuePrimary: {
      color: theme.colors.primary,
      fontSize: theme.typography.size.md,
      fontWeight: '700',
    },
    summaryEmptyValueSecondary: {
      color: theme.colors.secondary,
      fontSize: theme.typography.size.md,
      fontWeight: '700',
    },
    summaryLabelPrimary: {
      color: theme.colors.primary,
      fontSize: theme.typography.size.xs,
      fontWeight: theme.typography.weight.medium,
    },
    summaryLabelSecondary: {
      color: theme.colors.secondary,
      fontSize: theme.typography.size.xs,
      fontWeight: theme.typography.weight.medium,
    },
    summaryLabelTertiary: {
      color: theme.colors.tertiary,
      fontSize: theme.typography.size.xs,
      fontWeight: theme.typography.weight.medium,
    },
    summaryValuePrimary: {
      color: theme.colors.primary,
      fontSize: 26,
      fontWeight: '700',
    },
    summaryValueTertiary: {
      color: theme.colors.tertiary,
      fontSize: 26,
      fontWeight: '700',
    },
    userLessonsSection: {
      marginTop: theme.spacing.xs,
    },
  });
}
