class NewsCategory {
  final String id;
  final String label;
  final int total;

  NewsCategory({required this.id, required this.label, required this.total});

  factory NewsCategory.fromJson(Map<String, dynamic> json) {
    return NewsCategory(
      id: json['id'] as String,
      label: json['label'] as String,
      total: json['total'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'label': label, 'total': total};
  }
}
