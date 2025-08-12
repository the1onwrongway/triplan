import 'package:flutter/material.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Profile'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 50,
              backgroundImage: AssetImage('assets/profile.jpg'),
            ),
            SizedBox(height: 16),
            Text(
              'Milan Gabriel',
              style: TextStyle(fontSize: 20),
            ),
            SizedBox(height: 8),
            Text(
              'Member Since: Sep 2024',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            Text(
              'Co-Travellers:',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Expanded(
              child: ListView(
                children: [
                  _buildCoTravelerTile(context, 'Alice', 'Member Since Jan 2023', 3),
                  _buildCoTravelerTile(context, 'Bob', 'Member Since Mar 2022', 5),
                  _buildCoTravelerTile(context, 'Charlie', 'Member Since Jul 2021', 2),
                  _buildCoTravelerTile(context, 'David', 'Member Since Nov 2020', 4),
                ],
              ),
            ),
            SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue, // Change the color if needed
                  ),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Invite copied to clipboard!')),
                    );
                  },
                  child: Text('Invite'),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                  ),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Logging out...')),
                    );
                  },
                  child: Text('Logout'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCoTravelerTile(BuildContext context, String name, String userSince, int tripCount) {
    return ListTile(
      title: Text(name, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
      subtitle: Text(userSince, style: TextStyle(color: Colors.grey[600])),
      trailing: Text('Trips: $tripCount', style: TextStyle(fontWeight: FontWeight.bold)),
      onTap: () {
        // Show a dialog or navigate to another screen with user details
        _showUserDetails(context, name, userSince, tripCount);
      },
    );
  }

  void _showUserDetails(BuildContext context, String name, String userSince, int tripCount) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(name),
          content: Text('$userSince\nTrips taken together: $tripCount'),
          actions: <Widget>[
            TextButton(
              child: Text('OK'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }
}