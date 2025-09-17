// qr_scanner_screen.dart

import 'package:flutter/material.dart';
import 'package:fast_barcode_scanner/fast_barcode_scanner.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'tourist_map_screen.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  _QRScannerScreenState createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scan Your D-ID QR Code')),
      body: Stack(
        children: <Widget>[
          // The BarcodeCamera is now a standalone widget in the stack
          BarcodeCamera(
            onScan: (barcode) async {
              final did = barcode.value;
              if (did.isNotEmpty) {
                await fetchAndNavigate(did);
              }
            },
            types: const [BarcodeType.qr],
          ),
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white, width: 2),
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> fetchAndNavigate(String did) async {
    try {
      final response = await http.get(Uri.parse('http://3.108.41.199:8080/tourist-data/$did'));

      if (response.statusCode == 200) {
        final touristData = jsonDecode(response.body);

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => TouristMapScreen(touristData: touristData)),
        );
      } else {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Error'),
            content: Text('Failed to fetch tourist data. Status Code: ${response.statusCode}'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK')),
            ],
          ),
        );
      }
    } catch (e) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Network Error'),
          content: Text('An error occurred: $e'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK')),
          ],
        ),
      );
    }
  }
}