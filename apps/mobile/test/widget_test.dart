// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:mobile/core/services/locale_controller.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('Landing screen renders primary CTA', (
    WidgetTester tester,
  ) async {
    SharedPreferences.setMockInitialValues({});
    final controller = LocaleController();
    await controller.loadSavedLocale();

    await tester.pumpWidget(NexachronApp(localeController: controller));
    await tester.pumpAndSettle();

    expect(find.text('Hemen başla'), findsOneWidget);
    expect(find.text('Zaten üyeyim'), findsOneWidget);
  });
}
