import 'package:flutter/material.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'tourist_map_screen.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  _QRScannerScreenState createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  QRViewController? controller;
  bool isScanning = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scan Your D-ID QR Code')),
      body: Column(
        children: <Widget>[
          Expanded(
            flex: 5,
            child: QRView(
              key: qrKey,
              onQRViewCreated: _onQRViewCreated,
              overlay: QrScannerOverlayShape(
                borderColor: Colors.red,
                borderRadius: 10,
                borderLength: 30,
                borderWidth: 10,
                cutOutSize: 300,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    controller.scannedDataStream.listen((scanData) async {
      if (isScanning) {
        isScanning = false;
        controller.pauseCamera();
        
        final did = scanData.code;
        if (did != null) {
          await fetchAndNavigate(did);
        } else {
          // Handle error if QR code is empty
        }
      }
    });
  }

  Future<void> fetchAndNavigate(String did) async {
    final response = await http.get(Uri.parse('http://3.108.41.199:8080/tourist-data/$did'));

    if (response.statusCode == 200) {
      final touristData = jsonDecode(response.body);
      
      // Navigate to the main map screen with the tourist data
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => TouristMapScreen(touristData: touristData)),
      );
    } else {
      // Show error dialog
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Error'),
          content: Text('Failed to fetch tourist data. Please try again.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                isScanning = true;
                controller?.resumeCamera();
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    }
  }

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }
}