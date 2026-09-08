import React, {useMemo} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {TextField} from '@components/TextField';
import {Chip} from '@components/Chip';
import {MaterialIcon} from '@components/MaterialIcon';
import {useAppTheme} from '@theme';
import type {AppTheme} from '@theme/types';

export interface SearchAndFilterBarProps {
  searchQuery: string;
  sourceFilter: 'all' | 'offline' | 'image_ocr' | 'paste';
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: 'all' | 'offline' | 'image_ocr' | 'paste') => void;
}

const FILTER_OPTIONS = [
  {key: 'all' as const, label: 'Tất cả'},
  {key: 'offline' as const, label: 'Offline'},
  {key: 'image_ocr' as const, label: 'Ảnh / OCR'},
  {key: 'paste' as const, label: 'Dán văn bản'},
] as const;

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    searchContainer: {
      position: 'relative',
    },
    searchInput: {
      paddingLeft: theme.spacing.lg + theme.spacing.md,
    },
    filterRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
  });
}

export function SearchAndFilterBar({
  searchQuery,
  sourceFilter,
  onSearchChange,
  onFilterChange,
}: SearchAndFilterBarProps) {
  const {theme} = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialIcon
          name="search"
          size={24}
          color={theme.colors.text.secondary}
        />
        <TextField
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Tìm kiếm..."
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_OPTIONS.map(filter => (
          <Chip
            key={filter.key}
            label={filter.label}
            selected={sourceFilter === filter.key}
            onPress={() => onFilterChange(filter.key)}
            testID={`filter-chip-${filter.key}`}
          />
        ))}
      </ScrollView>
    </View>
  );
}
