import 'package:student_management/main.dart';
import 'package:flutter/material.dart';

class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      currentIndex: 2,
      child: Scaffold(
        appBar: AppBar(title: const Text("Haqqında")),
        body: const Padding(
          padding: EdgeInsets.all(16.0),
          child: SingleChildScrollView(
            child: Center(
              child: Text(
                "📘 Student Management tətbiqi tələbə idarəçiliyi üçün xüsusi olaraq hazırlanmış "
                "müasir və istifadəsi rahat bir mobil proqramdır. "
                "Ənənəvi Excel cədvəllərinin mürəkkəbliyini və zaman itkisini aradan qaldıraraq, "
                "istifadəçilərə daha sürətli, vizual baxımdan daha cəlbedici və təhlükəsiz həll təqdim edir.\n\n"
                "🔹 Bu tətbiq vasitəsilə siz tələbələrin adını, soyadını, qeydiyyat tarixini və ödəniş məlumatlarını "
                "asanlıqla izləyə bilərsiniz. Bütün məlumatlar birbaşa cihazın yaddaşında (SQLite bazasında) saxlanılır, "
                "beləliklə internet bağlantısı və ya əlavə server ehtiyacı olmadan işləyir.\n\n"
                "💡 İstifadəçilərin rahatlığı üçün proqram sadə interfeys, axtarış funksiyası, qeyd əlavə etmə, silmə və yeniləmə "
                "imkanları ilə təchiz olunub. Dizayn müasir rənglərlə işlənib və gündəlik istifadəyə uyğunlaşdırılıb.\n\n"
                "🚀 Məqsədimiz müəllimlərin, kurs rəhbərlərinin və təhsil müəssisələrinin işini daha asan, daha sistemli və daha effektiv "
                "etməkdir. Student Management tətbiqi ilə vaxtınıza qənaət edin və idarəçiliyi daha səmərəli həyata keçirin.\n\n",
                style: TextStyle(fontSize: 16, height: 1.5),
                textAlign: TextAlign.justify,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
