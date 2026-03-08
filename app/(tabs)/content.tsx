import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Wind as WindIcon,
  Volume2,
  Play,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Mic,
  Sparkles,
  ListMusic,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

type Category = 'all' | 'meditation' | 'sound' | 'story' | 'breath' | 'podcast';

type ContentItem = {
  id: string;
  title: string;
  category: Exclude<Category, 'all'>;
  duration_minutes: number;
  description: string;
  emoji: string;
  accentColor: string;
};

const CONTENT_LIBRARY: ContentItem[] = [
  // Meditations
  {
    id: 'm1', title: 'Body Scan for Sleep', category: 'meditation',
    duration_minutes: 15, emoji: '🌙', accentColor: '#8B7FD4',
    description: 'A gentle journey through your body to release tension and drift into sleep.',
  },
  {
    id: 'm2', title: 'Letting Go Meditation', category: 'meditation',
    duration_minutes: 10, emoji: '☁️', accentColor: '#8B7FD4',
    description: 'Release the worries of the day and surrender to peaceful rest.',
  },
  {
    id: 'm3', title: 'Sleep Visualization', category: 'meditation',
    duration_minutes: 20, emoji: '✨', accentColor: '#8B7FD4',
    description: 'A guided journey to a safe, tranquil place designed just for sleep.',
  },
  {
    id: 'm4', title: 'Mindful Breathing for Rest', category: 'meditation',
    duration_minutes: 12, emoji: '🍃', accentColor: '#8B7FD4',
    description: 'Anchor your attention to each breath and let sleep come naturally.',
  },

  // Sounds / White Noise
  {
    id: 's1', title: 'Rain on Window', category: 'sound',
    duration_minutes: 60, emoji: '🌧️', accentColor: '#5A9FD4',
    description: 'Soft, steady rainfall against a window pane on a quiet evening.',
  },
  {
    id: 's2', title: 'Ocean Waves', category: 'sound',
    duration_minutes: 45, emoji: '🌊', accentColor: '#5A9FD4',
    description: 'Rhythmic waves rolling onto a peaceful shore.',
  },
  {
    id: 's3', title: 'Brown Noise', category: 'sound',
    duration_minutes: 60, emoji: '〰️', accentColor: '#5A9FD4',
    description: 'Deep, warm noise that masks distractions and promotes deep sleep.',
  },
  {
    id: 's4', title: 'Forest at Night', category: 'sound',
    duration_minutes: 30, emoji: '🌲', accentColor: '#5A9FD4',
    description: 'Crickets, owls, and the gentle rustle of leaves in a night forest.',
  },
  {
    id: 's5', title: 'Crackling Fireplace', category: 'sound',
    duration_minutes: 45, emoji: '🔥', accentColor: '#5A9FD4',
    description: 'A cozy fire crackles softly while the world outside is still.',
  },
  {
    id: 's6', title: 'White Noise', category: 'sound',
    duration_minutes: 60, emoji: '📻', accentColor: '#5A9FD4',
    description: 'Classic white noise to block distractions and ease you into sleep.',
  },

  // Bedtime Stories
  {
    id: 'st1', title: 'The Sleepy Village', category: 'story',
    duration_minutes: 12, emoji: '🏘️', accentColor: '#D4AF37',
    description: 'A cozy village settles in for the night as stars appear one by one.',
  },
  {
    id: 'st2', title: 'Journey to the Stars', category: 'story',
    duration_minutes: 15, emoji: '⭐', accentColor: '#D4AF37',
    description: 'Float gently upward through the clouds and into a starlit sky.',
  },
  {
    id: 'st3', title: 'The Enchanted Garden', category: 'story',
    duration_minutes: 10, emoji: '🌸', accentColor: '#D4AF37',
    description: 'Wander through a moonlit garden where flowers glow softly.',
  },
  {
    id: 'st4', title: 'A Cozy Cabin Night', category: 'story',
    duration_minutes: 18, emoji: '🏔️', accentColor: '#D4AF37',
    description: 'Snug inside a warm cabin while soft snow falls silently outside.',
  },

  // Breathing
  {
    id: 'b1', title: '4-7-8 Breathing', category: 'breath',
    duration_minutes: 8, emoji: '💨', accentColor: '#5FB887',
    description: 'Inhale 4 counts, hold 7, exhale 8 — a natural tranquilizer for the mind.',
  },
  {
    id: 'b2', title: 'Box Breathing', category: 'breath',
    duration_minutes: 5, emoji: '⬛', accentColor: '#5FB887',
    description: 'Equal counts in, hold, out, hold — proven to calm the nervous system.',
  },
  {
    id: 'b3', title: 'Progressive Relaxation', category: 'breath',
    duration_minutes: 12, emoji: '🧘', accentColor: '#5FB887',
    description: 'Tense and release each muscle group while breathing deeply.',
  },

  // Podcasts
  {
    id: 'p1', title: 'Sleep Science Explained', category: 'podcast',
    duration_minutes: 25, emoji: '🧠', accentColor: '#E8A0A0',
    description: 'What actually happens in your brain during different sleep stages.',
  },
  {
    id: 'p2', title: 'Why We Sleep: Key Insights', category: 'podcast',
    duration_minutes: 20, emoji: '📖', accentColor: '#E8A0A0',
    description: "The most important lessons from Matthew Walker's groundbreaking research.",
  },
  {
    id: 'p3', title: 'The Power of Sleep Hygiene', category: 'podcast',
    duration_minutes: 18, emoji: '✅', accentColor: '#E8A0A0',
    description: 'Small evening routine changes that make a big difference for sleep.',
  },
  {
    id: 'p4', title: 'Stress & Sleep Connection', category: 'podcast',
    duration_minutes: 22, emoji: '🔗', accentColor: '#E8A0A0',
    description: 'How chronic stress disrupts sleep and practical ways to break the cycle.',
  },
];

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'meditation', label: 'Meditations' },
  { key: 'sound', label: 'Sounds' },
  { key: 'story', label: 'Stories' },
  { key: 'breath', label: 'Breathing' },
  { key: 'podcast', label: 'Podcasts' },
];

function getCategoryIcon(category: string, active: boolean) {
  const color = active ? colors.dark : colors.cream;
  const size = 15;
  switch (category) {
    case 'meditation': return <Sparkles color={active ? colors.dark : '#8B7FD4'} size={size} />;
    case 'sound':      return <Volume2  color={active ? colors.dark : colors.blue}  size={size} />;
    case 'story':      return <BookOpen color={active ? colors.dark : colors.gold}  size={size} />;
    case 'breath':     return <WindIcon color={active ? colors.dark : '#5FB887'} size={size} />;
    case 'podcast':    return <Mic      color={active ? colors.dark : '#E8A0A0'} size={size} />;
    default:           return null;
  }
}

export default function ContentScreen() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [queue, setQueue] = useState<ContentItem[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<ContentItem[]>([]);
  const [queueVisible, setQueueVisible] = useState(false);

  const filteredContent = useMemo(() => {
    let items = CONTENT_LIBRARY;
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      );
    }
    return items;
  }, [selectedCategory, searchQuery]);

  const addToQueue = (item: ContentItem) => {
    if (!queue.find(q => q.id === item.id)) {
      setQueue(prev => [...prev, item]);
    }
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setQueue(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    setQueue(prev => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const playItem = (item: ContentItem) => {
    setRecentlyPlayed(prev => {
      const without = prev.filter(r => r.id !== item.id);
      return [item, ...without].slice(0, 10);
    });
  };

  const isQueued = (id: string) => queue.some(q => q.id === id);

  const renderContentItem = (item: ContentItem) => (
    <View key={item.id} style={styles.contentItem}>
      <View style={[styles.emojiBox, { backgroundColor: item.accentColor + '22' }]}>
        <Text style={styles.emojiText}>{item.emoji}</Text>
      </View>
      <View style={styles.contentInfo}>
        <Text style={styles.contentTitle}>{item.title}</Text>
        <Text style={styles.contentDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.contentMeta}>
          <Text style={styles.contentDuration}>{item.duration_minutes} min</Text>
          <View style={[styles.categoryBadge, { backgroundColor: item.accentColor + '33' }]}>
            <Text style={[styles.categoryText, { color: item.accentColor }]}>
              {item.category}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => playItem(item)}
        >
          <Play color={colors.cream} size={16} fill={colors.cream} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addButton, isQueued(item.id) && styles.addButtonActive]}
          onPress={() => isQueued(item.id) ? removeFromQueue(item.id) : addToQueue(item)}
        >
          {isQueued(item.id)
            ? <X color={colors.cream} size={14} />
            : <Plus color={colors.cream} size={14} />
          }
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Content Library</Text>
          <Text style={styles.subtitle}>Browse content for Teddy to play tonight</Text>
        </View>
        <TouchableOpacity
          style={styles.queueButton}
          onPress={() => setQueueVisible(true)}
        >
          <ListMusic color={colors.cream} size={20} />
          {queue.length > 0 && (
            <View style={styles.queueBadge}>
              <Text style={styles.queueBadgeText}>{queue.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search color={colors.textMuted} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search meditations, sounds, podcasts..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X color={colors.textMuted} size={16} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips — horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map(cat => {
          const active = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryChip, active && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              {cat.key !== 'all' && getCategoryIcon(cat.key, active)}
              <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main scroll */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recently Played</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recentScroll}
              contentContainerStyle={{ paddingLeft: spacing.lg }}
            >
              {recentlyPlayed.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentItem}
                  onPress={() => playItem(item)}
                >
                  <View style={[styles.recentThumbnail, { backgroundColor: item.accentColor + '33' }]}>
                    <Text style={styles.recentEmoji}>{item.emoji}</Text>
                  </View>
                  <Text style={styles.recentTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.recentDuration}>{item.duration_minutes} min</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Content list */}
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'all'
            ? 'All Content'
            : CATEGORIES.find(c => c.key === selectedCategory)?.label}
        </Text>

        {filteredContent.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        ) : (
          <View style={styles.contentList}>
            {filteredContent.map(renderContentItem)}
          </View>
        )}

        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>

      {/* Queue Modal */}
      <Modal
        visible={queueVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setQueueVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setQueueVisible(false)}
        />
        <View style={styles.queueSheet}>
          <View style={styles.queueHandle} />
          <View style={styles.queueHeader}>
            <Text style={styles.queueTitle}>Tonight's Queue</Text>
            <View style={styles.queueHeaderActions}>
              {queue.length > 0 && (
                <TouchableOpacity onPress={() => setQueue([])}>
                  <Text style={styles.clearAll}>Clear all</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setQueueVisible(false)}>
                <X color={colors.textMuted} size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {queue.length === 0 ? (
            <View style={styles.emptyQueue}>
              <ListMusic color={colors.textMuted} size={40} />
              <Text style={styles.emptyQueueText}>Your queue is empty</Text>
              <Text style={styles.emptyQueueSubtext}>
                Tap the + on any item to add it to tonight's session
              </Text>
            </View>
          ) : (
            <FlatList
              data={queue}
              keyExtractor={item => item.id}
              style={styles.queueList}
              renderItem={({ item, index }) => (
                <View style={styles.queueItem}>
                  <View style={[styles.queueEmoji, { backgroundColor: item.accentColor + '22' }]}>
                    <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                  </View>
                  <View style={styles.queueItemInfo}>
                    <Text style={styles.queueItemTitle}>{item.title}</Text>
                    <Text style={styles.queueItemDuration}>{item.duration_minutes} min</Text>
                  </View>
                  <View style={styles.queueItemControls}>
                    <TouchableOpacity
                      style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]}
                      onPress={() => moveUp(index)}
                      disabled={index === 0}
                    >
                      <ChevronUp color={index === 0 ? colors.border : colors.textMuted} size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reorderBtn, index === queue.length - 1 && styles.reorderBtnDisabled]}
                      onPress={() => moveDown(index)}
                      disabled={index === queue.length - 1}
                    >
                      <ChevronDown color={index === queue.length - 1 ? colors.border : colors.textMuted} size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeFromQueue(item.id)}
                    >
                      <X color={colors.error} size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  queueButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  queueBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueBadgeText: {
    fontSize: 10,
    fontFamily: 'Fredoka-Medium',
    color: colors.dark,
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  categoriesScroll: {
    marginBottom: spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
    paddingRight: spacing.lg,
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
    borderColor: colors.cream,
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
  },
  recentItem: {
    width: 110,
    marginRight: spacing.md,
  },
  recentThumbnail: {
    width: 110,
    height: 110,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentEmoji: {
    fontSize: 36,
  },
  recentTitle: {
    ...typography.small,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
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
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiBox: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emojiText: {
    fontSize: 26,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    marginBottom: 2,
  },
  contentDescription: {
    ...typography.small,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    lineHeight: 16,
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
  },
  categoryText: {
    ...typography.small,
    textTransform: 'capitalize',
    fontFamily: 'Fredoka-Medium',
  },
  itemActions: {
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButtonActive: {
    backgroundColor: colors.error + '44',
    borderColor: colors.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },

  // Modal / Queue Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  queueSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.xl,
  },
  queueHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  queueTitle: {
    ...typography.h3,
    color: colors.cream,
  },
  queueHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  clearAll: {
    ...typography.caption,
    color: colors.error,
    fontFamily: 'Fredoka-Medium',
  },
  emptyQueue: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  emptyQueueText: {
    ...typography.h3,
    color: colors.textMuted,
  },
  emptyQueueSubtext: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  queueList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  queueEmoji: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueItemInfo: {
    flex: 1,
  },
  queueItemTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
  },
  queueItemDuration: {
    ...typography.small,
    color: colors.textMuted,
  },
  queueItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reorderBtn: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderBtnDisabled: {
    opacity: 0.3,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.error + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
