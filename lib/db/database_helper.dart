import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  factory DatabaseHelper() => _instance;
  DatabaseHelper._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;

    // FFI üçün databaseFactory ayarla (Desktop)
    sqfliteFfiInit();
    final databaseFactory = databaseFactoryFfi;

    _database = await _initDB('students.db', databaseFactory);
    return _database!;
  }

  Future<Database> _initDB(String filePath, DatabaseFactory factory) async {
    final dbPath = await factory.getDatabasesPath();
    print("📂 Database path: $dbPath/$filePath");
    final path = join(dbPath, filePath);

    return await factory.openDatabase(
      path,
      options: OpenDatabaseOptions(onCreate: _createDB, version: 1),
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // Students cədvəli
    await db.execute('''
    CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    registrationDate TEXT,
    paymentDate TEXT,
    amount REAL DEFAULT 0
);

CREATE TABLE subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    teacher TEXT,
    monthlyFee REAL
);

CREATE TABLE student_subjects (
    student_id INTEGER,
    subject_id INTEGER,
    grade TEXT,
    PRIMARY KEY (student_id, subject_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    month TEXT,          -- '2025-09' kimi YYYY-MM formatında
    amount REAL,
    paidAt TEXT,         -- ödəniş tarixi
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
);

''');
  }

  //================= Student əməliyyatları =================//
  Future<int> insertStudent(Map<String, dynamic> student) async {
    final db = await database;
    return await db.insert('students', student);
  }

  Future<List<Map<String, dynamic>>> getStudents() async {
    final db = await database;

    final result = await db.rawQuery('''
    SELECT 
      s.id,
      s.firstName,
      s.lastName,
      s.registrationDate,
      s.paymentDate,
      s.amount,
      GROUP_CONCAT(sub.name, ', ') AS subjects
    FROM students s
    LEFT JOIN student_subjects ss ON ss.student_id = s.id
    LEFT JOIN subjects sub ON sub.id = ss.subject_id
    GROUP BY s.id
    ORDER BY s.id DESC
  ''');

    return result;
  }

  Future<int> deleteStudent(int id) async {
    final db = await database;
    return await db.delete('students', where: 'id = ?', whereArgs: [id]);
  }

  Future<int> updatePayment(int id, double amount, String paymentDate) async {
    final db = await database;
    return await db.update(
      'students',
      {'amount': amount, 'paymentDate': paymentDate},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  //================= Subject (Fənlər) əməliyyatları =================//
  Future<int> insertStudentSubject(
    int studentId,
    int subjectId, {
    String? grade,
  }) async {
    final db = await database;
    return await db.insert('student_subjects', {
      'student_id': studentId,
      'subject_id': subjectId,
      'grade': grade ?? '',
    });
  }

  // Mövcud fənləri təmizlə və sonra yeni seçilmişləri əlavə et
  Future<void> updateStudentSubjects(
    int studentId,
    List<int> subjectIds,
  ) async {
    final dbClient = await database;

    // İlk öncə köhnə əlaqələri silirik
    await dbClient.delete(
      'student_subjects',
      where: 'student_id = ?',
      whereArgs: [studentId],
    );

    // Sonra yeni seçilmiş fənləri əlavə edirik
    for (var subId in subjectIds) {
      await dbClient.insert('student_subjects', {
        'student_id': studentId,
        'subject_id': subId,
      });
    }
  }

  // Mövcud fənləri bütünlükdə çəkmək üçün
  Future<List<Map<String, dynamic>>> getAllSubjects() async {
    final dbClient = await database;
    return await dbClient.query('subjects', orderBy: 'name ASC');
  }
  // ================= Student əməliyyatları ================= //

  Future<int> updateStudent(int studentId, Map<String, dynamic> newData) async {
    final dbClient = await database;
    return await dbClient.update(
      'students',
      newData,
      where: 'id = ?',
      whereArgs: [studentId],
    );
  }

  // Bir tələbəyə aid fənləri çəkmək üçün
  Future<List<int>> getSubjectsByStudentId(int studentId) async {
    final dbClient = await database;
    final rows = await dbClient.query(
      'student_subjects',
      where: 'student_id = ?',
      whereArgs: [studentId],
    );
    return rows.map((e) => e['subject_id'] as int).toList();
  }

  Future<void> insertSubject(
    String name,
    String teacher,
    double monthlyFee,
  ) async {
    final db = await database;
    await db.insert('subjects', {
      'name': name,
      'teacher': teacher,
      'monthlyFee': monthlyFee,
    });
  }

  Future<List<Map<String, dynamic>>> getSubjectsByStudent(int studentId) async {
    final db = await database;
    return await db.rawQuery(
      '''
    SELECT sub.id, sub.name, sub.teacher, ss.grade
    FROM student_subjects ss
    JOIN subjects sub ON sub.id = ss.subject_id
    WHERE ss.student_id = ?
  ''',
      [studentId],
    );
  }

  Future<int> deleteSubject(int id) async {
    final db = await database;
    return await db.delete('subjects', where: 'id = ?', whereArgs: [id]);
  }

  Future<int> updateSubject(int id, Map<String, dynamic> newData) async {
    final db = await database;
    return await db.update(
      'subjects',
      newData,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<int> addPayment(int studentId, String month, double amount) async {
    final dbClient = await database;
    return await dbClient.insert('payments', {
      'student_id': studentId,
      'month': month,
      'amount': amount,
      'paidAt': DateTime.now().toIso8601String(),
    });
  }

  // Tələbənin bütün ödənişlərini çəkmək
  Future<List<Map<String, dynamic>>> getPaymentsByStudent(int studentId) async {
    final dbClient = await database;
    return await dbClient.query(
      'payments',
      where: 'student_id = ?',
      whereArgs: [studentId],
      orderBy: 'month ASC',
    );
  }

  Future<double> getStudentDebt(int studentId) async {
    final dbClient = await database;

    // 1. Tələbənin fənlərini çəkmək
    final subjects = await dbClient.rawQuery(
      '''
    SELECT sub.id, sub.monthlyFee
    FROM student_subjects ss
    JOIN subjects sub ON sub.id = ss.subject_id
    WHERE ss.student_id = ?
  ''',
      [studentId],
    );

    if (subjects.isEmpty) return 0;

    // 2. Tələbənin qeydiyyatından bu günə qədər neçə ay keçib
    final studentRow = await dbClient.query(
      'students',
      where: 'id = ?',
      whereArgs: [studentId],
    );
    if (studentRow.isEmpty) return 0;

    final registrationDateStr =
        studentRow.first['registrationDate']?.toString() ?? '';
    if (registrationDateStr.isEmpty) return 0;

    final registrationDate = DateTime.parse(registrationDateStr);
    final now = DateTime.now();
    int monthsPassed =
        (now.year - registrationDate.year) * 12 +
        (now.month - registrationDate.month + 1);

    // 3. Ödənilmiş ödənişləri çəkmək
    final payments = await dbClient.query(
      'payments',
      where: 'student_id = ?',
      whereArgs: [studentId],
    );

    // 4. Hər fən üçün borcu hesabla
    double totalDebt = 0;
    for (var sub in subjects) {
      final monthlyFee = (sub['monthlyFee'] as num?)?.toDouble() ?? 0.0;

      // ödənilmiş ay sayını hesabla (amount-u double kimi götürürük)
      final paidMonths = payments.where((p) {
        final amount = (p['amount'] as num?)?.toDouble() ?? 0.0;
        return amount >= monthlyFee;
      }).length;

      totalDebt += (monthsPassed - paidMonths) * monthlyFee;
    }

    return totalDebt;
  }
}
