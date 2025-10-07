class AppConfig {
  AppConfig._();

  // Supabase Configuration
  static const String supabaseUrl = 'https://tfqnfkyntjreanffixti.supabase.co';
  static const String supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcW5ma3ludGpyZWFuZmZpeHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjczODAsImV4cCI6MjA3Mzk0MzM4MH0.GHyet9orem6sYpOb-suaFPcYRfOVYohZRLfRzGTgxLk';

  // API Configuration
  // Derleme parametresinden (dart-define) okunur; verilmezse localhost kullanılır.
  // iOS simülatör: http://localhost:4000, Android emülatör: http://10.0.2.2:4000
  static const String apiBaseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:4000',
  );
}
