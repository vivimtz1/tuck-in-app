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
import { useState, useMemo, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import {
  Search,
  BookOpen,
  Wind as WindIcon,
  Volume2,
  Play,
  Pause,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Mic,
  Sparkles,
  ListMusic,
  SkipForward,
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
  audioUrl: string;
};

// Audio tracks — swap these for real ambient/meditation files
const AUDIO = {
  ambient1: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  ambient2: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  ambient3: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  ambient4: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  ambient5: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
};

const CONTENT_LIBRARY: ContentItem[] = [
  // Meditations
  {
    id: 'm1', title: 'Body Scan for Sleep', category: 'meditation',
    duration_minutes: 15, emoji: '🌙', accentColor: '#8B7FD4',
    description: 'A gentle journey through your body to release tension and drift into sleep.',
    audioUrl: AUDIO.ambient1,
  },
  {
    id: 'm2', title: 'Letting Go Meditation', category: 'meditation',
    duration_minutes: 10, emoji: '☁️', accentColor: '#8B7FD4',
    description: 'Release the worries of the day and surrender to peaceful rest.',
    audioUrl: AUDIO.ambient1,
  },
  {
    id: 'm3', title: 'Sleep Visualization', category: 'meditation',
    duration_minutes: 20, emoji: '✨', accentColor: '#8B7FD4',
    description: 'A guided journey to a safe, tranquil place designed just for sleep.',
    audioUrl: AUDIO.ambient2,
  },
  {
    id: 'm4', title: 'Mindful Breathing for Rest', category: 'meditation',
    duration_minutes: 12, emoji: '🍃', accentColor: '#8B7FD4',
    description: 'Anchor your attention to each breath and let sleep come naturally.',
    audioUrl: AUDIO.ambient2,
  },

  // Sounds / White Noise
  {
    id: 's1', title: 'Rain on Window', category: 'sound',
    duration_minutes: 60, emoji: '🌧️', accentColor: '#5A9FD4',
    description: 'Soft, steady rainfall against a window pane on a quiet evening.',
    audioUrl: AUDIO.ambient3,
  },
  {
    id: 's2', title: 'Ocean Waves', category: 'sound',
    duration_minutes: 45, emoji: '🌊', accentColor: '#5A9FD4',
    description: 'Rhythmic waves rolling onto a peaceful shore.',
    audioUrl: AUDIO.ambient3,
  },
  {
    id: 's3', title: 'Brown Noise', category: 'sound',
    duration_minutes: 60, emoji: '〰️', accentColor: '#5A9FD4',
    description: 'Deep, warm noise that masks distractions and promotes deep sleep.',
    audioUrl: AUDIO.ambient4,
  },
  {
    id: 's4', title: 'Forest at Night', category: 'sound',
    duration_minutes: 30, emoji: '🌲', accentColor: '#5A9FD4',
    description: 'Crickets, owls, and the gentle rustle of leaves in a night forest.',
    audioUrl: AUDIO.ambient4,
  },
  {
    id: 's5', title: 'Crackling Fireplace', category: 'sound',
    duration_minutes: 45, emoji: '🔥', accentColor: '#5A9FD4',
    description: 'A cozy fire crackles softly while the world outside is still.',
    audioUrl: AUDIO.ambient5,
  },
  {
    id: 's6', title: 'White Noise', category: 'sound',
    duration_minutes: 60, emoji: '📻', accentColor: '#5A9FD4',
    description: 'Classic white noise to block distractions and ease you into sleep.',
    audioUrl: AUDIO.ambient5,
  },

  // Bedtime Stories
  {
    id: 'st1', title: 'The Sleepy Village', category: 'story',
    duration_minutes: 12, emoji: '🏘️', accentColor: '#D4AF37',
    description: 'A cozy village settles in for the night as stars appear one by one.',
    audioUrl: AUDIO.ambient2,
  },
  {
    id: 'st2', title: 'Journey to the Stars', category: 'story',
    duration_minutes: 15, emoji: '⭐', accentColor: '#D4AF37',
    description: 'Float gently upward through the clouds and into a starlit sky.',
    audioUrl: AUDIO.ambient1,
  },
  {
    id: 'st3', title: 'The Enchanted Garden', category: 'story',
    duration_minutes: 10, emoji: '🌸', accentColor: '#D4AF37',
    description: 'Wander through a moonlit garden where flowers glow softly.',
    audioUrl: AUDIO.ambient3,
  },
  {
    id: 'st4', title: 'A Cozy Cabin Night', category: 'story',
    duration_minutes: 18, emoji: '🏔️', accentColor: '#D4AF37',
    description: 'Snug inside a warm cabin while soft snow falls silently outside.',
    audioUrl: AUDIO.ambient4,
  },

  // Breathing
  {
    id: 'b1', title: '4-7-8 Breathing', category: 'breath',
    duration_minutes: 8, emoji: '💨', accentColor: '#5FB887',
    description: 'Inhale 4 counts, hold 7, exhale 8 — a natural tranquilizer for the mind.',
    audioUrl: AUDIO.ambient1,
  },
  {
    id: 'b2', title: 'Box Breathing', category: 'breath',
    duration_minutes: 5, emoji: '⬛', accentColor: '#5FB887',
    description: 'Equal counts in, hold, out, hold — proven to calm the nervous system.',
    audioUrl: AUDIO.ambient2,
  },
  {
    id: 'b3', title: 'Progressive Relaxation', category: 'breath',
    duration_minutes: 12, emoji: '🧘', accentColor: '#5FB887',
    description: 'Tense and release each muscle group while breathing deeply.',
    audioUrl: AUDIO.ambient3,
  },

  // Podcasts
  {
    id: 'p1', title: 'Sleep Science Explained', category: 'podcast',
    duration_minutes: 25, emoji: '🧠', accentColor: '#E8A0A0',
    description: 'What actually happens in your brain during different sleep stages.',
    audioUrl: AUDIO.ambient5,
  },
  {
    id: 'p2', title: 'Why We Sleep: Key Insights', category: 'podcast',
    duration_minutes: 20, emoji: '📖', accentColor: '#E8A0A0',
    description: "The most important lessons from Matthew Walker's groundbreaking research.",
    audioUrl: AUDIO.ambient4,
  },
  {
    id: 'p3', title: 'The Power of Sleep Hygiene', category: 'podcast',
    duration_minutes: 18, emoji: '✅', accentColor: '#E8A0A0',
    description: 'Small evening routine changes that make a big difference for sleep.',
    audioUrl: AUDIO.ambient3,
  },
  {
    id: 'p4', title: 'Stress & Sleep Connection', category: 'podcast',
    duration_minutes: 22, emoji: '🔗', accentColor: '#E8A0A0',
    description: 'How chronic stress disrupts sleep and practical ways to break the cycle.',
    audioUrl: AUDIO.ambient5,
  },
];

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'meditation', label: 'Meditations' },
  { key: 'sound',     label: 'Sounds' },
  { key: 'story',     label: 'Stories' },
  { key: 'breath',    label: 'Breathing' },
  { key: 'podcast',   label: 'Podcasts' },
];

function CategoryIcon({ category, active }: { category: string; active: boolean }) {
  const size = 14;
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
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);

  // Configure audio mode on mount
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  // Queue ref so callbacks always see latest queue state
  const queueRef = useRef<ContentItem[]>([]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  const currentItemRef = useRef<ContentItem | null>(null);
  useEffect(() => { currentItemRef.current = currentItem; }, [currentItem]);

  const stopCurrent = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setCurrentItem(null);
    setIsPlaying(false);
  };

  const playItem = async (item: ContentItem) => {
    setIsLoading(true);
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: item.audioUrl },
        { shouldPlay: true },
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          // Auto-advance to next item in queue
          const q = queueRef.current;
          const cur = currentItemRef.current;
          const idx = q.findIndex(i => i.id === cur?.id);
          const nextItem = idx !== -1 && idx < q.length - 1 ? q[idx + 1] : null;
          // Remove finished item from queue
          if (cur) setQueue(prev => prev.filter(i => i.id !== cur.id));
          if (nextItem) {
            playItem(nextItem);
          } else {
            setCurrentItem(null);
            setIsPlaying(false);
          }
        }
      });
      setCurrentItem(item);
      setIsPlaying(true);
      setRecentlyPlayed(prev => {
        const without = prev.filter(r => r.id !== item.id);
        return [item, ...without].slice(0, 10);
      });
    } catch (e) {
      console.error('Audio load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = async (item: ContentItem) => {
    if (currentItem?.id === item.id) {
      if (isPlaying) {
        await soundRef.current?.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current?.playAsync();
        setIsPlaying(true);
      }
      return;
    }
    await playItem(item);
  };

  const handleSkipNext = async () => {
    const idx = queue.findIndex(i => i.id === currentItem?.id);
    if (idx !== -1 && idx < queue.length - 1) {
      const skipped = currentItem;
      const next = queue[idx + 1];
      if (skipped) setQueue(prev => prev.filter(i => i.id !== skipped.id));
      await playItem(next);
    }
  };

  const handlePlayQueue = async () => {
    if (queue.length === 0) return;
    setQueueVisible(false);
    await playItem(queue[0]);
  };

  const toggleMiniPlayer = async () => {
    if (isPlaying) {
      await soundRef.current?.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current?.playAsync();
      setIsPlaying(true);
    }
  };

  const queueIndex = queue.findIndex(i => i.id === currentItem?.id);
  const hasNextInQueue = queueIndex !== -1 && queueIndex < queue.length - 1;

  const addToQueue = (item: ContentItem) => {
    if (!queue.find(q => q.id === item.id)) setQueue(prev => [...prev, item]);
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

  const isQueued = (id: string) => queue.some(q => q.id === id);

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

  const renderContentItem = (item: ContentItem) => {
    const playing = currentItem?.id === item.id && isPlaying;
    return (
      <View key={item.id} style={[styles.contentItem, currentItem?.id === item.id && styles.contentItemActive]}>
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
            style={[styles.playButton, playing && styles.playButtonActive]}
            onPress={() => handlePlay(item)}
            disabled={isLoading && currentItem?.id !== item.id}
          >
            {playing
              ? <Pause color={colors.cream} size={16} fill={colors.cream} />
              : <Play  color={colors.cream} size={16} fill={colors.cream} />
            }
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, isQueued(item.id) && styles.addButtonActive]}
            onPress={() => isQueued(item.id) ? removeFromQueue(item.id) : addToQueue(item)}
          >
            {isQueued(item.id)
              ? <X    color={colors.error} size={13} />
              : <Plus color={colors.textMuted} size={13} />
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Content Library</Text>
          <Text style={styles.subtitle}>Browse content for Teddy to play tonight</Text>
        </View>
        <TouchableOpacity style={styles.queueButton} onPress={() => setQueueVisible(true)}>
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
        <Search color={colors.textMuted} size={18} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search meditations, sounds, podcasts..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X color={colors.textMuted} size={15} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips — horizontal scroll, compact height */}
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
              {cat.key !== 'all' && <CategoryIcon category={cat.key} active={active} />}
              <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main scroll */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: currentItem ? 90 : 0 }}
      >
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
                <TouchableOpacity key={item.id} style={styles.recentItem} onPress={() => handlePlay(item)}>
                  <View style={[styles.recentThumbnail, { backgroundColor: item.accentColor + '33' }]}>
                    <Text style={styles.recentEmoji}>{item.emoji}</Text>
                    {currentItem?.id === item.id && isPlaying && (
                      <View style={styles.recentPlayingDot} />
                    )}
                  </View>
                  <Text style={styles.recentTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.recentDuration}>{item.duration_minutes} min</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Content List */}
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
      </ScrollView>

      {/* Mini Player */}
      {currentItem && (
        <View style={styles.miniPlayer}>
          <View style={[styles.miniPlayerEmoji, { backgroundColor: currentItem.accentColor + '33' }]}>
            <Text style={{ fontSize: 20 }}>{currentItem.emoji}</Text>
          </View>
          <View style={styles.miniPlayerInfo}>
            <Text style={styles.miniPlayerTitle} numberOfLines={1}>{currentItem.title}</Text>
            <Text style={styles.miniPlayerSub}>
              {queueIndex !== -1
                ? `${queueIndex + 1} of ${queue.length} · ${currentItem.category}`
                : `${currentItem.duration_minutes} min · ${currentItem.category}`}
            </Text>
          </View>
          <TouchableOpacity style={styles.miniPlayerBtn} onPress={toggleMiniPlayer}>
            {isPlaying
              ? <Pause color={colors.cream} size={18} fill={colors.cream} />
              : <Play  color={colors.cream} size={18} fill={colors.cream} />
            }
          </TouchableOpacity>
          {hasNextInQueue && (
            <TouchableOpacity style={styles.miniPlayerSkip} onPress={handleSkipNext}>
              <SkipForward color={colors.cream} size={18} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.miniPlayerClose} onPress={stopCurrent}>
            <X color={colors.textMuted} size={18} />
          </TouchableOpacity>
        </View>
      )}

      {/* Queue Modal */}
      <Modal visible={queueVisible} transparent animationType="slide" onRequestClose={() => setQueueVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setQueueVisible(false)} />
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
                Tap + on any item to add it to tonight's session
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.playQueueBtn} onPress={handlePlayQueue}>
                <Play color={colors.dark} size={16} fill={colors.dark} />
                <Text style={styles.playQueueBtnText}>
                  {currentItem && queueIndex !== -1 ? 'Restart Queue' : 'Play Queue'}
                </Text>
              </TouchableOpacity>
              <FlatList
                data={queue}
                keyExtractor={item => item.id}
                style={styles.queueList}
                renderItem={({ item, index }) => {
                  const isNowPlaying = currentItem?.id === item.id;
                  return (
                    <TouchableOpacity
                      style={[styles.queueItem, isNowPlaying && styles.queueItemPlaying]}
                      onPress={() => { playItem(item); setQueueVisible(false); }}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.queueEmoji, { backgroundColor: item.accentColor + '22' }]}>
                        <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                        {isNowPlaying && isPlaying && (
                          <View style={styles.queuePlayingDot} />
                        )}
                      </View>
                      <View style={styles.queueItemInfo}>
                        <Text style={[styles.queueItemTitle, isNowPlaying && styles.queueItemTitlePlaying]}>
                          {item.title}
                        </Text>
                        <Text style={styles.queueItemDuration}>
                          {isNowPlaying ? (isPlaying ? '▶ Now Playing' : '⏸ Paused') : `${item.duration_minutes} min`}
                        </Text>
                      </View>
                      <View style={styles.queueItemControls}>
                        <TouchableOpacity
                          style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]}
                          onPress={(e) => { e.stopPropagation?.(); moveUp(index); }}
                          disabled={index === 0}
                        >
                          <ChevronUp color={colors.textMuted} size={15} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.reorderBtn, index === queue.length - 1 && styles.reorderBtnDisabled]}
                          onPress={(e) => { e.stopPropagation?.(); moveDown(index); }}
                          disabled={index === queue.length - 1}
                        >
                          <ChevronDown color={colors.textMuted} size={15} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.removeBtn} onPress={(e) => { e.stopPropagation?.(); removeFromQueue(item.id); }}>
                          <X color={colors.error} size={15} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.cream,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  queueButton: {
    width: 42,
    height: 42,
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
    top: -5,
    right: -5,
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
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
  // Category chips — compact height
  categoriesScroll: {
    marginBottom: spacing.md,
    flexGrow: 0,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
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
    fontSize: 13,
    fontFamily: 'Fredoka-Medium',
    color: colors.cream,
    lineHeight: 18,
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
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  recentScroll: {
    marginBottom: spacing.md,
  },
  recentItem: {
    width: 100,
    marginRight: spacing.md,
  },
  recentThumbnail: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentEmoji: {
    fontSize: 32,
  },
  recentPlayingDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  recentTitle: {
    fontSize: 12,
    fontFamily: 'Fredoka-Medium',
    color: colors.cream,
    marginBottom: 2,
    lineHeight: 16,
  },
  recentDuration: {
    fontSize: 11,
    fontFamily: 'Fredoka-Regular',
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
  contentItemActive: {
    borderColor: colors.gold + '88',
    backgroundColor: colors.cardBg,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emojiText: {
    fontSize: 24,
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
    fontSize: 12,
    fontFamily: 'Fredoka-Regular',
    color: colors.textMuted,
    marginBottom: 5,
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
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Fredoka-Medium',
    textTransform: 'capitalize',
  },
  itemActions: {
    alignItems: 'center',
    gap: 6,
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
  playButtonActive: {
    backgroundColor: '#6B4A2A',
  },
  addButton: {
    width: 26,
    height: 26,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButtonActive: {
    backgroundColor: colors.error + '22',
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

  // Mini Player
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  miniPlayerEmoji: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPlayerInfo: {
    flex: 1,
  },
  miniPlayerTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
  },
  miniPlayerSub: {
    fontSize: 12,
    fontFamily: 'Fredoka-Regular',
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  miniPlayerBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPlayerClose: {
    padding: 4,
  },

  // Queue Modal
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
    paddingTop: spacing.sm,
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
    width: 40,
    height: 40,
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
    width: 26,
    height: 26,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderBtnDisabled: {
    opacity: 0.3,
  },
  removeBtn: {
    width: 26,
    height: 26,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.error + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },

  // Play queue button
  playQueueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  playQueueBtnText: {
    ...typography.body,
    color: colors.dark,
    fontFamily: 'Fredoka-Medium',
  },

  // Queue item playing state
  queueItemPlaying: {
    backgroundColor: colors.gold + '15',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
  },
  queueItemTitlePlaying: {
    color: colors.gold,
  },
  queuePlayingDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },

  // Mini player skip button
  miniPlayerSkip: {
    padding: 4,
  },
});
