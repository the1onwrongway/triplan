// itinerary_screen.dart
import 'package:flutter/material.dart';
import 'trip_card.dart'; // Import TripCard from the separate file

class ItineraryScreen extends StatefulWidget {
  final bool showAllTrips;
  final String initialFilter; // Added parameter for initial filter

  ItineraryScreen({super.key, required this.showAllTrips, required this.initialFilter});

  @override
  _ItineraryScreenState createState() => _ItineraryScreenState();
}

class _ItineraryScreenState extends State<ItineraryScreen> {
  late String _selectedFilter;

  final List<Map<String, String>> upcomingTrips = [
    {'title': 'Paris', 'date': 'Sep 10-15', 'image': 'assets/paris.jpg'},
    {'title': 'Tokyo', 'date': 'Jan 5-10', 'image': 'assets/tokyo.jpg'},
    {'title': 'Sydney', 'date': 'Feb 20-25', 'image': 'assets/sydney.jpg'},
  ];

  final List<Map<String, String>> pastTrips = [
    {'title': 'Vietnam', 'date': 'Sep 1-5', 'image': 'assets/vietnam.jpg'},
    {'title': 'Dubai', 'date': 'Oct 12-15', 'image': 'assets/dubai.jpg'},
    {'title': 'London', 'date': 'Nov 3-8', 'image': 'assets/london.jpg'},
  ];

  @override
  void initState() {
    super.initState();
    _selectedFilter = widget.initialFilter; // Set initial filter from parameter
  }

  @override
  Widget build(BuildContext context) {
    List<Map<String, String>> displayedTrips =
        _selectedFilter == 'Upcoming' ? upcomingTrips : pastTrips;

    return Scaffold(
      appBar: AppBar(
        title: Text(_selectedFilter == 'Upcoming' ? 'Upcoming Trips' : 'Past Trips'),
      ),
      body: Column(
        children: [
          // Filter headers
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextButton(
                onPressed: () {
                  setState(() {
                    _selectedFilter = 'Upcoming';
                  });
                },
                child: Text(
                  'Upcoming',
                  style: TextStyle(
                    color: _selectedFilter == 'Upcoming' ? Colors.blue : Colors.black,
                    fontWeight: _selectedFilter == 'Upcoming' ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ),
              TextButton(
                onPressed: () {
                  setState(() {
                    _selectedFilter = 'Past';
                  });
                },
                child: Text(
                  'Past',
                  style: TextStyle(
                    color: _selectedFilter == 'Past' ? Colors.blue : Colors.black,
                    fontWeight: _selectedFilter == 'Past' ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ),
            ],
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: displayedTrips.map((trip) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: TripCard(
                      title: trip['title']!,
                      date: trip['date']!,
                      imagePath: trip['image']!,
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}