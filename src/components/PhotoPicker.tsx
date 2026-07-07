import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing, typography } from '../theme/colors';
import { useLanguage } from '../lib/i18n/LanguageContext';

type Props = {
  photoUri: string | null;
  onChange: (uri: string | null) => void;
  onError: (message: string) => void;
};

export default function PhotoPicker({ photoUri, onChange, onError }: Props) {
  const { t } = useLanguage();

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      onError(t('errorCameraPermission'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      onError(t('errorPhotoPermission'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <View>
      <View style={styles.row}>
        <Pressable style={styles.optionRow} onPress={takePhoto}>
          <Ionicons name="camera-outline" size={20} color={colors.primary} />
          <Text style={styles.optionText}>{t('takePhoto')}</Text>
        </Pressable>
        <Pressable style={styles.optionRow} onPress={pickFromLibrary}>
          <Ionicons name="images-outline" size={20} color={colors.primary} />
          <Text style={styles.optionText}>
            {photoUri ? t('changePhoto') : t('chooseFromLibrary')}
          </Text>
        </Pressable>
      </View>

      {photoUri && (
        <View style={styles.previewWrap}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <Pressable style={styles.removeBadge} onPress={() => onChange(null)} hitSlop={8}>
            <Ionicons name="close-circle" size={26} color={colors.error} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  optionText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  previewWrap: {
    position: 'relative',
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    width: '100%',
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
  },
  removeBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: colors.white,
    borderRadius: radius.full,
  },
});