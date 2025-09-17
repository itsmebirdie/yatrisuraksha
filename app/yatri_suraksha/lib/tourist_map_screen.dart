import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class TouristMapScreen extends StatefulWidget {
  final Map<String, dynamic> touristData;
  const TouristMapScreen({super.key, required this.touristData});

  @override
  _TouristMapScreenState createState() => _TouristMapScreenState();
}

class _TouristMapScreenState extends State<TouristMapScreen> {
  late GoogleMapController mapController;
  final LatLng _center = const LatLng(26.1111, 91.5855);

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Travel Itinerary')),
      body: Stack(
        children: [
          GoogleMap(
            onMapCreated: _onMapCreated,
            initialCameraPosition: CameraPosition(
              target: _center,
              zoom: 11.0,
            ),
          ),
          // Distress Button
          Align(
            alignment: Alignment.bottomRight,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: FloatingActionButton.extended(
                onPressed: () {
                  // Implement distress call logic here
                  // 1. Get current location
                  // 2. Send POST request to backend
                  // 3. Show confirmation message
                },
                label: const Text('Distress'),
                icon: const Icon(Icons.warning),
                backgroundColor: Colors.red,
              ),
            ),
          ),
        ],
      ),
    );
  }
}