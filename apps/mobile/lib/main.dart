import 'dart:async';

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/config/app_config.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/pages/landing_page.dart';
import 'features/auth/presentation/pages/profile_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: AppConfig.supabaseUrl,
    anonKey: AppConfig.supabaseAnonKey,
  );

  runApp(const NexachronApp());
}

class NexachronApp extends StatelessWidget {
  const NexachronApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Nexachron',
      theme: buildAppTheme(),
      home: const _AuthRoot(),
    );
  }
}

class _AuthRoot extends StatefulWidget {
  const _AuthRoot();

  @override
  State<_AuthRoot> createState() => _AuthRootState();
}

class _AuthRootState extends State<_AuthRoot> {
  Session? _session;
  StreamSubscription<AuthState>? _subscription;

  @override
  void initState() {
    super.initState();
    final client = Supabase.instance.client;
    _session = client.auth.currentSession;
    _subscription = client.auth.onAuthStateChange.listen((event) {
      setState(() {
        _session = event.session;
      });
    });
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 250),
      child: _session == null ? const LandingPage() : const ProfileScreen(),
    );
  }
}
