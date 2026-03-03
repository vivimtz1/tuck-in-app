import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Search, BookOpen, Wind as WindIcon, Volume2, Play, Heart } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { supabase } from '@/lib/supabase';

type ContentItem = {
  id: string;
  title: string;
  category: 'story' | 'breath' | 'sound';
  duration_minutes: number;
  description: string;
  thumbnail_url: string;
  popularity: number;
};

export default function ContentScreen() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'story' | 'breath' | 'sound'>('all');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredContent(content);
    } else {
      setFilteredContent(content.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, content]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .order('popularity', { ascending: false });

      if (error) throw error;
      if (data) {
        setContent(data);
        setFilteredContent(data);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'story':
        return <BookOpen color={colors.cream} size={20} />;
      case 'breath':
        return <WindIcon color={colors.blue} size={20} />;
      case 'sound':
        return <Volume2 color={colors.gold} size={20} />;
      default:
        return null;
    }
  };

  const renderContentItem = (item: ContentItem) => (
    <TouchableOpacity key={item.id} style={styles.contentItem}>
      {item.thumbnail_url ? (
        <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          {getCategoryIcon(item.category)}
        </View>
      )}
      <View style={styles.contentInfo}>
        <Text style={styles.contentTitle}>{item.title}</Text>
        <Text style={styles.contentDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.contentMeta}>
          <Text style={styles.contentDuration}>{item.duration_minutes} min</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Play color={colors.cream} size={24} fill={colors.cream} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Content Library</Text>
        <Text style={styles.subtitle}>Browse content for Teddy to play tonight</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search color={colors.textMuted} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stories, sounds, exercises..."
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.categories}>
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.categoryChipText, selectedCategory === 'all' && styles.categoryChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === 'story' && styles.categoryChipActive]}
          onPress={() => setSelectedCategory('story')}
        >
          <BookOpen color={selectedCategory === 'story' ? colors.dark : colors.cream} size={16} />
          <Text style={[styles.categoryChipText, selectedCategory === 'story' && styles.categoryChipTextActive]}>
            Stories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === 'breath' && styles.categoryChipActive]}
          onPress={() => setSelectedCategory('breath')}
        >
          <WindIcon color={selectedCategory === 'breath' ? colors.dark : colors.blue} size={16} />
          <Text style={[styles.categoryChipText, selectedCategory === 'breath' && styles.categoryChipTextActive]}>
            Breathing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === 'sound' && styles.categoryChipActive]}
          onPress={() => setSelectedCategory('sound')}
        >
          <Volume2 color={selectedCategory === 'sound' ? colors.dark : colors.gold} size={16} />
          <Text style={[styles.categoryChipText, selectedCategory === 'sound' && styles.categoryChipTextActive]}>
            Sounds
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Recently Played</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
          {filteredContent.slice(0, 3).map(item => (
            <TouchableOpacity key={item.id} style={styles.recentItem}>
              {item.thumbnail_url ? (
                <Image source={{ uri: item.thumbnail_url }} style={styles.recentThumbnail} />
              ) : (
                <View style={[styles.recentThumbnail, styles.thumbnailPlaceholder]}>
                  {getCategoryIcon(item.category)}
                </View>
              )}
              <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.recentDuration}>{item.duration_minutes} min</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>All Content</Text>
        <View style={styles.contentList}>
          {filteredContent.map(renderContentItem)}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  categories: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.cream,
  },
  categoryChipText: {
    ...typography.caption,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
  },
  categoryChipTextActive: {
    color: colors.dark,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.cream,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  recentScroll: {
    marginBottom: spacing.lg,
    paddingLeft: spacing.lg,
  },
  recentItem: {
    width: 120,
    marginRight: spacing.md,
  },
  recentThumbnail: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  recentTitle: {
    ...typography.body,
    color: colors.cream,
    marginBottom: 2,
  },
  recentDuration: {
    ...typography.small,
    color: colors.textMuted,
  },
  contentList: {
    paddingHorizontal: spacing.lg,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    marginBottom: 4,
  },
  contentDescription: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contentDuration: {
    ...typography.small,
    color: colors.textSecondary,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  categoryText: {
    ...typography.small,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
