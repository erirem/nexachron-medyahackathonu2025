import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

import '../../domain/entities/gamification_models.dart';
import '../../domain/services/game_api_service.dart';

class NotificationServiceImpl implements NotificationService {
  final FlutterLocalNotificationsPlugin _notifications;
  final SharedPreferences _prefs;
  
  NotificationServiceImpl({
    required FlutterLocalNotificationsPlugin notifications,
    required SharedPreferences prefs,
  }) : _notifications = notifications, _prefs = prefs;

  Future<void> initialize() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    
    await _notifications.initialize(initSettings);
  }

  Future<void> zonedSchedule(
      int id,
      String? title,
      String? body,
      DateTime scheduledDate,
      NotificationDetails notificationDetails, {
      required AndroidScheduleMode androidScheduleMode,
      required UILocalNotificationDateInterpretation uiLocalNotificationDateInterpretation,
    }) async {
    // For now, show immediate notification instead of scheduling
    await _notifications.show(
      id,
      title,
      body,
      notificationDetails,
    );
  }

  @override
  Future<void> scheduleGameReminder(String gameId, DateTime scheduledTime) async {
    if (!await areNotificationsEnabled()) return;
    
    const androidDetails = AndroidNotificationDetails(
      'game_reminders',
      'Oyun Hatırlatıcıları',
      channelDescription: 'Oyun oynamak için hatırlatıcılar',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
    );
    
    const iosDetails = DarwinNotificationDetails();
    
    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await zonedSchedule(
      gameId.hashCode,
      'Oyun Zamanı! 🎮',
      'Favori oyununu oynamaya ne dersin?',
      scheduledTime,
      notificationDetails,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  @override
  Future<void> scheduleStreakReminder(DateTime scheduledTime) async {
    if (!await areNotificationsEnabled()) return;
    
    const androidDetails = AndroidNotificationDetails(
      'streak_reminders',
      'Seri Hatırlatıcıları',
      channelDescription: 'Günlük seri koruma hatırlatıcıları',
      importance: Importance.high,
      priority: Priority.high,
    );
    
    const iosDetails = DarwinNotificationDetails();
    
    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await zonedSchedule(
      'streak_reminder'.hashCode,
      'Serini Kaybetme! 🔥',
      'Günlük serini korumak için bir oyun oyna',
      scheduledTime,
      notificationDetails,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  @override
  Future<void> scheduleDailyChallengeReminder(DateTime scheduledTime) async {
    if (!await areNotificationsEnabled()) return;
    
    const androidDetails = AndroidNotificationDetails(
      'challenge_reminders',
      'Günlük Görev Hatırlatıcıları',
      channelDescription: 'Günlük görevler için hatırlatıcılar',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
    );
    
    const iosDetails = DarwinNotificationDetails();
    
    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await zonedSchedule(
      'daily_challenge'.hashCode,
      'Günlük Görev! 🎯',
      'Bugünün özel görevini tamamlamayı unutma',
      scheduledTime,
      notificationDetails,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  @override
  Future<void> showXPEarnedNotification(int xp) async {
    if (!await areNotificationsEnabled()) return;
    
    const androidDetails = AndroidNotificationDetails(
      'xp_notifications',
      'XP Bildirimleri',
      channelDescription: 'XP kazanma bildirimleri',
      importance: Importance.low,
      priority: Priority.low,
    );
    
    const iosDetails = DarwinNotificationDetails();
    
    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await _notifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      'XP Kazandın! ⭐',
      '+$xp XP kazandın! Harika iş çıkarıyorsun.',
      notificationDetails,
    );
  }

  @override
  Future<void> showBadgeEarnedNotification(Badge badge) async {
    if (!await areNotificationsEnabled()) return;
    
    const androidDetails = AndroidNotificationDetails(
      'badge_notifications',
      'Rozet Bildirimleri',
      channelDescription: 'Yeni rozet kazanma bildirimleri',
      importance: Importance.high,
      priority: Priority.high,
    );
    
    const iosDetails = DarwinNotificationDetails();
    
    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await _notifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      'Yeni Rozet! 🏆',
      '${badge.name} rozetini kazandın!',
      notificationDetails,
    );
  }

  @override
  Future<void> showStreakLostWarning() async {
    if (!await areNotificationsEnabled()) return;
    
    const androidDetails = AndroidNotificationDetails(
      'streak_warnings',
      'Seri Uyarıları',
      channelDescription: 'Seri kaybetme uyarıları',
      importance: Importance.high,
      priority: Priority.high,
    );
    
    const iosDetails = DarwinNotificationDetails();
    
    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await _notifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      'Dikkat! ⚠️',
      'Serini kaybetmek üzeresin. Hemen bir oyun oyna!',
      notificationDetails,
    );
  }

  @override
  Future<void> showChallengeCompletedNotification(DailyChallenge challenge) async {
    if (!await areNotificationsEnabled()) return;
    
    const androidDetails = AndroidNotificationDetails(
      'challenge_completed',
      'Görev Tamamlandı',
      channelDescription: 'Görev tamamlama bildirimleri',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
    );
    
    const iosDetails = DarwinNotificationDetails();
    
    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await _notifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      'Görev Tamamlandı! ✅',
      '${challenge.title} görevini tamamladın! +${challenge.xpReward} XP',
      notificationDetails,
    );
  }

  @override
  Future<bool> requestNotificationPermission() async {
    final androidImplementation = _notifications.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    
    if (androidImplementation != null) {
      final granted = await androidImplementation.requestNotificationsPermission();
      await _prefs.setBool('notifications_enabled', granted ?? false);
      return granted ?? false;
    }
    
    final iosImplementation = _notifications.resolvePlatformSpecificImplementation<
        IOSFlutterLocalNotificationsPlugin>();
    
    if (iosImplementation != null) {
      final granted = await iosImplementation.requestPermissions(
        alert: true,
        badge: true,
        sound: true,
      );
      await _prefs.setBool('notifications_enabled', granted ?? false);
      return granted ?? false;
    }
    
    return false;
  }

  @override
  Future<bool> areNotificationsEnabled() async {
    return _prefs.getBool('notifications_enabled') ?? false;
  }

  @override
  Future<void> updateNotificationSettings(Map<String, bool> settings) async {
    final settingsJson = jsonEncode(settings);
    await _prefs.setString('notification_settings', settingsJson);
  }

  Future<Map<String, bool>> getNotificationSettings() async {
    final settingsJson = _prefs.getString('notification_settings');
    if (settingsJson != null) {
      final Map<String, dynamic> decoded = jsonDecode(settingsJson);
      return decoded.map((key, value) => MapEntry(key, value as bool));
    }
    
    // Default settings
    return {
      'game_reminders': true,
      'streak_reminders': true,
      'challenge_reminders': true,
      'xp_notifications': false,
      'badge_notifications': true,
    };
  }
}
