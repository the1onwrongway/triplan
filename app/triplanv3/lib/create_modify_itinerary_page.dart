import 'package:flutter/material.dart';

class CreateModifyItineraryPage extends StatefulWidget {
  final String title;
  final String dates;

  CreateModifyItineraryPage({required this.title, required this.dates});

  @override
  _CreateModifyItineraryPageState createState() => _CreateModifyItineraryPageState();
}

class _CreateModifyItineraryPageState extends State<CreateModifyItineraryPage> {
  String? selectedType;
  String? selectedSubType;
  final List<String> types = ['Hotel Stay', 'Travel Tickets', 'Activity', 'Visa', 'Rentals'];
  final Map<String, List<String>> subTypes = {
    'Travel Tickets': ['Flight', 'Train', 'Bus', 'Cab', 'Others'],
    'Rentals': ['Four-Wheeler', 'Two-Wheeler', 'Others']
  };

  final TextEditingController nameController = TextEditingController();
  final TextEditingController locationController = TextEditingController(); // Added location controller
  final TextEditingController dateController = TextEditingController();
  final TextEditingController timeController = TextEditingController();
  final TextEditingController costController = TextEditingController(); // Added cost controller
  final TextEditingController notesController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.dates,
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  builder: (context) => Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Add New Activity', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                          SizedBox(height: 16),
                          DropdownButtonFormField<String>(
                            decoration: InputDecoration(labelText: 'Type'),
                            value: selectedType,
                            items: types.map((type) {
                              return DropdownMenuItem(
                                value: type,
                                child: Text(type),
                              );
                            }).toList(),
                            onChanged: (value) {
                              setState(() {
                                selectedType = value;
                                selectedSubType = null; // Reset sub-type when the main type changes
                              });
                            },
                          ),
                          SizedBox(height: 16),
                          // Show the Sub-Type dropdown only if the selected type is Travel Tickets or Rentals
                          if (selectedType == 'Travel Tickets' || selectedType == 'Rentals')
                            DropdownButtonFormField<String>(
                              decoration: InputDecoration(labelText: 'Sub-Type'),
                              value: selectedSubType,
                              items: subTypes[selectedType]!.map((subType) {
                                return DropdownMenuItem(
                                  value: subType,
                                  child: Text(subType),
                                );
                              }).toList(),
                              onChanged: (value) {
                                setState(() {
                                  selectedSubType = value;
                                });
                              },
                            ),
                          SizedBox(height: 16),
                          TextFormField(
                            controller: nameController,
                            decoration: InputDecoration(labelText: 'Name'),
                          ),
                          SizedBox(height: 16),
                          TextFormField(
                            controller: locationController, // Location field
                            decoration: InputDecoration(labelText: 'Location'),
                          ),
                          SizedBox(height: 16),
                          TextFormField(
                            controller: costController, // Cost field
                            decoration: InputDecoration(labelText: 'Cost'),
                          ),
                          SizedBox(height: 16),
                          TextFormField(
                            controller: dateController,
                            decoration: InputDecoration(
                              labelText: 'Date',
                              suffixIcon: Icon(Icons.calendar_today),
                            ),
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
                          SizedBox(height: 16),
                          TextFormField(
                            controller: timeController,
                            decoration: InputDecoration(
                              labelText: 'Time',
                              suffixIcon: Icon(Icons.access_time),
                            ),
                            onTap: () async {
                              FocusScope.of(context).requestFocus(FocusNode());
                              TimeOfDay? pickedTime = await showTimePicker(
                                context: context,
                                initialTime: TimeOfDay.now(),
                              );
                              if (pickedTime != null) {
                                setState(() {
                                  timeController.text = pickedTime.format(context);
                                });
                              }
                            },
                          ),
                          SizedBox(height: 16),
                          TextFormField(
                            decoration: InputDecoration(labelText: 'Files (PDF, JPG, JPEG)',
                            suffixIcon: Icon(Icons.attach_file)),
                            readOnly: true,
                            onTap: () {
                              // Implement file picker functionality
                            },
                          ),
                          SizedBox(height: 16),
                          TextFormField(
                            controller: notesController,
                            decoration: InputDecoration(labelText: 'Notes'),
                            maxLines: 3,
                          ),
                          SizedBox(height: 20),
                          ElevatedButton(
                            onPressed: () {
                              // Implement save functionality
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Activity saved successfully!')),
                              );
                            },
                            child: Text('Save'),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
              child: Text('Add Activity'),
            ),
          ],
        ),
      ),
    );
  }
}