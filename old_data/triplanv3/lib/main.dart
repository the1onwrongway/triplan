import 'package:flutter/material.dart';
import 'itinerary_screen.dart';
import 'trip_card.dart';
import 'documents.dart';
import 'contacts_screen.dart';
import 'create_new_trip_page.dart';
import 'profile_page.dart';
import 'paris_trip_details_page.dart';
import 'upload_document_page.dart';
import 'add_contact.dart';
import 'expenses_page.dart'; // Import the ExpensesPage widget

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
  String selectedTrip = 'Vietnam Trip'; // Default selected trip

  final List<String> _screenTitles = [
    'Dashboard',
    'Itineraries',
    'Documents',
    'Contacts',
    'Expenses' // Title for ExpensesPage
  ];

  final List<String> trips = ['Vietnam Trip', 'Paris Trip', 'Tokyo Trip'];

  final List<Widget> _screens = [];

  @override
  void initState() {
    super.initState();
    _screens.addAll([
      HomeScreenContent(onNavigateToItinerary: _onNavigateToItinerary),
      ItineraryScreen(showAllTrips: true, initialFilter: _currentFilter),
      DocumentsScreen(),
      ContactsScreen(),
      ExpensesScreen() // Add ExpensesPage to the list of screens
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
        title: Text(_screenTitles[_selectedIndex]),
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        actions: [
          if (_selectedIndex == 1)
            IconButton(
              icon: Icon(Icons.add),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => CreateNewTripPage()),
                );
              },
            ),
          if (_selectedIndex == 2)
            IconButton(
              icon: Icon(Icons.add),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => UploadDocumentPage()),
                );
              },
            ),
          if (_selectedIndex == 3)
            IconButton(
              icon: Icon(Icons.add),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => AddContactPage()),
                );
              },
            ),
          // Add Expense Button
          if (_selectedIndex == 4)
            IconButton(
              icon: Icon(Icons.add),
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  builder: (BuildContext context) {
                    String selectedTrip = trips[0]; // Default selected trip
                    TextEditingController dateController = TextEditingController();
                    TextEditingController expenseNameController = TextEditingController();
                    TextEditingController categoryController = TextEditingController();
                    TextEditingController amountController = TextEditingController();

                    return Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Add New Expense',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          DropdownButton<String>(
                            value: selectedTrip,
                            items: trips.map((String trip) {
                              return DropdownMenuItem<String>(
                                value: trip,
                                child: Text(trip),
                              );
                            }).toList(),
                            onChanged: (String? newValue) {
                              setState(() {
                                selectedTrip = newValue!;
                              });
                            },
                          ),
                          TextField(
                            controller: expenseNameController,
                            decoration: InputDecoration(labelText: 'Expense Name'),
                          ),
                          TextField(
                            controller: categoryController,
                            decoration: InputDecoration(labelText: 'Category'),
                          ),
                          TextField(
                            controller: dateController,
                            decoration: InputDecoration(labelText: 'Date'),
                            onTap: () async {
                              FocusScope.of(context).requestFocus(FocusNode());
                              DateTime? pickedDate = await showDatePicker(
                                context: context,
                                initialDate: DateTime.now(),
                                firstDate: DateTime(2000),
                                lastDate: DateTime(2101),
                              );
                              if (pickedDate != null) {
                                setState(() {
                                  dateController.text = "${pickedDate.toLocal()}".split(' ')[0];
                                });
                              }
                            },
                          ),
                          TextField(
                            controller: amountController,
                            decoration: InputDecoration(labelText: 'Amount (\$)'),
                            keyboardType: TextInputType.number,
                          ),
                          SizedBox(height: 10),
                          ElevatedButton(
                            onPressed: () {
                              // Add logic to handle expense addition
                              Navigator.pop(context);
                            },
                            child: Text('Add Expense'),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => ProfilePage()),
              );
            },
            child: const Padding(
              padding: EdgeInsets.only(right: 8.0),
              child: CircleAvatar(
                radius: 18,
                backgroundImage: AssetImage('assets/profile.jpg'),
              ),
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
                        Navigator.pop(context);
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
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => CreateNewTripPage()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.upload_file),
              title: const Text('Upload Documents'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => UploadDocumentPage()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.place),
              title: const Text('View Saved Places'),
              onTap: () {
                Navigator.pop(context);
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
          BottomNavigationBarItem(icon: Icon(Icons.phone), label: 'Contacts'),
          BottomNavigationBarItem(icon: Icon(Icons.money), label: 'Expenses') // Add the new tab
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
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => ParisTripDetailsPage()),
              );
            },
            child: const TripCard(title: 'Paris', date: 'Dec 10-15', imagePath: 'assets/paris.jpg'),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () {
                onNavigateToItinerary(1, 'Upcoming');
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
                onNavigateToItinerary(1, 'Past');
              },
              child: const Text('View All'),
            ),
          ),
        ],
      ),
    );
  }
}