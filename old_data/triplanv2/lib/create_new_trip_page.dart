import 'package:flutter/material.dart';

class CreateNewTripPage extends StatefulWidget {
  @override
  _CreateNewTripPageState createState() => _CreateNewTripPageState();
}

class _CreateNewTripPageState extends State<CreateNewTripPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _tripNameController = TextEditingController();
  final TextEditingController _destinationController = TextEditingController();
  DateTime? _startDate;
  DateTime? _endDate;
  List<String> _selectedCoTravelers = [];
  List<String> availableCoTravelers = ['Alice', 'Bob', 'Charlie', 'David']; // Sample data

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create New Trip'),
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: () {
              if (_formKey.currentState!.validate() && _startDate != null && _endDate != null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Trip created successfully!')),
                );
                // Handle the form submission logic here
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please fill all mandatory fields')),
                );
              }
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Trip Information', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              TextFormField(
                controller: _tripNameController,
                decoration: const InputDecoration(labelText: 'Trip Name'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Trip Name is required';
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: _destinationController,
                decoration: const InputDecoration(labelText: 'Destination'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Destination is required';
                  }
                  return null;
                },
              ),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () async {
                        DateTime? pickedDate = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime(2000),
                          lastDate: DateTime(2100),
                        );
                        if (pickedDate != null) {
                          setState(() {
                            _startDate = pickedDate;
                          });
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 15.0),
                        decoration: BoxDecoration(
                          border: Border(bottom: BorderSide(color: Colors.grey)),
                        ),
                        child: Text(
                          _startDate != null
                              ? 'Start Date: ${_startDate!.toLocal().toString().split(' ')[0]}'
                              : 'Select Start Date',
                          style: const TextStyle(color: Colors.black54),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: GestureDetector(
                      onTap: () async {
                        DateTime? pickedDate = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime(2000),
                          lastDate: DateTime(2100),
                        );
                        if (pickedDate != null) {
                          setState(() {
                            _endDate = pickedDate;
                          });
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 15.0),
                        decoration: BoxDecoration(
                          border: Border(bottom: BorderSide(color: Colors.grey)),
                        ),
                        child: Text(
                          _endDate != null
                              ? 'End Date: ${_endDate!.toLocal().toString().split(' ')[0]}'
                              : 'Select End Date',
                          style: const TextStyle(color: Colors.black54),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'Select Co-Travelers (Optional)'),
                items: availableCoTravelers.map((String coTraveler) {
                  return DropdownMenuItem<String>(
                    value: coTraveler,
                    child: Text(coTraveler),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null && !_selectedCoTravelers.contains(value)) {
                    setState(() {
                      _selectedCoTravelers.add(value);
                    });
                  }
                },
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8.0,
                children: _selectedCoTravelers.map((coTraveler) {
                  return Chip(
                    label: Text(coTraveler),
                    onDeleted: () {
                      setState(() {
                        _selectedCoTravelers.remove(coTraveler);
                      });
                    },
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}