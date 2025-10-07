import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:mobile/l10n/gen/app_localizations.dart';

import 'core/config/app_config.dart';
import 'core/config/locales.dart';
import 'core/l10n/l10n.dart';
import 'core/services/locale_controller.dart';
import 'core/services/locale_scope.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/pages/landing_page.dart';
import 'features/news/presentation/pages/main_navigation.dart';
import 'features/games/presentation/pages/quizzes_page.dart';
import 'features/games/presentation/pages/wordle_page.dart';
import 'features/games/presentation/pages/news_guessr_page.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final localeController = LocaleController();
  await localeController.loadSavedLocale();

  await Supabase.initialize(
    url: AppConfig.supabaseUrl,
    anonKey: AppConfig.supabaseAnonKey,
  );

  runApp(
    ProviderScope(child: NexachronApp(localeController: localeController)),
  );
}

class NexachronApp extends StatelessWidget {
  const NexachronApp({super.key, required this.localeController});

  final LocaleController localeController;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: localeController,
      builder: (context, _) {
        return LocaleScope(
          controller: localeController,
          child: MaterialApp(
            debugShowCheckedModeBanner: false,
            title: 'Nexachron',
            theme: buildAppTheme(),
            onGenerateTitle: (context) => context.l10n.appTitle,
            locale: localeController.locale,
            supportedLocales: buildSupportedLocales(),
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            localeResolutionCallback: (deviceLocale, supportedLocales) {
              if (localeController.locale != null) {
                return localeController.locale;
              }
              if (deviceLocale != null) {
                for (final locale in supportedLocales) {
                  if (locale.languageCode == deviceLocale.languageCode) {
                    return locale;
                  }
                }
              }
              return Locale(defaultLocaleCode);
            },
            home: const _AuthRoot(),
            routes: {
              '/quizzes': (context) => const QuizzesPage(),
              '/wordle': (context) => const WordlePage(),
              '/news-guessr': (context) => const NewsGuessrPage(),
            },
          ),
        );
      },
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
      child: _session == null ? const LandingPage() : const MainNavigation(),
    );
  }
}
