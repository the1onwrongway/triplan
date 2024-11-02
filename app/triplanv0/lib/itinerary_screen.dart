import 'package:flutter/material.dart';
import 'trip_card.dart'; // Import TripCard from the separate file
import 'create_modify_itinerary_page.dart'; // Import the new page

class ItineraryScreen extends StatefulWidget {
  final bool showAllTrips;
  final String initialFilter; // Parameter for initial filter

  ItineraryScreen({super.key, required this.showAllTrips, required this.initialFilter});

  @override
  _ItineraryScreenState createState() => _ItineraryScreenState();
}

class _ItineraryScreenState extends State<ItineraryScreen> {
  late String _selectedFilter;

  final List<Map<String, String>> upcomingTrips = [
    {'title': 'Paris', 'date': 'Dec 10-15', 'image': 'assets/paris.jpg'},
    {'title': 'Tokyo', 'date': 'Feb 5-10', 'image': 'assets/tokyo.jpg'},
    {'title': 'Sydney', 'date': 'May 20-25', 'image': 'assets/sydney.jpg'},
  ];

  final List<Map<String, String>> pastTrips = [
    {'title': 'London', 'date': 'Nov 3-8', 'image': 'assets/london.jpg'},
    {'title': 'Dubai', 'date': 'Oct 12-15', 'image': 'assets/dubai.jpg'},
    {'title': 'Vietnam', 'date': 'Sep 1-5', 'image': 'assets/vietnam.jpg'},
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
                  return GestureDetector(
                    onTap: () {
                      if (trip['title'] == 'Tokyo') {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => CreateModifyItineraryPage(
                              title: 'Tokyo Drift',
                              dates: 'Feb 5 - 10',
                            ),
                          ),
                        );
                      }
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: TripCard(
                        title: trip['title']!,
                        date: trip['date']!,
                        imagePath: trip['image']!,
                      ),
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