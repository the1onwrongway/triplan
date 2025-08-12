// new_trip_screen.dart
import 'package:flutter/material.dart';

class NewTripScreen extends StatelessWidget {
  const NewTripScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Trip')),
      body: const Center(child: Text('Create a New Trip')),
    );
  }
}

// itinerary_screen.dart
class ItineraryScreen extends StatelessWidget {
  const ItineraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Itinerary')),
      body: const Center(child: Text('View Itinerary')),
    );
  }
}

// contacts_screen.dart
class ContactsScreen extends StatelessWidget {
  const ContactsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Emergency Contacts')),
      body: const Center(child: Text('View Emergency Contacts')),
    );
  }
}