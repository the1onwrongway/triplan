// documents.dart
import 'package:flutter/material.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  _DocumentsScreenState createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  String _selectedFilter = 'Recent'; // Default filter

  // Dummy data for documents
  final List<Map<String, dynamic>> recentDocuments = [
    {'title': 'Visa', 'date': 'Milan - Paris', 'icon': Icons.check_circle, 'color': Colors.teal},
    {'title': 'Insurance', 'date': 'Milan - Paris', 'icon': Icons.shield, 'color': Colors.deepOrange},
    {'title': 'Flight Ticket', 'date': 'Dec 10, 2024', 'icon': Icons.flight, 'color': Colors.blue},
    {'title': 'Hotel Stay', 'date': 'Dec 10-12, 2024', 'icon': Icons.hotel, 'color': Colors.purple},
    {'title': 'Eiffel Tower Visit', 'date': 'Dec 11, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
    {'title': 'Museum Tour', 'date': 'Dec 12, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
    {'title': 'Wine Tasting', 'date': 'Dec 12, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
    {'title': 'Train Ticket', 'date': 'Dec 12, 2024', 'icon': Icons.train, 'color': Colors.green},
    {'title': 'Hotel Stay', 'date': 'Dec 13-14, 2024', 'icon': Icons.hotel, 'color': Colors.purple},
    {'title': 'Scooter Rental', 'date': 'Dec 13, 2024', 'icon': Icons.two_wheeler, 'color': Colors.blueGrey},
    {'title': 'City Tour', 'date': 'Dec 13, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
    {'title': 'Dinner Cruise', 'date': 'Dec 13, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
    {'title': 'Bus Ticket', 'date': 'Dec 13, 2024', 'icon': Icons.directions_bus, 'color': Colors.orange},
    {'title': 'Hotel Stay', 'date': 'Dec 14-15, 2024', 'icon': Icons.hotel, 'color': Colors.purple},
    {'title': 'Car Rental', 'date': 'Dec 15, 2024', 'icon': Icons.directions_car, 'color': Colors.blueGrey},
    {'title': 'City Walking Tour', 'date': 'Dec 14, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
    {'title': 'Club Hopping', 'date': 'Dec 14, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
    {'title': 'Flight Ticket', 'date': 'Dec 15, 2024', 'icon': Icons.flight, 'color': Colors.blue},
  ];

  final List<Map<String, dynamic>> personalDocuments = [
    {'title': 'Passport', 'date': 'Milan Gabriel', 'icon': Icons.assignment_ind, 'color': Colors.red},
    {'title': 'Passport', 'date': 'Gabriel Macwan', 'icon': Icons.assignment_ind, 'color': Colors.red},
    {'title': 'Covid', 'date': 'Milan Gabriel', 'icon': Icons.card_membership, 'color': Colors.red},
    {'title': 'Covid', 'date': 'Gabriel Macwan', 'icon': Icons.card_membership, 'color': Colors.red},
  ];

final List<Map<String, dynamic>> pastDocuments = [
  {'title': 'Flight Ticket', 'date': 'Sep 5, 2024', 'icon': Icons.flight, 'color': Colors.blue},
  {'title': 'Beer Street', 'date': 'Sep 5, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
  {'title': 'La Han Bay', 'date': 'Sep 5, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
  {'title': 'Train Street', 'date': 'Sep 4, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
  {'title': 'Trang An', 'date': 'Sep 4, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
  {'title': 'Hotel Stay', 'date': 'Sep 4-5, 2024', 'icon': Icons.hotel, 'color': Colors.purple},
  {'title': 'Bus Ticket', 'date': 'Sep 3, 2024', 'icon': Icons.directions_bus, 'color': Colors.orange},
  {'title': 'Phong Nha Cave', 'date': 'Sep 3, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
  {'title': 'Scooter Rental', 'date': 'Sep 3, 2024', 'icon': Icons.two_wheeler, 'color': Colors.blueGrey},
  {'title': 'Hotel Stay', 'date': 'Sep 3-4, 2024', 'icon': Icons.hotel, 'color': Colors.purple},
  {'title': 'Train Ticket', 'date': 'Sep 2, 2024', 'icon': Icons.train, 'color': Colors.green},
  {'title': 'Bui Vein Walking Street', 'date': 'Sep 2, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
  {'title': 'Mekong Delta', 'date': 'Sep 2, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
  {'title': 'Cu Chi Tunnels', 'date': 'Sep 1, 2024', 'icon': Icons.local_activity, 'color': Colors.pink},
  {'title': 'Hotel Stay', 'date': 'Sep 1-2, 2024', 'icon': Icons.hotel, 'color': Colors.purple},
  {'title': 'Flight Ticket', 'date': 'Sep 1, 2024', 'icon': Icons.flight, 'color': Colors.blue},
  {'title': 'Insurance', 'date': 'Milan - Vietnam', 'icon': Icons.shield, 'color': Colors.deepOrange},
  {'title': 'Visa', 'date': 'Milan - Vietnam', 'icon': Icons.check_circle, 'color': Colors.teal},
];

  @override
  Widget build(BuildContext context) {
    List<Map<String, dynamic>> displayedDocuments;

    switch (_selectedFilter) {
      case 'Personal':
        displayedDocuments = personalDocuments;
        break;
      case 'Past':
        displayedDocuments = pastDocuments;
        break;
      case 'Recent':
      default:
        displayedDocuments = recentDocuments;
        break;
    }

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildFilterButton('Recent'),
            _buildFilterButton('Personal'),
            _buildFilterButton('Past'),
          ],
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(16.0),
            children: displayedDocuments.map((doc) {
              return _buildDocumentTile(doc['title'], doc['date'], doc['icon'], doc['color']);
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildFilterButton(String filter) {
    return TextButton(
      onPressed: () {
        setState(() {
          _selectedFilter = filter;
        });
      },
      child: Text(
        filter,
        style: TextStyle(
          color: _selectedFilter == filter ? Colors.blue : Colors.black,
          fontWeight: _selectedFilter == filter ? FontWeight.bold : FontWeight.normal,
        ),
      ),
    );
  }

  Widget _buildDocumentTile(String title, String date, IconData icon, Color iconColor) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      child: ListTile(
        leading: Icon(icon, color: iconColor),
        title: Text(title),
        subtitle: Text(date),
      ),
    );
  }
}