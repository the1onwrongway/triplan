import 'package:flutter/material.dart';

class ParisTripDetailsPage extends StatefulWidget {
  @override
  _ParisTripDetailsPageState createState() => _ParisTripDetailsPageState();
}

class _ParisTripDetailsPageState extends State<ParisTripDetailsPage> {
  final List<Map<String, dynamic>> activities = [
    {
      'date': 'Dec 10 - Monday',
      'activities': [
        {'title': 'Flight from Ahmedabad', 'time': '8:00 AM', 'icon': Icons.flight, 'color': Colors.blue, 'completed': false},
        {'title': 'Hotel Stay', 'time': '11:00 AM', 'icon': Icons.hotel, 'color': Colors.purple, 'completed': false},
      ],
    },
    {
      'date': 'Dec 11 - Tuesday',
      'activities': [
        {'title': 'Eiffel Tower Visit', 'time': '10:00 AM', 'icon': Icons.local_activity, 'color': Colors.pink, 'completed': false},
      ],
    },
    {
      'date': 'Dec 12 - Wednesday',
      'activities': [
        {'title': 'Museum Tour', 'time': '1:00 PM', 'icon': Icons.local_activity, 'color': Colors.pink, 'completed': false},
        {'title': 'Wine Tasting', 'time': '3:00 PM', 'icon': Icons.local_activity, 'color': Colors.pink, 'completed': false},
        {'title': 'Train to City 2', 'time': '6:00 PM', 'icon': Icons.train, 'color': Colors.green, 'completed': false},
      ],
    },
    {
      'date': 'Dec 13 - Thursday',
      'activities': [
        {'title': 'Hotel Stay in City 2', 'time': '8:00 AM', 'icon': Icons.hotel, 'color': Colors.purple, 'completed': false},
        {'title': 'Scooter Rental', 'time': '9:30 AM', 'icon': Icons.two_wheeler, 'color': Colors.blueGrey, 'completed': false},
        {'title': 'City Tour', 'time': '11:00 AM', 'icon': Icons.local_activity, 'color': Colors.pink, 'completed': false},
        {'title': 'Dinner Cruise', 'time': '7:00 PM', 'icon': Icons.local_activity, 'color': Colors.pink, 'completed': false},
        {'title': 'Bus to City 3', 'time': '9:00 PM', 'icon': Icons.directions_bus, 'color': Colors.orange, 'completed': false},
      ],
    },
    {
      'date': 'Dec 14 - Friday',
      'activities': [
        {'title': 'Hotel Stay in City 3', 'time': '8:00 AM', 'icon': Icons.hotel, 'color': Colors.purple, 'completed': false},
        {'title': 'Car Rental', 'time': '8:00 AM', 'icon': Icons.directions_car, 'color': Colors.blueGrey, 'completed': false},
        {'title': 'City Walking Tour', 'time': '10:00 AM', 'icon': Icons.local_activity, 'color': Colors.pink, 'completed': false},
        {'title': 'Club Hopping', 'time': '9:00 PM', 'icon': Icons.local_activity, 'color': Colors.pink, 'completed': false},
      ],
    },
    {
      'date': 'Dec 15 - Saturday',
      'activities': [
        {'title': 'Flight to Ahmedabad', 'time': '08:00 AM', 'icon': Icons.flight, 'color': Colors.blue, 'completed': false},
      ],
    },
  ];

  @override
  Widget build(BuildContext context) {
    double totalActivities = activities.fold(
      0,
      (sum, day) => sum + (day['activities'] as List).length,
    ).toDouble();
    double completedCount = activities.fold(
      0,
      (sum, day) => sum + (day['activities'] as List).where((activity) => activity['completed']).length,
    ).toDouble();
    double progress = totalActivities == 0 ? 0 : completedCount / totalActivities;

    return Scaffold(
      appBar: AppBar(
        title: Text('Paris Trip Details'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: LinearProgressIndicator(value: progress),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text('${(progress * 100).toStringAsFixed(0)}% completed', style: TextStyle(fontSize: 16)),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: activities.length,
              itemBuilder: (context, index) {
                final dayActivities = activities[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Text(
                          dayActivities['date'],
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ),
                      ...dayActivities['activities'].map<Widget>((activity) {
                        return Card(
                          color: activity['completed'] ? Colors.grey : activity['color'],
                          margin: EdgeInsets.symmetric(vertical: 4, horizontal: 16),
                          child: ListTile(
                            leading: Icon(activity['icon'], size: 40, color: Colors.white),
                            title: Text(activity['title'], style: TextStyle(color: Colors.white, fontSize: 18)),
                            subtitle: Text(activity['time'], style: TextStyle(color: Colors.white70)),
                            trailing: Checkbox(
                              value: activity['completed'],
                              onChanged: (bool? value) {
                                setState(() {
                                  activity['completed'] = value!;
                                });
                              },
                            ),
                          ),
                        );
                      }).toList(),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}