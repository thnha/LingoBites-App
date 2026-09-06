import React, {useCallback, useState} from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {LessonsStackParamList} from '../../../app/navigation/types';
import {AppCard} from '../../../components/AppCard';
import {AppScreen} from '../../../components/AppScreen';
import {AppText} from '../../../components/AppText';
import {ScreenHeader} from '../../../components/ScreenHeader';
import {Medallion} from '../../../components/Medallion';
import {listActivePackageLessons} from '../../../shared/db/ContentRuntimeRepository';
import type {ContentLessonListItem} from '../../../shared/db/ContentRuntimeRepository';
import {useAppTheme} from '../../../theme';

type Props = NativeStackScreenProps<LessonsStackParamList, 'ContentLessonList'>;

export function ContentLessonListScreen({navigation}: Props) {
  const {theme} = useAppTheme();
  const [lessons, setLessons] = useState<ContentLessonListItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      setLessons(listActivePackageLessons());
    }, []),
  );

  return (
    <AppScreen>
      <ScreenHeader onBack={() => navigation.goBack()} title="Bài học đóng gói" />
      <FlatList
        contentContainerStyle={{gap: theme.spacing.md, padding: theme.gutter}}
        data={lessons}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={{alignItems: 'center', gap: theme.spacing.md, paddingVertical: 32}}>
            <Medallion label="📦" />
            <AppText color="secondary" style={{textAlign: 'center'}}>
              Chưa có bài học nào được nhập vào máy.
            </AppText>
          </View>
        }
        renderItem={({item}) => (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate('ContentLessonDetail', {lessonId: item.id})
            }
            testID={`content-lesson-${item.id}`}>
            <AppCard style={{gap: theme.spacing.xs}}>
              <AppText variant="h3">{item.titleVi}</AppText>
              <AppText color="secondary">{item.blurbVi}</AppText>
              <AppText color="muted" variant="label">
                {`${item.level} · ${item.estimatedDurationMinutes} phút`}
              </AppText>
            </AppCard>
          </Pressable>
        )}
      />
    </AppScreen>
  );
}
