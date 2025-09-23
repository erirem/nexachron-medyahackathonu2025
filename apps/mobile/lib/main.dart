import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'features/auth/presentation/pages/landing_page.dart';

void main() {
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
      home: const LandingPage(),
    );
  }
}
