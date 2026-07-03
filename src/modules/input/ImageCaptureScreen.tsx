import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Image, Pressable, ScrollView, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../app/navigation/types';
import {AppButton} from '../../components/AppButton';
import {AppCard} from '../../components/AppCard';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import {BottomActionBar} from '../../components/BottomActionBar';
import {ErrorCard} from '../../components/ErrorCard';
import {ImagePlaceholder} from '../../components/ImagePlaceholder';
import {MaterialIcon} from '../../components/MaterialIcon';
import {ScreenHeader} from '../../components/ScreenHeader';
import {SectionHeader} from '../../components/SectionHeader';
import {
  OCR_FAILED_MESSAGE,
  PERMISSION_DENIED_MESSAGE,
} from '../../shared/copy/userMessages';
import {useAppTheme} from '../../theme';
import {extractText} from '../ocr/OCRService';
import {getImageSizeCategory, trackEvent} from '../analytics';
import {
  pickImageFromCamera,
  pickImageFromGallery,
  type PickedImage,
} from './imagePicker';

type Props = NativeStackScreenProps<HomeStackParamList, 'ImageCapture'>;

type ScreenState =
  | {type: 'upload_idle'}
  | {type: 'picking'}
  | {type: 'preview'; image: PickedImage}
  | {type: 'ocr_loading'; image: PickedImage}
  | {type: 'permission_denied'}
  | {type: 'error'; message: string; image?: PickedImage};

const RECENT_PLACEHOLDERS = ['flyer.jpg', 'menu.png', 'sign.jpg'] as const;

export function ImageCaptureScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const {sourceType} = route.params;
  const isGallery = sourceType === 'gallery';
  const [screenState, setScreenState] = useState<ScreenState>(
    isGallery ? {type: 'upload_idle'} : {type: 'picking'},
  );

  const launchPicker = useCallback(async () => {
    setScreenState({type: 'picking'});
    const result =
      sourceType === 'camera'
        ? await pickImageFromCamera()
        : await pickImageFromGallery();

    if (!result.ok) {
      if (result.reason === 'permission_denied') {
        setScreenState({type: 'permission_denied'});
        return;
      }

      if (result.reason === 'cancelled') {
        if (isGallery) {
          setScreenState({type: 'upload_idle'});
        } else {
          navigation.goBack();
        }
        return;
      }

      setScreenState({
        type: 'error',
        message: result.message ?? OCR_FAILED_MESSAGE,
      });
      return;
    }

    setScreenState({type: 'preview', image: result.image});
    trackEvent('image_selected', {
      source: sourceType,
      image_size_category: getImageSizeCategory(
        result.image.width,
        result.image.height,
      ),
      has_permission: true,
    });
  }, [isGallery, navigation, sourceType]);

  useEffect(() => {
    if (!isGallery) {
      void launchPicker();
    }
  }, [isGallery, launchPicker]);

  async function handleContinue(image: PickedImage) {
    setScreenState({type: 'ocr_loading', image});

    const result = await extractText({
      uri: image.uri,
      fileName: image.fileName,
      type: image.type,
      width: image.width,
      height: image.height,
      sourceType,
    });

    if (!result.ok) {
      setScreenState({
        type: 'error',
        message: result.message,
        image,
      });
      return;
    }

    navigation.replace('OCRReview', {
      imageUri: image.uri,
      fileName: image.fileName,
      mimeType: image.type,
      width: image.width,
      height: image.height,
      sourceType,
      extractedText: result.extractedText,
      warnings: result.warnings,
    });
  }

  function handleBack() {
    if (screenState.type === 'preview' && isGallery) {
      setScreenState({type: 'upload_idle'});
      return;
    }
    navigation.goBack();
  }

  const headerTitle = isGallery ? 'Upload ảnh' : 'Chụp ảnh';

  if (screenState.type === 'picking' || screenState.type === 'ocr_loading') {
    return (
      <AppScreen>
        <ScreenHeader onBack={() => navigation.goBack()} title={headerTitle} />
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            gap: theme.spacing.lg,
            justifyContent: 'center',
            padding: theme.spacing.xl,
          }}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <AppText color="secondary" style={{textAlign: 'center'}}>
            {screenState.type === 'ocr_loading'
              ? 'Đang nhận diện chữ trong ảnh...'
              : isGallery
                ? 'Đang mở thư viện ảnh...'
                : 'Đang mở camera...'}
          </AppText>
        </View>
      </AppScreen>
    );
  }

  if (screenState.type === 'permission_denied') {
    return (
      <AppScreen>
        <ScreenHeader onBack={() => navigation.goBack()} title={headerTitle} />
        <View
          style={{
            flex: 1,
            gap: theme.spacing.md,
            justifyContent: 'center',
            padding: theme.spacing.xl,
          }}>
          <ErrorCard message={PERMISSION_DENIED_MESSAGE} onRetry={() => void launchPicker()} />
          <AppButton
            title="Nhập text thủ công"
            variant="secondary"
            onPress={() => navigation.navigate('PasteText')}
          />
        </View>
      </AppScreen>
    );
  }

  if (screenState.type === 'error') {
    return (
      <AppScreen>
        <ScreenHeader onBack={() => navigation.goBack()} title={headerTitle} />
        <ScrollView contentContainerStyle={{gap: theme.spacing.md, padding: theme.spacing.xl}}>
          {screenState.image ? (
            <Image
              resizeMode="contain"
              source={{uri: screenState.image.uri}}
              style={{
                backgroundColor: theme.colors.surfaceMuted,
                borderRadius: theme.radius.lg,
                height: 280,
                width: '100%',
              }}
            />
          ) : null}
          <ErrorCard message={screenState.message} />
          {screenState.image ? (
            <AppButton
              title="Thử OCR lại"
              onPress={() => void handleContinue(screenState.image!)}
            />
          ) : null}
          <AppButton title="Chọn ảnh khác" variant="secondary" onPress={() => void launchPicker()} />
          <AppButton
            title="Nhập text thủ công"
            variant="secondary"
            onPress={() => navigation.navigate('PasteText')}
          />
        </ScrollView>
      </AppScreen>
    );
  }

  if (screenState.type === 'preview') {
    return (
      <AppScreen>
        <ScreenHeader onBack={handleBack} title={headerTitle} />
        <ScrollView
          contentContainerStyle={{
            gap: theme.spacing.lg,
            paddingHorizontal: theme.gutter,
            paddingTop: theme.spacing.sm,
          }}>
          <Image
            resizeMode="contain"
            source={{uri: screenState.image.uri}}
            style={{
              backgroundColor: theme.colors.surfaceMuted,
              borderRadius: theme.radius.lg,
              height: 280,
              width: '100%',
            }}
          />
          <AppButton title="Chọn ảnh khác" variant="secondary" onPress={() => void launchPicker()} />
        </ScrollView>
        <BottomActionBar
          style={{
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.outlineVariant,
            paddingBottom: theme.spacing.lg,
          }}>
          <Pressable
            accessibilityLabel="Trích xuất text"
            accessibilityRole="button"
            onPress={() => void handleContinue(screenState.image)}
            style={({pressed}) => [
              {
                alignItems: 'center',
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.lg,
                flexDirection: 'row',
                gap: 8,
                justifyContent: 'center',
                minHeight: 52,
                opacity: pressed ? theme.states.pressedOpacity : 1,
              },
            ]}>
            <MaterialIcon color={theme.colors.text.inverse} name="document_scanner" size={22} />
            <AppText style={{color: theme.colors.text.inverse, fontSize: 18, fontWeight: '600'}}>
              Trích xuất text
            </AppText>
          </Pressable>
        </BottomActionBar>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader onBack={() => navigation.goBack()} title={headerTitle} />
      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityLabel="Chọn ảnh từ thư viện"
          accessibilityRole="button"
          onPress={() => void launchPicker()}
          style={({pressed}) => [
            {
              alignItems: 'center',
              backgroundColor: theme.colors.surfaceLow,
              borderColor: theme.colors.accentSoft,
              borderRadius: theme.radius.lg,
              borderStyle: 'dashed',
              borderWidth: 2,
              gap: 10,
              opacity: pressed ? theme.states.pressedOpacity : 1,
              paddingHorizontal: 24,
              paddingVertical: 32,
            },
          ]}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.pill,
              height: 72,
              justifyContent: 'center',
              shadowColor: theme.colors.primary,
              shadowOffset: {width: 0, height: 8},
              shadowOpacity: 0.1,
              shadowRadius: 20,
              width: 72,
            }}>
            <MaterialIcon color={theme.colors.primary} name="add_photo_alternate" size={34} />
          </View>
          <AppText style={{color: theme.colors.primary, fontWeight: '600'}} variant="h3">
            Chạm để chọn ảnh
          </AppText>
          <AppText color="muted" variant="caption">
            PNG hoặc JPG
          </AppText>
        </Pressable>

        <View>
          <SectionHeader title="Ảnh gần đây" />
          <View style={{flexDirection: 'row', gap: 10}}>
            {RECENT_PLACEHOLDERS.map(label => (
              <View key={label} style={{flex: 1}}>
                <ImagePlaceholder height={96} label={label} />
              </View>
            ))}
          </View>
        </View>

        <AppCard style={{alignItems: 'flex-start', flexDirection: 'row', gap: 12}}>
          <MaterialIcon color={theme.colors.primary} name="auto_awesome" size={22} />
          <View style={{flex: 1, gap: 2}}>
            <AppText variant="label">OCR thông minh</AppText>
            <AppText color="muted" variant="caption">
              Tự phát hiện ngôn ngữ và trích các từ đáng học từ ảnh của bạn.
            </AppText>
          </View>
        </AppCard>
      </ScrollView>

      <BottomActionBar
        style={{
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.outlineVariant,
          paddingBottom: theme.spacing.lg,
        }}>
        <Pressable
          accessibilityLabel="Trích xuất text"
          accessibilityRole="button"
          onPress={() => void launchPicker()}
          style={({pressed}) => [
            {
              alignItems: 'center',
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.lg,
              flexDirection: 'row',
              gap: 8,
              justifyContent: 'center',
              minHeight: 52,
              opacity: pressed ? theme.states.pressedOpacity : 1,
            },
          ]}>
          <MaterialIcon color={theme.colors.text.inverse} name="document_scanner" size={22} />
          <AppText style={{color: theme.colors.text.inverse, fontSize: 18, fontWeight: '600'}}>
            Trích xuất text
          </AppText>
        </Pressable>
      </BottomActionBar>
    </AppScreen>
  );
}
