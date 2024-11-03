import 'package:flutter/material.dart';

class UploadDocumentPage extends StatefulWidget {
  @override
  _UploadDocumentPageState createState() => _UploadDocumentPageState();
}

class _UploadDocumentPageState extends State<UploadDocumentPage> {
  String? selectedType;
  final List<String> types = ['Hotel Stay', 'Travel Tickets', 'Activity', 'Visa', 'Rentals'];
  final TextEditingController notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Show the bottom sheet as soon as the page is loaded
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _showUploadDocumentBottomSheet();
    });
  }

  void _showUploadDocumentBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Upload Document', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
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
                  });
                },
              ),
              SizedBox(height: 16),
              TextFormField(
                decoration: InputDecoration(
                  labelText: 'File (PDF, JPG, JPEG)',
                  suffixIcon: Icon(Icons.attach_file),
                ),
                readOnly: true,
                onTap: () {
                  // Implement file picker functionality here
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
                    SnackBar(content: Text('Document uploaded successfully!')),
                  );
                },
                child: Text('Upload'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Upload Document'),
      ),
      body: Center(
        child: Text('Upload Document Page'),
      ),
    );
  }
}