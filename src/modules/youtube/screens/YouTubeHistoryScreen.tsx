import React, {useCallback, useState} from 'react';
import {Alert, FlatList, Pressable, StyleSheet, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {IconButton} from '@components/IconButton';
import {MaterialIcon} from '@components/MaterialIcon';
import {ScreenHeader} from '@components/ScreenHeader';
import type {CreateStackParamList} from '@/app/navigation/types';
import {useFloatingTabBarClearance} from '@/app/navigation/tabBarMetrics';
import {useAppTheme, type AppTheme} from '@theme';
import {useTranslation} from 'react-i18next';
import {
  deleteYouTubeLesson,
  listYouTubeLessons,
} from '@shared/db/YoutubeLessonRepository';
import type {YouTubeTranscript} from '@shared/schemas/youtube-transcript-v1';

type Props = NativeStackScreenProps<CreateStackParamList, 'YouTubeHistory'>;

function HistorySeparator() {
  const {theme} = useAppTheme();
  return <View style={{height: theme.spacing.sm}} />;
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    list: {
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
    row: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    rowIcon: {
      alignItems: 'center',
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: theme.radius.pill,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    rowCopy: {
      flex: 1,
      gap: 2,
      minWidth: 0,
    },
    emptyWrap: {
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.sm,
      justifyContent: 'center',
      padding: theme.gutter,
    },
    errorWrap: {
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.sm,
      justifyContent: 'center',
      padding: theme.gutter,
    },
  });
}

export function YouTubeHistoryScreen({navigation}: Props) {
  const {theme} = useAppTheme();
  const {t} = useTranslation();
  const feedClearance = useFloatingTabBarClearance();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [lessons, setLessons] = useState<YouTubeTranscript[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    try {
      setLessons(listYouTubeLessons());
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const openLesson = useCallback(
    (lessonId: string) => {
      navigation.navigate('YouTubeLesson', {lessonId});
    },
    [navigation],
  );

  const confirmDelete = useCallback(
    (lesson: YouTubeTranscript) => {
      Alert.alert(
        t('youtube.history_delete_title'),
        t('youtube.history_delete_body', {title: lesson.video.title}),
        [
          {text: t('youtube.history_delete_cancel'), style: 'cancel'},
          {
            text: t('youtube.history_delete_confirm'),
            style: 'destructive',
            onPress: () => {
              setDeleteError(null);
              const removed = deleteYouTubeLesson(lesson.video.id);
              if (!removed) {
                setDeleteError(t('youtube.history_delete_failed'));
                return;
              }
              refresh();
            },
          },
        ],
        {cancelable: true},
      );
    },
    [refresh, t],
  );

  if (loadError) {
    return (
      <AppScreen>
        <ScreenHeader
          onBack={() => navigation.goBack()}
          title={t('youtube.history_title')}
        />
        <View style={styles.errorWrap}>
          <AppText color="danger" testID="youtube-history-error">
            {t('youtube.history_load_failed')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={refresh}
            testID="youtube-history-retry"
          >
            <AppText color="primary">{t('youtube.history_retry')}</AppText>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  if (lessons.length === 0) {
    return (
      <AppScreen>
        <ScreenHeader
          onBack={() => navigation.goBack()}
          title={t('youtube.history_title')}
        />
        <View style={styles.emptyWrap} testID="youtube-history-empty">
          <AppText variant="h2">{t('youtube.history_empty_title')}</AppText>
          <AppText color="secondary">
            {t('youtube.history_empty_body')}
          </AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        title={t('youtube.history_title')}
      />
      {deleteError ? (
        <View style={{paddingHorizontal: theme.gutter}}>
          <AppText color="danger" testID="youtube-history-delete-error">
            {deleteError}
          </AppText>
        </View>
      ) : null}
      <FlatList
        contentContainerStyle={[styles.list, {paddingBottom: feedClearance}]}
        data={lessons}
        ItemSeparatorComponent={HistorySeparator}
        keyExtractor={item => item.video.id}
        renderItem={({item}) => (
          <Pressable
            accessibilityHint={t('youtube.history_open_hint')}
            accessibilityLabel={t('youtube.history_open_a11y', {
              title: item.video.title,
            })}
            accessibilityRole="button"
            onPress={() => openLesson(item.video.id)}
            style={styles.row}
            testID={`youtube-history-item-${item.video.id}`}
          >
            <View style={styles.rowIcon}>
              <MaterialIcon
                color={theme.colors.onPrimaryContainer}
                name="play_circle"
                size={24}
              />
            </View>
            <View style={styles.rowCopy}>
              <AppText numberOfLines={2} variant="h3">
                {item.video.title}
              </AppText>
              <AppText color="secondary" numberOfLines={1} variant="label">
                {t('youtube.history_meta', {
                  channel: item.video.channel_title,
                  count: item.segments.length,
                })}
              </AppText>
            </View>
            <IconButton
              accessibilityHint={t('youtube.history_delete_hint')}
              accessibilityLabel={t('youtube.history_delete_a11y', {
                title: item.video.title,
              })}
              icon="delete"
              onPress={() => confirmDelete(item)}
              testID={`youtube-history-delete-${item.video.id}`}
              tone="surface"
            />
          </Pressable>
        )}
        testID="youtube-history-list"
      />
    </AppScreen>
  );
}
