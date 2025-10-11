import '../domain/entities/comment.dart';

// Simulated user data
final currentUser = User(
  name: 'Ahmet Yılmaz',
  avatar: 'https://i.pravatar.cc/150?img=1',
  verified: true,
);

// Simulated comments data
final commentsData = <String, List<Comment>>{
  'default': [
    Comment(
      id: '1',
      user: User(
        name: 'Ayşe Yılmaz',
        avatar: 'https://i.pravatar.cc/150?img=2',
        verified: true,
        badge: 'Haber Editörü',
      ),
      content: 'Bu haber gerçekten önemli gelişmeleri içeriyor. Detaylı analiz için teşekkürler!',
      timestamp: '3 saat önce',
      likes: 15,
      replies: [],
    ),
    Comment(
      id: '2',
      user: User(
        name: 'Fatih Özkan',
        avatar: 'https://i.pravatar.cc/150?img=3',
        verified: false,
      ),
      content: 'Çok faydalı bir haber. Bu tür analizlerin devamını bekliyoruz.',
      timestamp: '5 saat önce',
      likes: 8,
      replies: [
        Reply(
          id: '2-1',
          user: User(
            name: 'Zeynep Kaya',
            avatar: 'https://i.pravatar.cc/150?img=4',
            verified: false,
          ),
          content: 'Katılıyorum, çok değerli bilgiler.',
          timestamp: '4 saat önce',
          likes: 3,
        ),
        Reply(
          id: '2-2',
          user: User(
            name: 'Mehmet Demir',
            avatar: 'https://i.pravatar.cc/150?img=5',
            verified: true,
            badge: 'Ekonomi Uzmanı',
          ),
          content: 'Bu konuda daha detaylı bilgi almak isterim.',
          timestamp: '3 saat önce',
          likes: 5,
        ),
      ],
    ),
    Comment(
      id: '3',
      user: User(
        name: 'Emre Demir',
        avatar: 'https://i.pravatar.cc/150?img=6',
        verified: false,
      ),
      content: 'Güzel bir haber. Teşekkürler!',
      timestamp: '6 saat önce',
      likes: 5,
      replies: [],
    ),
    Comment(
      id: '4',
      user: User(
        name: 'Elif Kaya',
        avatar: 'https://i.pravatar.cc/150?img=7',
        verified: false,
      ),
      content: 'Harika analiz! Bu tür haberlerin devamını bekliyoruz. Özellikle detaylı açıklamalar çok faydalı.',
      timestamp: '8 saat önce',
      likes: 12,
      replies: [
        Reply(
          id: '4-1',
          user: User(
            name: 'Can Yılmaz',
            avatar: 'https://i.pravatar.cc/150?img=8',
            verified: false,
          ),
          content: 'Katılıyorum, çok detaylı ve açıklayıcı.',
          timestamp: '7 saat önce',
          likes: 2,
        ),
      ],
    ),
    Comment(
      id: '5',
      user: User(
        name: 'Selin Özkan',
        avatar: 'https://i.pravatar.cc/150?img=9',
        verified: true,
        badge: 'Muhabir',
      ),
      content: 'Çok güncel ve önemli bir konu. Bu haberin takipçisiyim.',
      timestamp: '12 saat önce',
      likes: 9,
      replies: [],
    ),
  ],
  'haber-1': [
    Comment(
      id: '1',
      user: User(
        name: 'Elif Kaya',
        avatar: 'https://i.pravatar.cc/150?img=10',
        verified: false,
      ),
      content: 'Harika analiz! BIST 100\'ün bu performansı gerçekten de dikkat çekici. Özellikle bankacılık sektöründeki gelişmeler umut verici.',
      timestamp: '2 saat önce',
      likes: 12,
      replies: [
        Reply(
          id: '1-1',
          user: User(
            name: 'Mehmet Özkan',
            avatar: 'https://i.pravatar.cc/150?img=11',
            verified: true,
            badge: 'Ekonomi Uzmanı',
          ),
          content: 'Katılıyorum Elif. Bu trend sürdürülebilir görünüyor. TCMB politikalarının da etkisi büyük.',
          timestamp: '1 saat önce',
          likes: 8,
        ),
      ],
    ),
    Comment(
      id: '2',
      user: User(
        name: 'Can Demir',
        avatar: 'https://i.pravatar.cc/150?img=12',
        verified: false,
      ),
      content: 'Yabancı yatırımcı ilgisi artması çok önemli. Bu sinyaller pozitif.',
      timestamp: '45 dakika önce',
      likes: 7,
      replies: [],
    ),
  ],
};

// Get comments for a specific article
List<Comment> getCommentsForArticle(String articleId) {
  return commentsData[articleId] ?? commentsData['default'] ?? [];
}