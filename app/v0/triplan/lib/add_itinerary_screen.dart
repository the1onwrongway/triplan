import 'package:flutter/material.dart';

class AddItineraryScreen extends StatelessWidget {
  AddItineraryScreen({super.key});

  final TextEditingController titleController = TextEditingController();
  final TextEditingController dateController = TextEditingController();
  final TextEditingController locationController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add New Itinerary'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: titleController,
              decoration: const InputDecoration(
                labelText: 'Title',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: dateController,
              decoration: const InputDecoration(
                labelText: 'Date',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: locationController,
              decoration: const InputDecoration(
                labelText: 'Location',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                // Handle save itinerary logic here
                final title = titleController.text;
                final date = dateController.text;
                final location = locationController.text;

                if (title.isNotEmpty && date.isNotEmpty && location.isNotEmpty) {
                  // Save the itinerary data or pass it to the appropriate logic
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Itinerary "$title" added successfully!')),
                  );
                  Navigator.pop(context); // Close the page after saving
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Please fill out all fields')),
                  );
                }
              },
              child: const Text('Save Itinerary'),
            ),
          ],
        ),
      ),
    );
  }
}