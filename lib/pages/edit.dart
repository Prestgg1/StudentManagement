import 'package:flutter/material.dart';
import 'package:student_management/db/database_helper.dart';

class EditStudentDialog extends StatefulWidget {
  final Map<String, dynamic> student;
  final VoidCallback onUpdated;

  const EditStudentDialog({
    super.key,
    required this.student,
    required this.onUpdated,
  });

  @override
  State<EditStudentDialog> createState() => _EditStudentDialogState();
}

class _EditStudentDialogState extends State<EditStudentDialog> {
  final db = DatabaseHelper();
  late TextEditingController firstNameController;
  late TextEditingController lastNameController;

  List<Map<String, dynamic>> subjects = [];
  List<int> selectedSubjects = [];

  @override
  void initState() {
    super.initState();
    firstNameController = TextEditingController(
      text: widget.student['firstName'],
    );
    lastNameController = TextEditingController(
      text: widget.student['lastName'],
    );

    _loadSubjects();
  }

  Future<void> _loadSubjects() async {
    final allSubjects = await db.getAllSubjects();
    final studentSubjects = await db.getSubjectsByStudentId(
      widget.student['id'],
    );

    setState(() {
      subjects = allSubjects;
      selectedSubjects = studentSubjects;
    });
  }

  void _save() async {
    if (firstNameController.text.isEmpty || lastNameController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Ad və soyad boş ola bilməz!")),
      );
      return;
    }

    // Ad və soyadı yenilə
    await db.updateStudent(widget.student['id'], {
      'firstName': firstNameController.text,
      'lastName': lastNameController.text,
    });

    // Seçilmiş fənləri yenilə
    await db.updateStudentSubjects(widget.student['id'], selectedSubjects);

    widget.onUpdated();
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text("Tələbəni yenilə"),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: firstNameController,
              decoration: const InputDecoration(labelText: "Ad"),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: lastNameController,
              decoration: const InputDecoration(labelText: "Soyad"),
            ),
            const SizedBox(height: 16),
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "Fənnlər",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 8),
            subjects.isEmpty
                ? const CircularProgressIndicator()
                : Expanded(
                    child: ListView(
                      shrinkWrap: true,
                      children: subjects
                          .map(
                            (sub) => CheckboxListTile(
                              title: Text(sub['name']),
                              value: selectedSubjects.contains(sub['id']),
                              onChanged: (val) {
                                setState(() {
                                  if (val == true) {
                                    selectedSubjects.add(sub['id'] as int);
                                  } else {
                                    selectedSubjects.remove(sub['id'] as int);
                                  }
                                });
                              },
                            ),
                          )
                          .toList(),
                    ),
                  ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text("Ləğv et"),
        ),
        ElevatedButton(onPressed: _save, child: const Text("Yadda saxla")),
      ],
    );
  }
}
