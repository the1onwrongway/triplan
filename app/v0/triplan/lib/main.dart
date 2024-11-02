import 'package:flutter/material.dart';
import 'itinerary_screen.dart';
import 'trip_card.dart';
import 'documents.dart';
import 'contacts_screen.dart';

void main() {
  runApp(TriplanApp());
}

class TriplanApp extends StatelessWidget {
  const TriplanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Triplan',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  String _currentFilter = 'Upcoming';

  final List<String> _screenTitles = [
    'Dashboard',     // Title for HomeScreenContent
    'Itineraries',   // Title for ItineraryScreen
    'Documents',     // Title for DocumentsScreen
    'Emergency'      // Title for EmergencyContactsScreen
  ];

  final List<Widget> _screens = [];

  @override
  void initState() {
    super.initState();
    _screens.addAll([
      HomeScreenContent(onNavigateToItinerary: _onNavigateToItinerary),
      ItineraryScreen(showAllTrips: true, initialFilter: _currentFilter),
      DocumentsScreen(), // Updated to use the correct DocumentsScreen
      ContactsScreen()
    ]);
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  void _onNavigateToItinerary(int index, String filter) {
    setState(() {
      _selectedIndex = index;
      _currentFilter = filter;
      _screens[1] = ItineraryScreen(showAllTrips: true, initialFilter: _currentFilter);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_screenTitles[_selectedIndex]), // Dynamic title
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        actions: [
          const Padding(
            padding: EdgeInsets.only(right: 8.0),
            child: CircleAvatar(
              radius: 18,
              backgroundImage: AssetImage('assets/profile.jpg'),
            ),
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(
                color: Colors.blue,
              ),
              margin: const EdgeInsets.only(bottom: 0),
              child: Padding(
                padding: const EdgeInsets.only(top: 0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () {
                        Navigator.pop(context); // Closes the drawer
                      },
                    ),
                    const Text(
                      'Quick Actions',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.add),
              title: const Text('Create Itinerary'),
              onTap: () {
                Navigator.pop(context);
                // Handle create itinerary action
              },
            ),
            ListTile(
              leading: const Icon(Icons.upload_file),
              title: const Text('Upload Documents'),
              onTap: () {
                Navigator.pop(context);
                // Handle upload documents action
              },
            ),
            ListTile(
              leading: const Icon(Icons.place),
              title: const Text('View Saved Places'),
              onTap: () {
                Navigator.pop(context);
                // Handle view saved places action
              },
            ),
          ],
        ),
      ),
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Itinerary'),
          BottomNavigationBarItem(icon: Icon(Icons.folder), label: 'Documents'),
          BottomNavigationBarItem(icon: Icon(Icons.phone), label: 'Emergency')
        ],
      ),
    );
  }
}

// HomeScreenContent shows the first trip only
class HomeScreenContent extends StatelessWidget {
  final Function(int, String) onNavigateToItinerary;

  const HomeScreenContent({super.key, required this.onNavigateToItinerary});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Upcoming Trips', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          const TripCard(title: 'Paris', date: 'Dec 10-15', imagePath: 'assets/paris.jpg'),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () {
                onNavigateToItinerary(1, 'Upcoming'); // Navigate to ItineraryScreen with 'Upcoming' filter
              },
              child: const Text('View All'),
            ),
          ),
          const SizedBox(height: 16),
          const Text('Past Trips', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          const TripCard(title: 'Vietnam', date: 'Sep 1-5', imagePath: 'assets/vietnam.jpg'),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () {
                onNavigateToItinerary(1, 'Past'); // Navigate to ItineraryScreen with 'Past' filter
              },
              child: const Text('View All'),
            ),
          ),
        ],
      ),
    );
  }
}