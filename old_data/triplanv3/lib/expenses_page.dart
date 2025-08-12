import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart'; // Make sure you have this package in your pubspec.yaml

class ExpensesScreen extends StatefulWidget {
  @override
  _ExpensesScreenState createState() => _ExpensesScreenState();
}

class _ExpensesScreenState extends State<ExpensesScreen> {
  String selectedTrip = 'Vietnam Trip'; // Default selected trip

  final Map<String, List<Map<String, dynamic>>> tripExpenses = {
    'Vietnam Trip': [
      {'name': 'Hotel Stay', 'category': 'Accommodation', 'date': 'Sep 1, 2024', 'amount': 150.00},
      {'name': 'Flight Ticket', 'category': 'Transport', 'date': 'Aug 31, 2024', 'amount': 300.00},
      {'name': 'Museum Entry', 'category': 'Activities', 'date': 'Sep 2, 2024', 'amount': 20.00},
      {'name': 'Dinner', 'category': 'Meals', 'date': 'Sep 1, 2024', 'amount': 45.00},
      {'name': 'City Tour', 'category': 'Activities', 'date': 'Sep 3, 2024', 'amount': 75.00},
    ],
    'Paris Trip': [
      {'name': 'Hotel Stay', 'category': 'Accommodation', 'date': 'Dec 10, 2024', 'amount': 200.00},
      {'name': 'Eiffel Tower Visit', 'category': 'Activities', 'date': 'Dec 11, 2024', 'amount': 30.00},
      {'name': 'Dinner Cruise', 'category': 'Meals', 'date': 'Dec 13, 2024', 'amount': 100.00},
    ],
    'Tokyo Trip': [
      {'name': 'Sushi Dinner', 'category': 'Meals', 'date': 'Feb 5, 2024', 'amount': 60.00},
      {'name': 'Bullet Train', 'category': 'Transport', 'date': 'Feb 6, 2024', 'amount': 120.00},
    ],
  };

  @override
  Widget build(BuildContext context) {
    List<Map<String, dynamic>> expenses = tripExpenses[selectedTrip] ?? [];
    double totalExpenses = expenses.fold(0, (sum, item) => sum + item['amount']);

    return Scaffold(
      //appBar: AppBar(),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Dropdown for selecting a trip
            DropdownButton<String>(
              value: selectedTrip,
              items: tripExpenses.keys.map((String trip) {
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
            SizedBox(height: 16),
            // Overview with a budget progress bar
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Total Expenses', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    SizedBox(height: 8),
                    Text('\$${totalExpenses.toStringAsFixed(2)}', style: TextStyle(fontSize: 24, color: Colors.blue)),
                    SizedBox(height: 16),
                    LinearProgressIndicator(
                      value: (totalExpenses / 1000).clamp(0.0, 1.0),
                      backgroundColor: Colors.grey[300],
                      color: totalExpenses > 1000 ? Colors.red : Colors.blue,
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16),
            // List of expenses with a detailed view on tap
            Expanded(
              child: ListView.builder(
                itemCount: expenses.length,
                itemBuilder: (context, index) {
                  final expense = expenses[index];
                  return Card(
                    margin: EdgeInsets.symmetric(vertical: 8),
                    child: ListTile(
                      leading: Icon(Icons.attach_money, color: Colors.green),
                      title: Text(expense['name'], style: TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('${expense['category']} - ${expense['date']}'),
                      trailing: Text('\$${expense['amount'].toStringAsFixed(2)}', style: TextStyle(color: Colors.green)),
                      onTap: () {
                        _showExpenseDetails(context, expense);
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showExpenseDetails(BuildContext context, Map<String, dynamic> expense) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(expense['name']),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Category: ${expense['category']}'),
              Text('Date: ${expense['date']}'),
              Text('Amount: \$${expense['amount'].toStringAsFixed(2)}'),
            ],
          ),
          actions: <Widget>[
            TextButton(
              child: Text('Close'),
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