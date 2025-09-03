import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'db/database_helper.dart';
import 'package:intl/intl.dart';
import 'pages/home.dart';
import 'pages/student_add.dart';
import 'pages/about.dart';

void main() {
  runApp(const MyApp());
}

// GoRouter yapılandırması
final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (context, state) => const HomePage()),
    GoRoute(path: '/add', builder: (context, state) => const StudentAddPage()),
    GoRoute(path: '/about', builder: (context, state) => const AboutPage()),
  ],
);

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Student Management',
      routerConfig: _router,
      theme: ThemeData(
        primaryColor: Colors.deepOrange,
        primarySwatch: Colors.deepOrange,
        scaffoldBackgroundColor: Colors.grey[100],
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.deepOrange[700],
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        bottomNavigationBarTheme: BottomNavigationBarThemeData(
          backgroundColor: Colors.white,
          selectedItemColor: Colors.deepOrange[700],
          unselectedItemColor: Colors.grey,
        ),
      ),
    );
  }
}

// ✅ Ortak Layout (AppBar + BottomNavigationBar)
class AppScaffold extends StatelessWidget {
  final Widget child;
  final int currentIndex;
  const AppScaffold({
    super.key,
    required this.child,
    required this.currentIndex,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 6,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: currentIndex,
          onTap: (index) {
            switch (index) {
              case 0:
                context.go('/');
                break;
              case 1:
                context.go('/add');
                break;
              case 2:
                context.go('/about');
                break;
            }
          },
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home),
              label: 'Ana səhifə',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.add_box),
              label: 'Əlavə et',
            ),
            BottomNavigationBarItem(icon: Icon(Icons.info), label: 'Haqqında'),
          ],
        ),
      ),
    );
  }
}

// ✅ Ana Say
