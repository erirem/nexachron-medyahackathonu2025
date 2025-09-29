import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseAuthGateway {
  SupabaseAuthGateway({SupabaseClient? client})
    : _client = client ?? Supabase.instance.client;

  final SupabaseClient _client;

  Future<AuthResponse> signInWithPassword({
    required String email,
    required String password,
  }) {
    return _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<AuthResponse> signUp({
    required String email,
    required String password,
    Map<String, dynamic>? data,
    String? emailRedirectTo,
  }) {
    return _client.auth.signUp(
      email: email,
      password: password,
      data: data,
      emailRedirectTo: emailRedirectTo,
    );
  }

  Future<void> signOut() {
    return _client.auth.signOut();
  }

  Session? currentSession() => _client.auth.currentSession;
}
