import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { useWindDown } from '@/contexts/WindDownContext';

export type WindDownItem = {
  id: string;
  type: 'breathing' | 'phone' | 'lights' | 'audio' | 'meditation' | 'music' | 'stretching' | 'journaling' | 'reading' | 'gratitude';
  title: string;
  icon: string;
  enabled: boolean;
  minutesBeforeBedtime: number;
  order: number;
};

const AVAILABLE_ITEMS: Omit<WindDownItem, 'enabled' | 'minutesBeforeBedtime' | 'order'>[] = [
  {
    id: 'breathing',
    type: 'breathing',
    title: 'Breathing Exercises',
    icon: '🧘',
  },
  {
    id: 'meditation',
    type: 'meditation',
    title: 'Guided Meditation',
    icon: '🧘‍♀️',
  },
  {
    id: 'phone',
    type: 'phone',
    title: 'Put Phone Away',
    icon: '📱',
  },
  {
    id: 'lights',
    type: 'lights',
    title: 'Dim the Lights',
    icon: '💡',
  },
  {
    id: 'audio',
    type: 'audio',
    title: 'Sleep Sounds',
    icon: '🔊',
  },
  {
    id: 'music',
    type: 'music',
    title: 'Calming Music',
    icon: '🎵',
  },
  {
    id: 'stretching',
    type: 'stretching',
    title: 'Gentle Stretching',
    icon: '🤸',
  },
  {
    id: 'journaling',
    type: 'journaling',
    title: 'Journaling',
    icon: '📔',
  },
  {
    id: 'reading',
    type: 'reading',
    title: 'Reading',
    icon: '📚',
  },
  {
    id: 'gratitude',
    type: 'gratitude',
    title: 'Gratitude Practice',
    icon: '🙏',
  },
];

export default function WindDownRoutineScreen() {
  const { routineItems, setRoutineItems } = useWindDown();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const updateItemTime = (id: string, minutes: number) => {
    setRoutineItems(items =>
      items.map(item => (item.id === id ? { ...item, minutesBeforeBedtime: minutes } : item))
    );
  };

  const addItem = (item: typeof AVAILABLE_ITEMS[0]) => {
    const exists = routineItems.find(r => r.id === item.id);
    if (!exists) {
      const maxOrder = routineItems.length > 0 ? Math.max(...routineItems.map(i => i.order)) : -1;
      setRoutineItems(items => [
        ...items,
        {
          ...item,
          enabled: true,
          minutesBeforeBedtime: 15,
          order: maxOrder + 1,
        },
      ]);
    }
  };

  const removeItem = (id: string) => {
    setRoutineItems(items => {
      const filtered = items.filter(item => item.id !== id);
      // Reorder remaining items
      return filtered.map((item, index) => ({ ...item, order: index }));
    });
  };

  const getAvailableItemsToAdd = () => {
    return AVAILABLE_ITEMS.filter(item => !routineItems.find(r => r.id === item.id));
  };

  const handleSave = () => {
    // Routine is already saved in context, which persists during app session
    // TODO: Save to Supabase for persistence across sessions
    router.back();
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    setRoutineItems(items => {
      const sorted = [...items].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex(item => item.id === id);
      
      if (index === -1) return items;
      if (direction === 'up' && index === 0) return items;
      if (direction === 'down' && index === sorted.length - 1) return items;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const newItems = [...sorted];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      
      return newItems.map((item, idx) => ({ ...item, order: idx }));
    });
  };

  // Sort by order (maintains drag order)
  const sortedItems = [...routineItems].sort((a, b) => a.order - b.order);

  const renderItem = (item: WindDownItem, index: number) => {
    return (
      <Card key={item.id} style={styles.routineItemCard}>
        <View style={styles.routineItemHeader}>
          <View style={styles.dragControls}>
            <TouchableOpacity
              style={[styles.moveButton, index === 0 && styles.moveButtonDisabled]}
              onPress={() => moveItem(item.id, 'up')}
              disabled={index === 0}
            >
              <ChevronUp color={index === 0 ? colors.border : colors.textMuted} size={16} />
            </TouchableOpacity>
            <GripVertical color={colors.textMuted} size={20} />
            <TouchableOpacity
              style={[styles.moveButton, index === sortedItems.length - 1 && styles.moveButtonDisabled]}
              onPress={() => moveItem(item.id, 'down')}
              disabled={index === sortedItems.length - 1}
            >
              <ChevronDown color={index === sortedItems.length - 1 ? colors.border : colors.textMuted} size={16} />
            </TouchableOpacity>
          </View>
          <View style={styles.routineItemLeft}>
            <View style={[styles.routineItemIcon, !item.enabled && styles.routineItemIconDisabled]}>
              <Text style={styles.iconEmoji}>{item.icon}</Text>
            </View>
            <TouchableOpacity
              style={styles.routineItemInfo}
              onPress={() => {
                setRoutineItems(items =>
                  items.map(i => (i.id === item.id ? { ...i, enabled: !i.enabled } : i))
                );
              }}
            >
              <Text style={[styles.routineItemTitle, !item.enabled && styles.routineItemTitleDisabled]}>
                {item.title}
              </Text>
              <Text style={styles.routineItemTime}>
                {item.minutesBeforeBedtime} min before bedtime
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.routineItemActions}>
            <View style={[styles.selectedIndicator, item.enabled && styles.selectedIndicatorActive]} />
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
            <View style={styles.timeInputContainer}>
              <Text style={styles.timeInputLabel}>Minutes before bedtime:</Text>
              <View style={styles.timeInputRow}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => updateItemTime(item.id, Math.max(0, item.minutesBeforeBedtime - 5))}
                >
                  <Text style={styles.timeButtonText}>-5</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.timeInput}
                  value={item.minutesBeforeBedtime.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text, 10);
                    if (!isNaN(num) && num >= 0) {
                      updateItemTime(item.id, num);
                    }
                  }}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => updateItemTime(item.id, item.minutesBeforeBedtime + 5)}
                >
                  <Text style={styles.timeButtonText}>+5</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.id)}
            >
              <Trash2 color={colors.error} size={18} />
              <Text style={styles.removeButtonText}>Remove from routine</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Customize Your Routine</Text>
          <Text style={styles.infoText}>
            Set up your wind-down routine with Teddy. Choose which activities to include and when they should happen before bedtime. Teddy will guide you through each step.
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Your Routine</Text>
        <Text style={styles.sectionSubtitle}>Long press and drag to reorder • Tap to select/deselect</Text>

        {sortedItems.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No items in your routine yet</Text>
            <Text style={styles.emptySubtext}>Add items below to get started</Text>
          </Card>
        ) : (
          <View style={styles.itemsContainer}>
            {sortedItems.map((item, index) => renderItem(item, index))}
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
                  <Text style={styles.addItemText}>{item.title}</Text>
                  <Plus color={colors.blue} size={20} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={styles.actions}>
          <Button title="Save Routine" onPress={handleSave} fullWidth />
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
  itemsContainer: {
    paddingBottom: spacing.md,
  },
  dragControls: {
    alignItems: 'center',
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  moveButton: {
    padding: spacing.xs,
  },
  moveButtonDisabled: {
    opacity: 0.3,
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
  routineItemCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  routineItemCardActive: {
    opacity: 0.8,
    transform: [{ scale: 1.02 }],
  },
  routineItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dragHandle: {
    padding: spacing.sm,
    marginRight: spacing.xs,
  },
  routineItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  routineItemIconDisabled: {
    opacity: 0.4,
  },
  routineItemTitleDisabled: {
    opacity: 0.4,
    textDecorationLine: 'line-through',
  },
  routineItemIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 2,
  },
  routineItemTime: {
    ...typography.caption,
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
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  removeButtonText: {
    ...typography.body,
    color: colors.error,
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
  addItemText: {
    ...typography.body,
    color: colors.cream,
    flex: 1,
  },
  actions: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
});
