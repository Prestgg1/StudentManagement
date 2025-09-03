import 'package:flutter/material.dart';
import 'package:student_management/db/database_helper.dart';
import 'package:student_management/main.dart';
import 'package:student_management/pages/edit.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final db = DatabaseHelper();
  List<Map<String, dynamic>> students = [];
  List<Map<String, dynamic>> filteredStudents = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _refreshStudents();
    _searchController.addListener(_onSearchChanged);
  }

  void _depositPayment(Map<String, dynamic> student) async {
    final dbClient = db;
    final amountController = TextEditingController();

    // Tələbənin borcunu hesabla
    double debt = await dbClient.getStudentDebt(student['id']);

    // Ödəniş üçün ay seçimi (YYYY-MM)
    String? selectedMonth;
    final now = DateTime.now();
    final months = List.generate(12, (i) {
      final date = DateTime(now.year, i + 1);
      return "${date.year}-${date.month.toString().padLeft(2, '0')}";
    });

    // Tələbənin artıq ödədiyi aylar
    final payments = await dbClient.getPaymentsByStudent(student['id']);
    final paidMonths = payments.map((p) => p['month'] as String).toList();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          "${student['firstName']} ${student['lastName']} üçün ödəniş",
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (debt > 0)
              Text(
                "Borcu: ${debt.toStringAsFixed(2)} ₼",
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: selectedMonth,
              decoration: const InputDecoration(
                labelText: "Ay seçin",
                border: OutlineInputBorder(),
              ),
              items: months.map((m) {
                final isPaid = paidMonths.contains(m);
                return DropdownMenuItem(
                  value: m,
                  enabled: !isPaid,
                  child: Text(
                    m + (isPaid ? " (ödənib)" : ""),
                    style: TextStyle(
                      color: isPaid ? Colors.grey : Colors.black,
                    ),
                  ),
                );
              }).toList(),
              onChanged: (val) {
                selectedMonth = val;
              },
            ),
            const SizedBox(height: 12),
            TextField(
              controller: amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: "Məbləğ (₼)",
                prefixIcon: Icon(Icons.monetization_on),
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.close),
            label: const Text("İmtina"),
            onPressed: () => Navigator.pop(ctx),
          ),
          ElevatedButton.icon(
            icon: const Icon(Icons.check),
            label: const Text("Yadda saxla"),
            onPressed: () async {
              if (selectedMonth == null || amountController.text.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Ay və məbləği seçin!")),
                );
                return;
              }

              final newAmount = double.tryParse(amountController.text) ?? 0;

              await dbClient.addPayment(
                student['id'],
                selectedMonth!,
                newAmount,
              );
              _refreshStudents();

              Navigator.pop(ctx);
            },
          ),
        ],
      ),
    );
  }

  void _refreshStudents() async {
    final data = await db.getStudents();
    setState(() {
      students = data;
      filteredStudents = data;
    });
  }

  void _onSearchChanged() {
    String query = _searchController.text.toLowerCase();
    setState(() {
      filteredStudents = students.where((student) {
        final first = student['firstName'].toString().toLowerCase();
        final last = student['lastName'].toString().toLowerCase();
        final id = student['id'].toString();
        return first.contains(query) ||
            last.contains(query) ||
            id.contains(query);
      }).toList();
    });
  }

  Future<void> _deleteStudent(int id) async {
    await db.deleteStudent(id);
    _refreshStudents();
  }

  void _editStudent(Map<String, dynamic> student) {
    showDialog(
      context: context,
      builder: (ctx) => EditStudentDialog(
        student: student,
        onUpdated: _refreshStudents, // yenilənmə funksiyası
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      currentIndex: 0,
      child: CustomScrollView(
        slivers: [
          const SliverAppBar(
            pinned: true,
            title: Text('Şagird idarəetmə sistemi'),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Qeydiyyatda olan şagirdlər",
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: "Axtar...",
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      filled: true,
                      fillColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverToBoxAdapter(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: 8,
                      offset: const Offset(2, 4),
                    ),
                  ],
                  color: Colors.white,
                ),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,

                  child: SizedBox(
                    width: MediaQuery.of(context).size.width,
                    child: DataTable(
                      headingRowColor: WidgetStateProperty.all(
                        Theme.of(context).primaryColor,
                      ),
                      headingTextStyle: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                      dataRowColor: WidgetStateProperty.all(Colors.orange[200]),
                      dataTextStyle: const TextStyle(color: Colors.black87),
                      columns: const [
                        DataColumn(label: Text('ID')),
                        DataColumn(label: Text('Ad')),
                        DataColumn(label: Text('Soyad')),
                        DataColumn(label: Text('Qeydiyyat tarixi')),
                        DataColumn(label: Text('Son ödəniş tarixi')),
                        DataColumn(label: Text('Ödəniş məbləği')),
                        DataColumn(label: Text('Borc')),
                        DataColumn(label: Text('Ödənilən/Aylıq status')),
                        DataColumn(label: Text('Fənlər')),
                        DataColumn(label: Text('Əməliyyatlar')),
                      ],

                      rows: filteredStudents.map((student) {
                        return DataRow(
                          cells: [
                            DataCell(Text(student['id'].toString())),
                            DataCell(Text(student['firstName'])),
                            DataCell(Text(student['lastName'])),
                            DataCell(Text(student['registrationDate'])),
                            DataCell(Text(student['paymentDate'] ?? "-")),
                            DataCell(
                              Text(
                                "${student['amount']} ₼",
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            // BORC SÜTUNU
                            DataCell(
                              FutureBuilder<double>(
                                future: db.getStudentDebt(student['id']),
                                builder: (context, snapshot) {
                                  if (!snapshot.hasData) return const Text("-");
                                  return Text(
                                    "${snapshot.data!.toStringAsFixed(2)} ₼",
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.red,
                                    ),
                                  );
                                },
                              ),
                            ),
                            // ÖDƏNİŞ STATUSU SÜTUNU
                            DataCell(
                              FutureBuilder<List<Map<String, dynamic>>>(
                                future: db.getPaymentsByStudent(student['id']),
                                builder: (context, snapshot) {
                                  if (!snapshot.hasData) return const Text("-");
                                  final paidMonths = snapshot.data!
                                      .map((p) => p['month'] as String)
                                      .toList();
                                  final now = DateTime.now();
                                  final months = List.generate(12, (i) {
                                    final date = DateTime(now.year, i + 1);
                                    return "${date.year}-${date.month.toString().padLeft(2, '0')}";
                                  });
                                  return Row(
                                    children: months.map((m) {
                                      final isPaid = paidMonths.contains(m);
                                      return Container(
                                        margin: const EdgeInsets.symmetric(
                                          horizontal: 1,
                                        ),
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 4,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: isPaid
                                              ? Colors.green[200]
                                              : Colors.red[200],
                                          borderRadius: BorderRadius.circular(
                                            4,
                                          ),
                                        ),
                                        child: Text(
                                          m.split(
                                            '-',
                                          )[1], // sadəcə ay nömrəsini göstər
                                          style: const TextStyle(fontSize: 12),
                                        ),
                                      );
                                    }).toList(),
                                  );
                                },
                              ),
                            ),
                            DataCell(
                              SizedBox(
                                width: 100,
                                child: Text(student['subjects'] ?? "-"),
                              ),
                            ),
                            DataCell(
                              Row(
                                mainAxisAlignment: MainAxisAlignment.start,
                                children: [
                                  ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.blue.shade600,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 8,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                    ),
                                    icon: const Icon(Icons.edit),
                                    label: const Text("Düzəlt"),
                                    onPressed: () => _editStudent(student),
                                  ),
                                  const SizedBox(width: 8),
                                  ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.red.shade600,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 8,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                    ),
                                    icon: const Icon(Icons.delete),
                                    label: const Text("Sil"),
                                    onPressed: () =>
                                        _deleteStudent(student['id']),
                                  ),
                                  const SizedBox(width: 8),
                                  ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.green.shade600,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 8,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                    ),
                                    icon: const Icon(Icons.attach_money),
                                    label: const Text("Ödəniş"),
                                    onPressed: () => _depositPayment(student),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
