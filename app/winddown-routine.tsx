import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import { ArrowLeft, Plus, ChevronDown, ChevronUp, Clock, Info, Trash2 } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { useWindDown } from '@/contexts/WindDownContext';

export type WindDownItem = {
  id: string;
  type: 'phone' | 'lights' | 'audio' | 'meditation' | 'music' | 'stretching' | 'journaling' | 'reading' | 'gratitude';
  title: string;
  icon: string;
  enabled: boolean;
  minutesBeforeBedtime: number;
  order: number;
  duration: number; // Duration in minutes
  description: string;
};

type ItemDefinition = {
  id: string;
  type: WindDownItem['type'];
  title: string;
  icon: string;
  duration: number;
  description: string;
};

const AVAILABLE_ITEMS: ItemDefinition[] = [
  {
    id: 'meditation',
    type: 'meditation',
    title: 'Guided Meditation',
    icon: '🧘‍♀️',
    duration: 15,
    description: 'A calming guided meditation session to help you relax and let go of the day. Teddy will lead you through mindfulness exercises.',
  },
  {
    id: 'phone',
    type: 'phone',
    title: 'Put Phone Away',
    icon: '📱',
    duration: 1,
    description: 'Time to disconnect from screens. Place your phone in another room or face down to avoid distractions.',
  },
  {
    id: 'lights',
    type: 'lights',
    title: 'Dim the Lights',
    icon: '💡',
    duration: 2,
    description: 'Create a sleep-friendly environment by dimming lights. This helps signal to your body that it\'s time to wind down.',
  },
  {
    id: 'audio',
    type: 'audio',
    title: 'Sleep Sounds',
    icon: '🔊',
    duration: 30,
    description: 'Calming nature sounds like rain, ocean waves, or white noise to help you drift off. Teddy can play these throughout the night.',
  },
  {
    id: 'music',
    type: 'music',
    title: 'Calming Music',
    icon: '🎵',
    duration: 20,
    description: 'Soft, instrumental music designed to promote relaxation and sleep. Teddy will play gentle melodies to help you unwind.',
  },
  {
    id: 'stretching',
    type: 'stretching',
    title: 'Gentle Stretching',
    icon: '🤸',
    duration: 10,
    description: 'Light stretching exercises to release physical tension. Teddy will guide you through gentle movements.',
  },
  {
    id: 'journaling',
    type: 'journaling',
    title: 'Journaling',
    icon: '📔',
    duration: 10,
    description: 'Write down your thoughts, worries, or gratitude. Getting thoughts on paper can help clear your mind before sleep.',
  },
  {
    id: 'reading',
    type: 'reading',
    title: 'Reading',
    icon: '📚',
    duration: 15,
    description: 'Read something calming before bed. Choose a physical book or use a blue-light filter if reading digitally.',
  },
  {
    id: 'gratitude',
    type: 'gratitude',
    title: 'Gratitude Practice',
    icon: '🙏',
    duration: 5,
    description: 'Reflect on three things you\'re grateful for today. This positive practice can improve sleep quality and mood.',
  },
];

export default function WindDownRoutineScreen() {
  const insets = useSafeAreaInsets();
  const { routineItems, setRoutineItems } = useWindDown();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const initialRoutineRef = useRef<string | null>(null);

  useEffect(() => {
    if (initialRoutineRef.current === null) {
      initialRoutineRef.current = JSON.stringify(routineItems);
    }
  }, []);

  const hasChanges =
    initialRoutineRef.current !== null &&
    JSON.stringify(routineItems) !== initialRoutineRef.current;

  // Get item definition by id
  const getItemDefinition = (id: string): ItemDefinition | undefined => {
    return AVAILABLE_ITEMS.find(item => item.id === id);
  };

  // Calculate actual start time (minutes before bedtime)
  const getStartTime = (item: WindDownItem): number => {
    return item.minutesBeforeBedtime;
  };

  // Calculate actual end time (start time + duration)
  const getEndTime = (item: WindDownItem): number => {
    return getStartTime(item) + item.duration;
  };

  // Validate routine - check for conflicts
  const validateRoutine = (items: WindDownItem[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const enabledItems = items.filter(item => item.enabled).sort((a, b) => a.order - b.order);

    for (let i = 0; i < enabledItems.length; i++) {
      const current = enabledItems[i];
      const currentStart = getStartTime(current);
      const currentEnd = getEndTime(current);

      // Check for overlapping times
      for (let j = i + 1; j < enabledItems.length; j++) {
        const other = enabledItems[j];
        const otherStart = getStartTime(other);
        const otherEnd = getEndTime(other);

        if (
          (currentStart >= otherStart && currentStart < otherEnd) ||
          (currentEnd > otherStart && currentEnd <= otherEnd) ||
          (currentStart <= otherStart && currentEnd >= otherEnd)
        ) {
          errors.push(`${current.title} overlaps with ${other.title}`);
        }
      }

      // Check if next item starts before current ends
      if (i < enabledItems.length - 1) {
        const next = enabledItems[i + 1];
        const nextStart = getStartTime(next);
        if (nextStart < currentEnd) {
          errors.push(`${next.title} starts before ${current.title} finishes (needs ${current.duration} min)`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  };

  // Auto-adjust timing when items are reordered
  // Order: 0 = furthest from bedtime, N = closest to bedtime
  // We build the schedule backwards from bedtime (0)
  // Process items from closest to bedtime (highest order) to furthest (lowest order)
  const adjustTimingAfterReorder = (items: WindDownItem[]): WindDownItem[] => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const enabledItems = sorted.filter(item => item.enabled);
    
    // Process in reverse order: highest order (closest to bedtime) first
    const enabledReversed = [...enabledItems].reverse();
    
    let currentTime = 0; // Start at bedtime
    const timeMap = new Map<string, number>();
    
    // Build schedule backwards: closest item first, then work backwards
    enabledReversed.forEach(item => {
      const newTime = currentTime + item.duration;
      timeMap.set(item.id, newTime);
      currentTime = newTime;
    });
    
    // Apply the calculated times to all items
    const adjusted = sorted.map(item => {
      if (!item.enabled) return item;
      const newTime = timeMap.get(item.id) ?? item.minutesBeforeBedtime;
      return { ...item, minutesBeforeBedtime: newTime };
    });

    return adjusted;
  };

  const updateItemTime = (id: string, minutes: number) => {
    setRoutineItems(items => {
      const updated = items.map(item => (item.id === id ? { ...item, minutesBeforeBedtime: minutes } : item));
      // Auto-adjust timing to fix conflicts
      const sorted = [...updated].sort((a, b) => a.order - b.order);
      return adjustTimingAfterReorder(sorted);
    });
  };

  const addItem = (itemDef: ItemDefinition) => {
    const exists = routineItems.find(r => r.id === itemDef.id);
    if (!exists) {
      const maxOrder = routineItems.length > 0 ? Math.max(...routineItems.map(i => i.order)) : -1;
      const newItem: WindDownItem = {
        ...itemDef,
        enabled: true,
        minutesBeforeBedtime: 15,
        order: maxOrder + 1,
      };
      
      setRoutineItems(items => {
        const updated = [...items, newItem];
        return adjustTimingAfterReorder(updated);
      });
    }
  };


  const getAvailableItemsToAdd = () => {
    return AVAILABLE_ITEMS.filter(item => !routineItems.find(r => r.id === item.id));
  };

  const handleSave = () => {
    // Auto-adjust timing to fix any conflicts
    setRoutineItems(items => {
      const sorted = [...items].sort((a, b) => a.order - b.order);
      return adjustTimingAfterReorder(sorted);
    });
    router.back();
  };

  const removeItem = (id: string) => {
    setRoutineItems(items => {
      const filtered = items.filter(i => i.id !== id);
      return adjustTimingAfterReorder(filtered);
    });
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    setRoutineItems(items => {
      // Sort by minutesBeforeBedtime descending (same as display order)
      // Display: index 0 = furthest from bedtime, index N = closest to bedtime
      const sorted = [...items].sort((a, b) => b.minutesBeforeBedtime - a.minutesBeforeBedtime);
      const index = sorted.findIndex(item => item.id === id);
      
      if (index === -1) return items;
      if (direction === 'up' && index === 0) return items; // Already at top (furthest from bedtime)
      if (direction === 'down' && index === sorted.length - 1) return items; // Already at bottom (closest to bedtime)
      
      // Swap items in display order
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const newItems = [...sorted];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      
      // Assign order: display index 0 (furthest from bedtime) gets order 0
      // display index N (closest to bedtime) gets order N
      // This matches the convention: order 0 = furthest, order N = closest
      const reordered = newItems.map((item, displayIdx) => ({ 
        ...item, 
        order: displayIdx 
      }));
      
      return adjustTimingAfterReorder(reordered);
    });
  };

  // Sort by minutesBeforeBedtime descending (closest to bedtime at bottom)
  const sortedItems = [...routineItems].sort((a, b) => b.minutesBeforeBedtime - a.minutesBeforeBedtime);
  const validation = validateRoutine(routineItems);

  const renderRightActions = (itemId: string) => {
    return (
      <TouchableOpacity
        style={styles.swipeDeleteAction}
        onPress={() => removeItem(itemId)}
        activeOpacity={1}
      >
        <Trash2 color={colors.cream} size={22} />
        <Text style={styles.swipeDeleteText}>Remove</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = (item: WindDownItem, index: number) => {
    const itemDef = getItemDefinition(item.id);
    const startTime = getStartTime(item);

    return (
      <Swipeable
        key={item.id}
        renderRightActions={() => renderRightActions(item.id)}
        friction={2}
        rightThreshold={40}
      >
        <Card style={styles.routineItemCard}>
          <View style={styles.routineItemHeader}>
            {sortedItems.length >= 2 && (
              <View style={styles.moveButtonsVertical}>
                <TouchableOpacity
                  style={[styles.moveButtonInline, index === 0 && styles.moveButtonDisabled]}
                  onPress={() => moveItem(item.id, 'up')}
                  disabled={index === 0}
                >
                  <ChevronUp color={colors.textMuted} size={18} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.moveButtonInline, index === sortedItems.length - 1 && styles.moveButtonDisabled]}
                  onPress={() => moveItem(item.id, 'down')}
                  disabled={index === sortedItems.length - 1}
                >
                  <ChevronDown color={colors.textMuted} size={18} />
                </TouchableOpacity>
              </View>
            )}
            <View style={[styles.routineItemLeft, sortedItems.length === 1 && styles.routineItemLeftSingle]}>
              <View style={styles.routineItemIcon}>
                <Text style={styles.iconEmoji}>{item.icon}</Text>
              </View>
              <View style={styles.routineItemInfo}>
                <Text style={styles.routineItemTitle}>{item.title}</Text>
                <View style={styles.routineItemMeta}>
                  {itemDef && (
                    <Text style={styles.routineItemMetaText}>⏱ {itemDef.duration} min</Text>
                  )}
                  <Text style={styles.routineItemMetaDot}>·</Text>
                  <Text style={styles.routineItemMetaText}>🌙 {startTime} min before bed</Text>
                </View>
              </View>
            </View>
            <View style={styles.routineItemActions}>
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              >
                {expandedItem === item.id ? (
                  <ChevronUp color={colors.textMuted} size={20} />
                ) : (
                  <ChevronDown color={colors.textMuted} size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {expandedItem === item.id && (
          <View style={styles.routineItemExpanded}>
            {itemDef && (
              <View style={styles.detailRow}>
                <Info color={colors.blue} size={16} />
                <Text style={styles.detailText}>{itemDef.description}</Text>
              </View>
            )}
          </View>
        )}
        </Card>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.cream} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wind-Down Routine</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Your Routine</Text>
        <Text style={styles.sectionSubtitle}>↑ move earlier  ↓ move later • Swipe left to remove</Text>

        {sortedItems.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No items in your routine yet</Text>
            <Text style={styles.emptySubtext}>Add items below to get started</Text>
          </Card>
        ) : (
          <View style={styles.itemsContainer}>
            {sortedItems.map((item, index) => (
              <View key={item.id} style={styles.routineItemWrapper}>
                {renderItem(item, index)}
              </View>
            ))}
          </View>
        )}

        {getAvailableItemsToAdd().length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Add Items</Text>
            <View style={styles.addItemsContainer}>
              {getAvailableItemsToAdd().map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.addItemButton}
                  onPress={() => addItem(item)}
                >
                  <Text style={styles.addItemIcon}>{item.icon}</Text>
                  <View style={styles.addItemInfo}>
                    <Text style={styles.addItemText}>{item.title}</Text>
                    <View style={styles.addItemMeta}>
                      <Clock color={colors.textMuted} size={12} />
                      <Text style={styles.addItemDuration}>{item.duration} min</Text>
                    </View>
                  </View>
                  <Plus color={colors.blue} size={20} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={styles.scrollBottomPadding} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button title="Save Routine" onPress={handleSave} fullWidth disabled={!hasChanges} />
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.cream,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollBottomPadding: {
    height: 100,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemsContainer: {
    paddingBottom: spacing.md,
  },
  infoCard: {
    margin: spacing.lg,
    backgroundColor: colors.blue + '20',
    borderWidth: 1,
    borderColor: colors.blue,
  },
  infoTitle: {
    ...typography.body,
    color: colors.blue,
    fontFamily: 'Fredoka-Medium',
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.text,
    lineHeight: 20,
  },
  errorCard: {
    margin: spacing.lg,
    backgroundColor: colors.error + '20',
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorTitle: {
    ...typography.body,
    color: colors.error,
    fontFamily: 'Fredoka-Medium',
    marginBottom: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.cream,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textMuted,
  },
  routineItemWrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  swipeDeleteAction: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  swipeDeleteText: {
    ...typography.caption,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    marginTop: 4,
  },
  routineItemCard: {
    // No margin – wrapper provides inset; keeps swipe row same height as card
  },
  routineItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routineItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  routineItemLeftSingle: {
    // Single item: no arrows, content starts from left
  },
  routineItemIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineItemIconDisabled: {
    opacity: 0.4,
  },
  iconEmoji: {
    fontSize: 24,
  },
  routineItemInfo: {
    flex: 1,
  },
  routineItemTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    marginBottom: 4,
  },
  routineItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  routineItemMetaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  routineItemMetaDot: {
    ...typography.caption,
    color: colors.border,
  },
  routineItemTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  durationText: {
    ...typography.small,
    color: colors.textMuted,
  },
  routineItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  selectedIndicatorActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  expandButton: {
    padding: spacing.xs,
  },
  routineItemExpanded: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemDetails: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  detailText: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  timeInputContainer: {
    marginBottom: spacing.md,
  },
  timeInputLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButtonText: {
    ...typography.h3,
    color: colors.cream,
  },
  timeInput: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...typography.h2,
    color: colors.cream,
    textAlign: 'center',
    fontFamily: 'Fredoka-Medium',
  },
  moveControls: {
    marginBottom: spacing.md,
  },
  moveLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  moveButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  moveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moveButtonDisabled: {
    opacity: 0.25,
  },
  moveButtonText: {
    ...typography.caption,
    color: colors.textMuted,
    fontFamily: 'Fredoka-Medium',
  },
  moveButtonTextDisabled: {
    opacity: 0.5,
  },
  moveButtonsVertical: {
    flexDirection: 'column',
    gap: spacing.xs,
    marginRight: spacing.sm,
  },
  moveButtonInline: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error + '10',
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  removeButtonText: {
    ...typography.body,
    color: colors.error,
    fontFamily: 'Fredoka-Medium',
  },
  addItemsContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  addItemIcon: {
    fontSize: 24,
  },
  addItemInfo: {
    flex: 1,
  },
  addItemText: {
    ...typography.body,
    color: colors.cream,
    marginBottom: 2,
  },
  addItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addItemDuration: {
    ...typography.small,
    color: colors.textMuted,
  },
  actions: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.cream,
    marginBottom: spacing.md,
  },
  modalText: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  modalCancelText: {
    ...typography.body,
    color: colors.textMuted,
    fontFamily: 'Fredoka-Medium',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  modalConfirmText: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
  },
});
