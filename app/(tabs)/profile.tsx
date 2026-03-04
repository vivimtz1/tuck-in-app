import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { User, Settings, Bell, Lock, Moon, Circle as HelpCircle, LogOut, ChevronRight, X } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [bedtimeReminders, setBedtimeReminders] = useState(true);
  const [morningCheckins, setMorningCheckins] = useState(true);
  const [teddyName, setTeddyName] = useState('Teddy');
  const [editingTeddyName, setEditingTeddyName] = useState('');
  const [showTeddyModal, setShowTeddyModal] = useState(false);

  const userName = 'Clara Lu';
  const currentStreak = 5;

  const openTeddyModal = () => {
    setEditingTeddyName(teddyName);
    setShowTeddyModal(true);
  };

  const saveTeddyName = () => {
    if (editingTeddyName.trim()) {
      setTeddyName(editingTeddyName.trim());
    }
    setShowTeddyModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileStat}>{currentStreak} day streak 🔥</Text>
            </View>
          </View>

          <View style={styles.teddySection}>
            <Text style={styles.teddyEmoji}>🧸</Text>
            <View style={styles.teddyInfo}>
              <Text style={styles.teddyLabel}>Your Teddy</Text>
              <Text style={styles.teddyName}>{teddyName}</Text>
            </View>
            <TouchableOpacity onPress={openTeddyModal}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Modal
          visible={showTeddyModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTeddyModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowTeddyModal(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Teddy's Name</Text>
                <TouchableOpacity onPress={() => setShowTeddyModal(false)}>
                  <X color={colors.textMuted} size={24} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalTeddyPreview}>
                <Text style={styles.modalTeddyEmoji}>🧸</Text>
              </View>
              <TextInput
                style={styles.teddyInput}
                value={editingTeddyName}
                onChangeText={setEditingTeddyName}
                placeholder="Enter name"
                placeholderTextColor={colors.textMuted}
                maxLength={12}
                autoFocus
              />
              <TouchableOpacity style={styles.saveButton} onPress={saveTeddyName}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        <Text style={styles.sectionTitle}>Sleep Settings</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Moon color={colors.cream} size={20} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Sleep Schedule</Text>
            <Text style={styles.settingDescription}>11:00 PM - 7:30 AM</Text>
          </View>
          <ChevronRight color={colors.textMuted} size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/winddown-routine')}>
          <View style={styles.settingIcon}>
            <Settings color={colors.blue} size={20} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Wind-Down Preferences</Text>
            <Text style={styles.settingDescription}>Customize your routine</Text>
          </View>
          <ChevronRight color={colors.textMuted} size={20} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Bell color={colors.gold} size={20} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>All Notifications</Text>
            <Text style={styles.settingDescription}>Enable or disable all alerts</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.blue }}
            thumbColor={colors.cream}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Bell color={colors.textMuted} size={20} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Bedtime Reminders</Text>
            <Text style={styles.settingDescription}>30 minutes before bedtime</Text>
          </View>
          <Switch
            value={bedtimeReminders}
            onValueChange={setBedtimeReminders}
            trackColor={{ false: colors.border, true: colors.blue }}
            thumbColor={colors.cream}
            disabled={!notificationsEnabled}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Bell color={colors.textMuted} size={20} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Morning Check-ins</Text>
            <Text style={styles.settingDescription}>Daily sleep quality reminders</Text>
          </View>
          <Switch
            value={morningCheckins}
            onValueChange={setMorningCheckins}
            trackColor={{ false: colors.border, true: colors.blue }}
            thumbColor={colors.cream}
            disabled={!notificationsEnabled}
          />
        </View>

        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <User color={colors.cream} size={20} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Account Details</Text>
            <Text style={styles.settingDescription}>Manage your profile</Text>
          </View>
          <ChevronRight color={colors.textMuted} size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Lock color={colors.textSecondary} size={20} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Privacy Settings</Text>
            <Text style={styles.settingDescription}>Data sharing and privacy</Text>
          </View>
          <ChevronRight color={colors.textMuted} size={20} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Support</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <HelpCircle color={colors.blue} size={20} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Help & Support</Text>
            <Text style={styles.settingDescription}>FAQs and contact</Text>
          </View>
          <ChevronRight color={colors.textMuted} size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, styles.logoutItem]}>
          <View style={styles.settingIcon}>
            <LogOut color={colors.error} size={20} />
          </View>
          <Text style={[styles.settingTitle, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Tuck In v1.0.0</Text>
          <Text style={styles.footerText}>Made with care for better sleep</Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.cream,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.brown,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.cream,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h2,
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  profileStat: {
    ...typography.body,
    color: colors.textMuted,
  },
  teddySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teddyEmoji: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  teddyInfo: {
    flex: 1,
  },
  teddyLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },
  teddyName: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
  },
  editButton: {
    ...typography.body,
    color: colors.blue,
    fontFamily: 'Fredoka-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 340,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.cream,
  },
  modalTeddyPreview: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTeddyEmoji: {
    fontSize: 64,
  },
  teddyInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.cream,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  saveButton: {
    backgroundColor: colors.cream,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.body,
    fontFamily: 'Fredoka-Medium',
    color: colors.dark,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.cream,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    marginBottom: 2,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  logoutItem: {
    marginTop: spacing.lg,
  },
  logoutText: {
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 4,
  },
});
