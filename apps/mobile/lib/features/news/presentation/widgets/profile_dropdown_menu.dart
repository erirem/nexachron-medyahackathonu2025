import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ProfileDropdownMenu extends StatefulWidget {
  final VoidCallback onClose;
  final VoidCallback onProfileTap;
  final VoidCallback onLogoutTap;

  const ProfileDropdownMenu({
    super.key,
    required this.onClose,
    required this.onProfileTap,
    required this.onLogoutTap,
  });

  @override
  State<ProfileDropdownMenu> createState() => _ProfileDropdownMenuState();
}

class _ProfileDropdownMenuState extends State<ProfileDropdownMenu>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
    _opacityAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Supabase'den kullanıcı bilgilerini çek
    final session = Supabase.instance.client.auth.currentSession;
    final user = session?.user;
    
    // Kullanıcı adını belirle: username varsa onu, yoksa email'in @ öncesini kullan
    String displayName = 'Kullanıcı'; // Varsayılan
    if (user != null) {
      if (user.userMetadata?['username'] != null) {
        displayName = user.userMetadata!['username'] as String;
      } else if (user.email != null) {
        // Email'den @ öncesini al
        displayName = user.email!.split('@').first;
      }
    }
    
    return GestureDetector(
      onTap: () {}, // Prevent closing when tapping menu content
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Opacity(
              opacity: _opacityAnimation.value,
              child: Container(
                width: 220,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Color(0xFF1a2234),
                      Color(0xFF162639),
                      Color(0xFF0f1624),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.1),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.5),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // User info section (optional)
                    Container(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 20,
                            backgroundColor: Colors.white.withOpacity(0.1),
                            child: const Icon(
                              Icons.person,
                              color: Colors.white70,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  displayName,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white.withOpacity(0.9),
                                  ),
                                ),
                                Text(
                                  'Profil',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.white.withOpacity(0.6),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Divider
                    Container(
                      height: 1,
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      color: Colors.white.withOpacity(0.1),
                    ),
                    // Menu items
                    _MenuItem(
                      icon: Icons.person_outline,
                      label: 'Profile Git',
                      onTap: widget.onProfileTap,
                    ),
                    _MenuItem(
                      icon: Icons.logout,
                      label: 'Çıkış Yap',
                      onTap: widget.onLogoutTap,
                      isDestructive: true,
                    ),
                    const SizedBox(height: 8),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _MenuItem extends StatefulWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool isDestructive;

  const _MenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.isDestructive = false,
  });

  @override
  State<_MenuItem> createState() => _MenuItemState();
}

class _MenuItemState extends State<_MenuItem> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final color = widget.isDestructive
        ? Colors.red.withOpacity(0.8)
        : Colors.white.withOpacity(0.8);

    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: _isPressed
              ? Colors.white.withOpacity(0.1)
              : Colors.transparent,
        ),
        child: Row(
          children: [
            Icon(widget.icon, size: 20, color: color),
            const SizedBox(width: 12),
            Text(
              widget.label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
