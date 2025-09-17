import 'package:flutter/material.dart';
import 'qr_scanner_screen.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'YatriSuraksha',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const QRScannerScreen(),
    );
  }
}