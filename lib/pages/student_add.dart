import 'package:student_management/db/database_helper.dart';
import 'package:flutter/material.dart';
import 'package:student_management/main.dart';
import 'package:intl/intl.dart';

// ✅ Student Add Page
class StudentAddPage extends StatefulWidget {
  const StudentAddPage({super.key});
  @override
  State<StudentAddPage> createState() => _StudentAddPageState();
}

class _StudentAddPageState extends State<StudentAddPage> {
  final db = DatabaseHelper();
  final _formKey = GlobalKey<FormState>();
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();

  void _addStudent() async {
    if (_formKey.currentState!.validate()) {
      final now = DateFormat('yyyy-MM-dd').format(DateTime.now());
      await db.insertStudent({
        'firstName': firstNameController.text,
        'lastName': lastNameController.text,
        'registrationDate': now,
        'paymentDate': now,
      });
      firstNameController.clear();
      lastNameController.clear();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Şagird uğurla əlavə edildi!")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      currentIndex: 1,
      child: Scaffold(
        appBar: AppBar(title: const Text("Şagird əlavə et")),
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 4,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        TextFormField(
                          controller: firstNameController,
                          decoration: const InputDecoration(
                            labelText: "Ad",
                            prefixIcon: Icon(Icons.person),
                          ),
                          validator: (value) =>
                              value!.isEmpty ? "Adı daxil edin" : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: lastNameController,
                          decoration: const InputDecoration(
                            labelText: "Soyad",
                            prefixIcon: Icon(Icons.person_outline),
                          ),
                          validator: (value) =>
                              value!.isEmpty ? "Soyadı daxil edin" : null,
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: _addStudent,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Theme.of(context).primaryColor,
                          ),
                          child: const Text(
                            "Əlavə et",
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              SizedBox(height: 24),
              SubjectForm(),
            ],
          ),
        ),
      ),
    );
  }
}

class SubjectForm extends StatefulWidget {
  const SubjectForm({super.key});

  @override
  State<SubjectForm> createState() => _SubjectFormState();
}

class _SubjectFormState extends State<SubjectForm> {
  final db = DatabaseHelper();
  final _formKey = GlobalKey<FormState>();
  final nameController = TextEditingController();
  final teacherController = TextEditingController();
  final gradeController = TextEditingController();

  void _addSubject() async {
    if (_formKey.currentState!.validate()) {
      await db.insertSubject(
        nameController.text,
        teacherController.text,
        double.parse(gradeController.text),
      );

      nameController.clear();
      teacherController.clear();
      gradeController.clear();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Fənn uğurla əlavə edildi!")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              const Text(
                "Fənn əlavə et",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: "Fənn adı",
                  prefixIcon: Icon(Icons.book),
                ),
                validator: (value) =>
                    value!.isEmpty ? "Fənn adını daxil edin" : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: teacherController,
                decoration: const InputDecoration(
                  labelText: "Müəllim adı",
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (value) =>
                    value!.isEmpty ? "Müəllim adını daxil edin" : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: gradeController,
                decoration: const InputDecoration(
                  labelText: "Qiymət (optional)",
                  prefixIcon: Icon(Icons.grade),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _addSubject,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).primaryColor,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  "Fənni əlavə et",
                  style: TextStyle(color: Colors.white, fontSize: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
