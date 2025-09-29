const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..', 'apps', 'web', 'i18n', 'messages');

const translations = {
  en: {
    games: {
      page: {
        back: 'Back',
        title: 'Games',
        description: 'Test your knowledge with mini experiences and earn XP! You have {xp} XP.',
        categoriesHeading: 'Categories',
        comingSoonHeading: 'Coming Soon',
      },
      categories: {
        all: { name: 'All' },
        educational: { name: 'Educational' },
        memory: { name: 'Memory' },
        word: { name: 'Word' },
        trivia: { name: 'Trivia' },
        timeline: { name: 'Timeline' },
        visual: { name: 'Visual' },
      },
      gamesList: {
        quizzes: {
          title: 'Quizzes',
          description: 'Answer current affairs questions and collect XP across news, culture, and sport.',
          estimatedTime: '5-15 min',
        },
        memoryGame: {
          title: 'News Memory',
          description: 'Match headlines and strengthen your recall.',
          estimatedTime: '3-8 min',
        },
        wordPuzzle: {
          title: 'Word Puzzle',
          description: 'Find news-inspired words and grow your vocabulary.',
          estimatedTime: '4-10 min',
        },
        newsTrivia: {
          title: 'News Trivia',
          description: 'Quick-fire questions about the latest stories.',
          estimatedTime: '2-5 min',
        },
        timelineGame: {
          title: 'Timeline Challenge',
          description: 'Place events in order to test your sense of history.',
          estimatedTime: '8-15 min',
        },
        spotTheDifference: {
          title: 'Spot the Difference',
          description: 'Compare news photos and sharpen your focus.',
          estimatedTime: '5-12 min',
        },
        wordle: {
          title: 'Wordle',
          description: 'Guess the five-letter word in six tries—new challenge every day.',
          estimatedTime: '3-8 min',
        },
      },
      card: {
        difficulty: {
          easy: 'Easy',
          medium: 'Medium',
          hard: 'Hard',
        },
        labels: {
          xpReward: 'XP Reward',
          progress: 'Progress',
          comingSoon: 'Coming Soon',
          playAgain: 'Play Again',
          start: 'Start Game',
        },
      },
    },
    quizzes: {
      page: {
        back: 'Back',
        title: 'Quizzes',
        description: 'Test yourself and earn XP! You have {xp} XP.',
        categoriesHeading: 'Categories',
        categoryTitle: '{category} Quizzes',
        allTitle: 'All Quizzes',
        showAll: 'Show All',
      },
      categories: {
        news: {
          name: 'News',
          description: 'Quizzes about the latest headlines and events.',
        },
        general: {
          name: 'General Knowledge',
          description: 'History, geography, science, and culture quizzes.',
        },
        sports: {
          name: 'Sports',
          description: 'Football, basketball, and other competitions.',
        },
        technology: {
          name: 'Technology',
          description: 'Artificial intelligence, programming, and tech trends.',
        },
        economy: {
          name: 'Economy',
          description: 'Finance, markets, and business insights.',
        },
        science: {
          name: 'Science',
          description: 'Physics, chemistry, biology, and mathematics.',
        },
      },
      categoryCard: {
        labels: {
          quizCount: 'Quiz count',
          completed: 'Completed',
          progress: 'Progress',
        },
      },
      list: {
        difficulty: {
          easy: 'Easy',
          medium: 'Medium',
          hard: 'Hard',
        },
        empty: {
          title: 'No quizzes in this category',
          description: 'Pick another category to explore new quizzes.',
        },
        labels: {
          time: '{minutes} min',
          questions: '{count} questions',
        },
        actions: {
          retry: 'Try Again',
          start: 'Start Quiz',
        },
      },
      modal: {
        dataMissing: {
          title: 'Quiz data missing',
          description: "This quiz doesn't have enough questions yet. Please choose another quiz.",
        },
        actions: {
          close: 'Close',
          previous: 'Previous',
          submit: 'Submit',
          next: 'Next',
          retry: 'Play Again',
        },
        labels: {
          questionProgress: 'Question {current} of {total}',
        },
        results: {
          title: 'Quiz Completed!',
          subtitle: 'Great job, you finished the quiz successfully.',
          correctAnswers: 'Correct Answers',
          xpEarned: 'XP Earned',
        },
      },
    },
    leaderboard: {
      title: 'Leaderboard',
      filters: {
        onlyLeague: 'Only my league',
        periods: {
          'weekly': 'Weekly',
          'monthly': 'Monthly',
          'all-time': 'All time',
        },
      },
      table: {
        currentUser: '(You)',
        xpLabel: 'XP',
        topBadge: 'TOP',
      },
      page: {
        back: 'Back',
      },
    },
    gamification: {
      ranks: {
        NEW_MEMBER: 'New Member',
        ACTIVE_READER: 'Active Reader',
        KNOWLEDGE_SHARER: 'Knowledge Sharer',
        EXPERT_COMMENTER: 'Expert Commenter',
        COMMUNITY_LEADER: 'Community Leader',
      },
      leagues: {
        BRONZE: 'Bronze',
        SILVER: 'Silver',
        GOLD: 'Gold',
        DIAMOND: 'Diamond',
      },
    },
  },
  tr: {
    games: {
      page: {
        back: 'Geri Dön',
        title: 'Oyunlar',
        description: 'Eğlenceli oyunlarla bilginizi test edin ve XP kazanın! {xp} XP\'niz var.',
        categoriesHeading: 'Kategoriler',
        comingSoonHeading: 'Yakında Gelecek',
      },
      categories: {
        all: { name: 'Tümü' },
        educational: { name: 'Eğitici' },
        memory: { name: 'Hafıza' },
        word: { name: 'Kelime' },
        trivia: { name: 'Trivia' },
        timeline: { name: 'Zaman Çizelgesi' },
        visual: { name: 'Görsel' },
      },
      gamesList: {
        quizzes: {
          title: 'Quizler',
          description: 'Haber, genel kültür ve sporda güncel sorularla XP toplayın.',
          estimatedTime: '5-15 dk',
        },
        memoryGame: {
          title: 'Haber Hafıza',
          description: 'Manşetleri eşleştirerek hafızanı güçlendir.',
          estimatedTime: '3-8 dk',
        },
        wordPuzzle: {
          title: 'Kelime Bulmaca',
          description: 'Haberlerden kelimeleri bulun, kelime hazneni genişlet.',
          estimatedTime: '4-10 dk',
        },
        newsTrivia: {
          title: 'Haber Trivia',
          description: 'Güncel gelişmeler hakkında kısa sorular.',
          estimatedTime: '2-5 dk',
        },
        timelineGame: {
          title: 'Zaman Çizelgesi',
          description: 'Olayları kronolojik sıraya dizerek tarih bilgini test et.',
          estimatedTime: '8-15 dk',
        },
        spotTheDifference: {
          title: 'Farkı Bul',
          description: 'Haber fotoğraflarında farkları keşfet, dikkatini artır.',
          estimatedTime: '5-12 dk',
        },
        wordle: {
          title: 'Wordle',
          description: 'Beş harfli kelimeyi altı denemede bul; her gün yeni bir kelime.',
          estimatedTime: '3-8 dk',
        },
      },
      card: {
        difficulty: {
          easy: 'Kolay',
          medium: 'Orta',
          hard: 'Zor',
        },
        labels: {
          xpReward: 'XP Ödülü',
          progress: 'İlerleme',
          comingSoon: 'Yakında Gelecek',
          playAgain: 'Tekrar Oyna',
          start: 'Oyunu Başlat',
        },
      },
    },
    quizzes: {
      page: {
        back: 'Geri Dön',
        title: 'Quizler',
        description: 'Bilginizi test edin ve XP kazanın! {xp} XP\'niz var.',
        categoriesHeading: 'Kategoriler',
        categoryTitle: '{category} Quizleri',
        allTitle: 'Tüm Quizler',
        showAll: 'Tümünü Göster',
      },
      categories: {
        news: {
          name: 'Haber',
          description: 'İz bırakan manşetler ve gündem soruları.',
        },
        general: {
          name: 'Genel Kültür',
          description: 'Tarih, coğrafya, bilim ve kültür soruları.',
        },
        sports: {
          name: 'Spor',
          description: 'Futbol, basketbol ve diğer branşlar.',
        },
        technology: {
          name: 'Teknoloji',
          description: 'Yapay zekâ, yazılım ve teknoloji trendleri.',
        },
        economy: {
          name: 'Ekonomi',
          description: 'Finans, piyasalar ve iş dünyası.',
        },
        science: {
          name: 'Bilim',
          description: 'Fizik, kimya, biyoloji ve matematik.',
        },
      },
      categoryCard: {
        labels: {
          quizCount: 'Quiz Sayısı',
          completed: 'Tamamlanan',
          progress: 'İlerleme',
        },
      },
      list: {
        difficulty: {
          easy: 'Kolay',
          medium: 'Orta',
          hard: 'Zor',
        },
        empty: {
          title: 'Bu kategoride quiz bulunmuyor',
          description: 'Farklı bir kategori seçerek quizleri keşfedebilirsiniz.',
        },
        labels: {
          time: '{minutes} dk',
          questions: '{count} soru',
        },
        actions: {
          retry: 'Tekrar Çöz',
          start: 'Quiz\'i Başlat',
        },
      },
      modal: {
        dataMissing: {
          title: 'Quiz Verisi Eksik',
          description: 'Bu quiz için yeterli soru yok. Lütfen başka bir quiz seçin.',
        },
        actions: {
          close: 'Kapat',
          previous: 'Önceki',
          submit: 'Tamamla',
          next: 'Sonraki',
          retry: 'Tekrar Çöz',
        },
        labels: {
          questionProgress: 'Soru {current} / {total}',
        },
        results: {
          title: 'Quiz Tamamlandı!',
          subtitle: 'Tebrikler, quiz\'i başarıyla tamamladınız.',
          correctAnswers: 'Doğru Cevap',
          xpEarned: 'XP Kazandınız',
        },
      },
    },
    leaderboard: {
      title: 'Liderlik Tablosu',
      filters: {
        onlyLeague: 'Sadece Ligim',
        periods: {
          'weekly': 'Haftalık',
          'monthly': 'Aylık',
          'all-time': 'Tüm Zamanlar',
        },
      },
      table: {
        currentUser: '(Sen)',
        xpLabel: 'XP',
        topBadge: 'TOP',
      },
      page: {
        back: 'Geri Dön',
      },
    },
    gamification: {
      ranks: {
        NEW_MEMBER: 'Yeni Katılımcı',
        ACTIVE_READER: 'Aktif Okur',
        KNOWLEDGE_SHARER: 'Bilgi Paylaşımcısı',
        EXPERT_COMMENTER: 'Uzman Yorumcu',
        COMMUNITY_LEADER: 'Topluluk Lideri',
      },
      leagues: {
        BRONZE: 'Bronz',
        SILVER: 'Gümüş',
        GOLD: 'Altın',
        DIAMOND: 'Elmas',
      },
    },
  },
  ru: {
    games: {
      page: {
        back: 'Назад',
        title: 'Игры',
        description: 'Проверьте свои знания в мини-играх и заработайте XP! У вас {xp} XP.',
        categoriesHeading: 'Категории',
        comingSoonHeading: 'Скоро',
      },
      categories: {
        all: { name: 'Все' },
        educational: { name: 'Обучающие' },
        memory: { name: 'Память' },
        word: { name: 'Слова' },
        trivia: { name: 'Викторины' },
        timeline: { name: 'Хронология' },
        visual: { name: 'Визуальные' },
      },
      gamesList: {
        quizzes: {
          title: 'Викторины',
          description: 'Отвечайте на актуальные вопросы и получайте XP в разделах новости, культура и спорт.',
          estimatedTime: '5-15 мин',
        },
        memoryGame: {
          title: 'Память новостей',
          description: 'Сопоставляйте заголовки и тренируйте память.',
          estimatedTime: '3-8 мин',
        },
        wordPuzzle: {
          title: 'Словесная головоломка',
          description: 'Находите слова из новостей и пополняйте словарный запас.',
          estimatedTime: '4-10 мин',
        },
        newsTrivia: {
          title: 'Новостная викторина',
          description: 'Короткие вопросы по последним событиям.',
          estimatedTime: '2-5 мин',
        },
        timelineGame: {
          title: 'Лента событий',
          description: 'Расставляйте события по порядку и проверяйте знания истории.',
          estimatedTime: '8-15 мин',
        },
        spotTheDifference: {
          title: 'Найди отличия',
          description: 'Сравнивайте фотографии из новостей и тренируйте внимательность.',
          estimatedTime: '5-12 мин',
        },
        wordle: {
          title: 'Wordle',
          description: 'Угадайте слово из пяти букв за шесть попыток — каждый день новое.',
          estimatedTime: '3-8 мин',
        },
      },
      card: {
        difficulty: {
          easy: 'Легко',
          medium: 'Средне',
          hard: 'Сложно',
        },
        labels: {
          xpReward: 'Награда XP',
          progress: 'Прогресс',
          comingSoon: 'Скоро',
          playAgain: 'Играть снова',
          start: 'Начать игру',
        },
      },
    },
    quizzes: {
      page: {
        back: 'Назад',
        title: 'Викторины',
        description: 'Проверьте себя и получите XP! У вас {xp} XP.',
        categoriesHeading: 'Категории',
        categoryTitle: 'Викторины: {category}',
        allTitle: 'Все викторины',
        showAll: 'Показать все',
      },
      categories: {
        news: {
          name: 'Новости',
          description: 'Вопросы о главных событиях и заголовках.',
        },
        general: {
          name: 'Общие знания',
          description: 'История, география, наука и культура.',
        },
        sports: {
          name: 'Спорт',
          description: 'Футбол, баскетбол и другие виды спорта.',
        },
        technology: {
          name: 'Технологии',
          description: 'ИИ, программирование и тренды индустрии.',
        },
        economy: {
          name: 'Экономика',
          description: 'Финансы, рынки и бизнес.',
        },
        science: {
          name: 'Наука',
          description: 'Физика, химия, биология и математика.',
        },
      },
      categoryCard: {
        labels: {
          quizCount: 'Количество викторин',
          completed: 'Пройдено',
          progress: 'Прогресс',
        },
      },
      list: {
        difficulty: {
          easy: 'Легко',
          medium: 'Средне',
          hard: 'Сложно',
        },
        empty: {
          title: 'В этой категории пока нет викторин',
          description: 'Выберите другую категорию, чтобы продолжить.',
        },
        labels: {
          time: '{minutes} мин',
          questions: '{count} вопросов',
        },
        actions: {
          retry: 'Пройти ещё раз',
          start: 'Начать викторину',
        },
      },
      modal: {
        dataMissing: {
          title: 'Нет данных викторины',
          description: 'У этой викторины пока недостаточно вопросов. Пожалуйста, выберите другую.',
        },
        actions: {
          close: 'Закрыть',
          previous: 'Назад',
          submit: 'Завершить',
          next: 'Далее',
          retry: 'Пройти снова',
        },
        labels: {
          questionProgress: 'Вопрос {current} из {total}',
        },
        results: {
          title: 'Викторина завершена!',
          subtitle: 'Отлично! Вы успешно прошли викторину.',
          correctAnswers: 'Правильные ответы',
          xpEarned: 'Получено XP',
        },
      },
    },
    leaderboard: {
      title: 'Таблица лидеров',
      filters: {
        onlyLeague: 'Только моя лига',
        periods: {
          'weekly': 'Неделя',
          'monthly': 'Месяц',
          'all-time': 'За всё время',
        },
      },
      table: {
        currentUser: '(Вы)',
        xpLabel: 'XP',
        topBadge: 'ТОП',
      },
      page: {
        back: 'Назад',
      },
    },
    gamification: {
      ranks: {
        NEW_MEMBER: 'Новый участник',
        ACTIVE_READER: 'Активный читатель',
        KNOWLEDGE_SHARER: 'Просветитель',
        EXPERT_COMMENTER: 'Эксперт-комментатор',
        COMMUNITY_LEADER: 'Лидер сообщества',
      },
      leagues: {
        BRONZE: 'Бронза',
        SILVER: 'Серебро',
        GOLD: 'Золото',
        DIAMOND: 'Алмаз',
      },
    },
  },
  fr: {
    games: {
      page: {
        back: 'Retour',
        title: 'Jeux',
        description: 'Testez vos connaissances avec des mini expériences et gagnez de l\'XP ! Vous avez {xp} XP.',
        categoriesHeading: 'Catégories',
        comingSoonHeading: 'À venir',
      },
      categories: {
        all: { name: 'Tous' },
        educational: { name: 'Éducatif' },
        memory: { name: 'Mémoire' },
        word: { name: 'Mots' },
        trivia: { name: 'Quiz' },
        timeline: { name: 'Chronologie' },
        visual: { name: 'Visuel' },
      },
      gamesList: {
        quizzes: {
          title: 'Quiz',
          description: 'Répondez aux questions d’actualité et cumulez de l’XP sur l’actu, la culture et le sport.',
          estimatedTime: '5-15 min',
        },
        memoryGame: {
          title: 'Mémoire des actus',
          description: 'Associez les titres et stimulez votre mémoire.',
          estimatedTime: '3-8 min',
        },
        wordPuzzle: {
          title: 'Puzzle de mots',
          description: 'Trouvez des mots inspirés des actualités et enrichissez votre vocabulaire.',
          estimatedTime: '4-10 min',
        },
        newsTrivia: {
          title: 'Quiz actu',
          description: 'Questions rapides sur les dernières nouvelles.',
          estimatedTime: '2-5 min',
        },
        timelineGame: {
          title: 'Défi chronologique',
          description: 'Replacez les événements dans l’ordre pour tester votre sens de l’histoire.',
          estimatedTime: '8-15 min',
        },
        spotTheDifference: {
          title: 'Cherche les différences',
          description: 'Comparez des photos d’actualité et affûtez votre regard.',
          estimatedTime: '5-12 min',
        },
        wordle: {
          title: 'Wordle',
          description: 'Devinez le mot de cinq lettres en six essais — un défi quotidien.',
          estimatedTime: '3-8 min',
        },
      },
      card: {
        difficulty: {
          easy: 'Facile',
          medium: 'Intermédiaire',
          hard: 'Difficile',
        },
        labels: {
          xpReward: 'Récompense XP',
          progress: 'Progression',
          comingSoon: 'Bientôt disponible',
          playAgain: 'Rejouer',
          start: 'Lancer le jeu',
        },
      },
    },
    quizzes: {
      page: {
        back: 'Retour',
        title: 'Quiz',
        description: 'Testez-vous et gagnez de l\'XP ! Vous avez {xp} XP.',
        categoriesHeading: 'Catégories',
        categoryTitle: 'Quiz {category}',
        allTitle: 'Tous les quiz',
        showAll: 'Tout afficher',
      },
      categories: {
        news: {
          name: 'Actualité',
          description: 'Les questions incontournables sur les derniers titres.',
        },
        general: {
          name: 'Culture générale',
          description: 'Histoire, géographie, sciences et culture.',
        },
        sports: {
          name: 'Sport',
          description: 'Football, basket et autres disciplines.',
        },
        technology: {
          name: 'Technologie',
          description: 'IA, programmation et tendances numériques.',
        },
        economy: {
          name: 'Économie',
          description: 'Finance, marchés et business.',
        },
        science: {
          name: 'Science',
          description: 'Physique, chimie, biologie et mathématiques.',
        },
      },
      categoryCard: {
        labels: {
          quizCount: 'Nombre de quiz',
          completed: 'Terminés',
          progress: 'Progression',
        },
      },
      list: {
        difficulty: {
          easy: 'Facile',
          medium: 'Intermédiaire',
          hard: 'Difficile',
        },
        empty: {
          title: 'Aucun quiz dans cette catégorie',
          description: 'Choisissez une autre catégorie pour en découvrir.',
        },
        labels: {
          time: '{minutes} min',
          questions: '{count} questions',
        },
        actions: {
          retry: 'Rejouer',
          start: 'Commencer le quiz',
        },
      },
      modal: {
        dataMissing: {
          title: 'Données du quiz manquantes',
          description: 'Ce quiz ne contient pas encore assez de questions. Choisissez-en un autre.',
        },
        actions: {
          close: 'Fermer',
          previous: 'Précédent',
          submit: 'Valider',
          next: 'Suivant',
          retry: 'Rejouer',
        },
        labels: {
          questionProgress: 'Question {current} sur {total}',
        },
        results: {
          title: 'Quiz terminé !',
          subtitle: 'Bravo, vous avez terminé le quiz avec succès.',
          correctAnswers: 'Bonnes réponses',
          xpEarned: 'XP gagné',
        },
      },
    },
    leaderboard: {
      title: 'Classement',
      filters: {
        onlyLeague: 'Seulement ma ligue',
        periods: {
          'weekly': 'Hebdomadaire',
          'monthly': 'Mensuel',
          'all-time': 'Depuis le début',
        },
      },
      table: {
        currentUser: '(Vous)',
        xpLabel: 'XP',
        topBadge: 'TOP',
      },
      page: {
        back: 'Retour',
      },
    },
    gamification: {
      ranks: {
        NEW_MEMBER: 'Nouveau membre',
        ACTIVE_READER: 'Lecteur actif',
        KNOWLEDGE_SHARER: 'Partageur de savoir',
        EXPERT_COMMENTER: 'Commentateur expert',
        COMMUNITY_LEADER: 'Leader de la communauté',
      },
      leagues: {
        BRONZE: 'Bronze',
        SILVER: 'Argent',
        GOLD: 'Or',
        DIAMOND: 'Diamant',
      },
    },
  },
  es: {
    games: {
      page: {
        back: 'Volver',
        title: 'Juegos',
        description: 'Pon a prueba tus conocimientos con mini experiencias y gana XP. Tienes {xp} XP.',
        categoriesHeading: 'Categorías',
        comingSoonHeading: 'Próximamente',
      },
      categories: {
        all: { name: 'Todos' },
        educational: { name: 'Educativo' },
        memory: { name: 'Memoria' },
        word: { name: 'Palabras' },
        trivia: { name: 'Trivia' },
        timeline: { name: 'Cronología' },
        visual: { name: 'Visual' },
      },
      gamesList: {
        quizzes: {
          title: 'Quiz',
          description: 'Responde preguntas de actualidad y acumula XP en noticias, cultura y deporte.',
          estimatedTime: '5-15 min',
        },
        memoryGame: {
          title: 'Memoria de noticias',
          description: 'Empareja titulares y refuerza tu memoria.',
          estimatedTime: '3-8 min',
        },
        wordPuzzle: {
          title: 'Rompecabezas de palabras',
          description: 'Encuentra palabras inspiradas en las noticias y amplía tu vocabulario.',
          estimatedTime: '4-10 min',
        },
        newsTrivia: {
          title: 'Trivia de noticias',
          description: 'Preguntas rápidas sobre las últimas historias.',
          estimatedTime: '2-5 min',
        },
        timelineGame: {
          title: 'Desafío cronológico',
          description: 'Ordena los eventos para poner a prueba tu memoria histórica.',
          estimatedTime: '8-15 min',
        },
        spotTheDifference: {
          title: 'Encuentra las diferencias',
          description: 'Compara fotos de noticias y afina tu atención.',
          estimatedTime: '5-12 min',
        },
        wordle: {
          title: 'Wordle',
          description: 'Adivina la palabra de cinco letras en seis intentos; un reto nuevo cada día.',
          estimatedTime: '3-8 min',
        },
      },
      card: {
        difficulty: {
          easy: 'Fácil',
          medium: 'Medio',
          hard: 'Difícil',
        },
        labels: {
          xpReward: 'Recompensa de XP',
          progress: 'Progreso',
          comingSoon: 'Próximamente',
          playAgain: 'Jugar de nuevo',
          start: 'Iniciar juego',
        },
      },
    },
    quizzes: {
      page: {
        back: 'Volver',
        title: 'Quiz',
        description: 'Ponerte a prueba y gana XP. Tienes {xp} XP.',
        categoriesHeading: 'Categorías',
        categoryTitle: 'Quiz de {category}',
        allTitle: 'Todos los cuestionarios',
        showAll: 'Mostrar todo',
      },
      categories: {
        news: {
          name: 'Actualidad',
          description: 'Preguntas sobre los titulares más relevantes.',
        },
        general: {
          name: 'Cultura general',
          description: 'Historia, geografía, ciencia y cultura.',
        },
        sports: {
          name: 'Deportes',
          description: 'Fútbol, baloncesto y mucho más.',
        },
        technology: {
          name: 'Tecnología',
          description: 'IA, programación y tendencias digitales.',
        },
        economy: {
          name: 'Economía',
          description: 'Finanzas, mercados y mundo empresarial.',
        },
        science: {
          name: 'Ciencia',
          description: 'Física, química, biología y matemáticas.',
        },
      },
      categoryCard: {
        labels: {
          quizCount: 'Número de cuestionarios',
          completed: 'Completados',
          progress: 'Progreso',
        },
      },
      list: {
        difficulty: {
          easy: 'Fácil',
          medium: 'Medio',
          hard: 'Difícil',
        },
        empty: {
          title: 'No hay cuestionarios en esta categoría',
          description: 'Elige otra categoría para seguir explorando.',
        },
        labels: {
          time: '{minutes} min',
          questions: '{count} preguntas',
        },
        actions: {
          retry: 'Volver a intentar',
          start: 'Comenzar quiz',
        },
      },
      modal: {
        dataMissing: {
          title: 'Faltan datos del cuestionario',
          description: 'Este cuestionario aún no tiene suficientes preguntas. Elige otro.',
        },
        actions: {
          close: 'Cerrar',
          previous: 'Anterior',
          submit: 'Finalizar',
          next: 'Siguiente',
          retry: 'Repetir',
        },
        labels: {
          questionProgress: 'Pregunta {current} de {total}',
        },
        results: {
          title: '¡Quiz completado!',
          subtitle: 'Muy bien, completaste el cuestionario con éxito.',
          correctAnswers: 'Respuestas correctas',
          xpEarned: 'XP obtenido',
        },
      },
    },
    leaderboard: {
      title: 'Clasificación',
      filters: {
        onlyLeague: 'Solo mi liga',
        periods: {
          'weekly': 'Semanal',
          'monthly': 'Mensual',
          'all-time': 'Todo el tiempo',
        },
      },
      table: {
        currentUser: '(Tú)',
        xpLabel: 'XP',
        topBadge: 'TOP',
      },
      page: {
        back: 'Volver',
      },
    },
    gamification: {
      ranks: {
        NEW_MEMBER: 'Nuevo miembro',
        ACTIVE_READER: 'Lector activo',
        KNOWLEDGE_SHARER: 'Compartidor de conocimiento',
        EXPERT_COMMENTER: 'Comentarista experto',
        COMMUNITY_LEADER: 'Líder de la comunidad',
      },
      leagues: {
        BRONZE: 'Bronce',
        SILVER: 'Plata',
        GOLD: 'Oro',
        DIAMOND: 'Diamante',
      },
    },
  },
  fa: {
    games: {
      page: {
        back: 'بازگشت',
        title: 'بازی‌ها',
        description: 'با مینی‌بازی‌ها دانش خود را محک بزنید و XP دریافت کنید! شما {xp} XP دارید.',
        categoriesHeading: 'دسته‌بندی‌ها',
        comingSoonHeading: 'به‌زودی',
      },
      categories: {
        all: { name: 'همه' },
        educational: { name: 'آموزشی' },
        memory: { name: 'حافظه' },
        word: { name: 'کلمات' },
        trivia: { name: 'تریویا' },
        timeline: { name: 'خط زمانی' },
        visual: { name: 'تصویری' },
      },
      gamesList: {
        quizzes: {
          title: 'کوئیزها',
          description: 'به پرسش‌های روز پاسخ دهید و در اخبار، فرهنگ و ورزش XP جمع کنید.',
          estimatedTime: '5-15 دقیقه',
        },
        memoryGame: {
          title: 'حافظه خبر',
          description: 'تیترها را جفت کنید و حافظه خود را تقویت کنید.',
          estimatedTime: '3-8 دقیقه',
        },
        wordPuzzle: {
          title: 'معمای کلمات',
          description: 'کلمات الهام‌گرفته از خبرها را پیدا کنید و دایره لغات خود را گسترش دهید.',
          estimatedTime: '4-10 دقیقه',
        },
        newsTrivia: {
          title: 'تریویای خبر',
          description: 'سوالات سریع درباره تازه‌ترین رویدادها.',
          estimatedTime: '2-5 دقیقه',
        },
        timelineGame: {
          title: 'چالش زمانی',
          description: 'رویدادها را به ترتیب بچینید و تاریخ را دوره کنید.',
          estimatedTime: '8-15 دقیقه',
        },
        spotTheDifference: {
          title: 'اختلاف را پیدا کن',
          description: 'عکس‌های خبری را مقایسه کنید و دقت خود را بالا ببرید.',
          estimatedTime: '5-12 دقیقه',
        },
        wordle: {
          title: 'وردل',
          description: 'کلمه پنج‌حرفی را در شش تلاش حدس بزنید؛ هر روز یک چالش تازه.',
          estimatedTime: '3-8 دقیقه',
        },
      },
      card: {
        difficulty: {
          easy: 'آسان',
          medium: 'متوسط',
          hard: 'سخت',
        },
        labels: {
          xpReward: 'پاداش XP',
          progress: 'پیشرفت',
          comingSoon: 'به‌زودی',
          playAgain: 'دوباره بازی کن',
          start: 'شروع بازی',
        },
      },
    },
    quizzes: {
      page: {
        back: 'بازگشت',
        title: 'کوئیزها',
        description: 'خودت را محک بزن و XP بگیر! شما {xp} XP دارید.',
        categoriesHeading: 'دسته‌بندی‌ها',
        categoryTitle: 'کوئیز {category}',
        allTitle: 'همهٔ کوئیزها',
        showAll: 'نمایش همه',
      },
      categories: {
        news: {
          name: 'اخبار',
          description: 'سوال‌هایی درباره مهم‌ترین تیترها و رویدادها.',
        },
        general: {
          name: 'دانش عمومی',
          description: 'تاریخ، جغرافیا، علم و فرهنگ.',
        },
        sports: {
          name: 'ورزش',
          description: 'فوتبال، بسکتبال و رشته‌های دیگر.',
        },
        technology: {
          name: 'فناوری',
          description: 'هوش مصنوعی، برنامه‌نویسی و ترندهای تکنولوژی.',
        },
        economy: {
          name: 'اقتصاد',
          description: 'مالی، بازارها و کسب‌وکار.',
        },
        science: {
          name: 'علم',
          description: 'فیزیک، شیمی، زیست و ریاضیات.',
        },
      },
      categoryCard: {
        labels: {
          quizCount: 'تعداد کوئیز',
          completed: 'تکمیل شده',
          progress: 'پیشرفت',
        },
      },
      list: {
        difficulty: {
          easy: 'آسان',
          medium: 'متوسط',
          hard: 'سخت',
        },
        empty: {
          title: 'در این دسته فعلاً کوئیزی وجود ندارد',
          description: 'برای ادامه، دسته دیگری را انتخاب کنید.',
        },
        labels: {
          time: '{minutes} دقیقه',
          questions: '{count} سؤال',
        },
        actions: {
          retry: 'دوباره حل کن',
          start: 'شروع کوئیز',
        },
      },
      modal: {
        dataMissing: {
          title: 'داده‌های کوئیز موجود نیست',
          description: 'این کوئیز هنوز سؤال کافی ندارد. لطفاً کوئیز دیگری انتخاب کنید.',
        },
        actions: {
          close: 'بستن',
          previous: 'قبلی',
          submit: 'اتمام',
          next: 'بعدی',
          retry: 'دوباره حل کن',
        },
        labels: {
          questionProgress: 'سؤال {current} از {total}',
        },
        results: {
          title: 'کوئیز تمام شد!',
          subtitle: 'آفرین، کوئیز را با موفقیت گذراندی.',
          correctAnswers: 'پاسخ‌های درست',
          xpEarned: 'XP دریافت‌شده',
        },
      },
    },
    leaderboard: {
      title: 'جدول امتیازات',
      filters: {
        onlyLeague: 'فقط لیگ من',
        periods: {
          'weekly': 'هفتگی',
          'monthly': 'ماهانه',
          'all-time': 'همهٔ زمان‌ها',
        },
      },
      table: {
        currentUser: '(شما)',
        xpLabel: 'XP',
        topBadge: 'برتر',
      },
      page: {
        back: 'بازگشت',
      },
    },
    gamification: {
      ranks: {
        NEW_MEMBER: 'عضو تازه',
        ACTIVE_READER: 'خواننده فعال',
        KNOWLEDGE_SHARER: 'به‌اشتراک‌گذار دانش',
        EXPERT_COMMENTER: 'نظر‌دهنده خبره',
        COMMUNITY_LEADER: 'رهبر جامعه',
      },
      leagues: {
        BRONZE: 'برنز',
        SILVER: 'نقره‌ای',
        GOLD: 'طلایی',
        DIAMOND: 'الماس',
      },
    },
  },
  id: {
    games: {
      page: {
        back: 'Kembali',
        title: 'Permainan',
        description: 'Uji pengetahuanmu dengan mini game dan raih XP! Kamu memiliki {xp} XP.',
        categoriesHeading: 'Kategori',
        comingSoonHeading: 'Segera hadir',
      },
      categories: {
        all: { name: 'Semua' },
        educational: { name: 'Edukasi' },
        memory: { name: 'Memori' },
        word: { name: 'Kata' },
        trivia: { name: 'Trivia' },
        timeline: { name: 'Linimasa' },
        visual: { name: 'Visual' },
      },
      gamesList: {
        quizzes: {
          title: 'Kuis',
          description: 'Jawab pertanyaan terkini dan kumpulkan XP dari berita, budaya, dan olahraga.',
          estimatedTime: '5-15 menit',
        },
        memoryGame: {
          title: 'Memori berita',
          description: 'Pasangkan judul untuk menguatkan ingatanmu.',
          estimatedTime: '3-8 menit',
        },
        wordPuzzle: {
          title: 'Teka kata',
          description: 'Temukan kata-kata bertema berita dan perluas kosakata.',
          estimatedTime: '4-10 menit',
        },
        newsTrivia: {
          title: 'Trivia berita',
          description: 'Pertanyaan singkat tentang kabar terbaru.',
          estimatedTime: '2-5 menit',
        },
        timelineGame: {
          title: 'Tantangan linimasa',
          description: 'Urutkan peristiwa dan uji pengetahuan sejarahmu.',
          estimatedTime: '8-15 menit',
        },
        spotTheDifference: {
          title: 'Cari perbedaan',
          description: 'Bandingkan foto berita dan asah fokusmu.',
          estimatedTime: '5-12 menit',
        },
        wordle: {
          title: 'Wordle',
          description: 'Tebak kata lima huruf dalam enam percobaan — tantangan baru setiap hari.',
          estimatedTime: '3-8 menit',
        },
      },
      card: {
        difficulty: {
          easy: 'Mudah',
          medium: 'Sedang',
          hard: 'Sulit',
        },
        labels: {
          xpReward: 'Hadiah XP',
          progress: 'Progres',
          comingSoon: 'Segera hadir',
          playAgain: 'Main lagi',
          start: 'Mulai permainan',
        },
      },
    },
    quizzes: {
      page: {
        back: 'Kembali',
        title: 'Kuis',
        description: 'Uji dirimu dan raih XP. Kamu memiliki {xp} XP.',
        categoriesHeading: 'Kategori',
        categoryTitle: 'Kuis {category}',
        allTitle: 'Semua kuis',
        showAll: 'Tampilkan semua',
      },
      categories: {
        news: {
          name: 'Berita',
          description: 'Pertanyaan seputar tajuk penting dan peristiwa terbaru.',
        },
        general: {
          name: 'Pengetahuan umum',
          description: 'Sejarah, geografi, sains, dan budaya.',
        },
        sports: {
          name: 'Olahraga',
          description: 'Sepak bola, basket, dan cabang lainnya.',
        },
        technology: {
          name: 'Teknologi',
          description: 'AI, pemrograman, dan tren digital.',
        },
        economy: {
          name: 'Ekonomi',
          description: 'Keuangan, pasar, dan bisnis.',
        },
        science: {
          name: 'Sains',
          description: 'Fisika, kimia, biologi, dan matematika.',
        },
      },
      categoryCard: {
        labels: {
          quizCount: 'Jumlah kuis',
          completed: 'Selesai',
          progress: 'Progres',
        },
      },
      list: {
        difficulty: {
          easy: 'Mudah',
          medium: 'Sedang',
          hard: 'Sulit',
        },
        empty: {
          title: 'Belum ada kuis di kategori ini',
          description: 'Pilih kategori lain untuk mengeksplor.',
        },
        labels: {
          time: '{minutes} menit',
          questions: '{count} pertanyaan',
        },
        actions: {
          retry: 'Mainkan lagi',
          start: 'Mulai kuis',
        },
      },
      modal: {
        dataMissing: {
          title: 'Data kuis belum tersedia',
          description: 'Kuis ini belum memiliki cukup pertanyaan. Pilih kuis lain.',
        },
        actions: {
          close: 'Tutup',
          previous: 'Sebelumnya',
          submit: 'Selesai',
          next: 'Berikutnya',
          retry: 'Mainkan lagi',
        },
        labels: {
          questionProgress: 'Pertanyaan {current} dari {total}',
        },
        results: {
          title: 'Kuis selesai!',
          subtitle: 'Hebat, kamu menyelesaikan kuis dengan sukses.',
          correctAnswers: 'Jawaban benar',
          xpEarned: 'XP diperoleh',
        },
      },
    },
    leaderboard: {
      title: 'Papan peringkat',
      filters: {
        onlyLeague: 'Hanya ligaku',
        periods: {
          'weekly': 'Mingguan',
          'monthly': 'Bulanan',
          'all-time': 'Sepanjang waktu',
        },
      },
      table: {
        currentUser: '(Kamu)',
        xpLabel: 'XP',
        topBadge: 'TOP',
      },
      page: {
        back: 'Kembali',
      },
    },
    gamification: {
      ranks: {
        NEW_MEMBER: 'Anggota baru',
        ACTIVE_READER: 'Pembaca aktif',
        KNOWLEDGE_SHARER: 'Pembagi pengetahuan',
        EXPERT_COMMENTER: 'Pengomentar ahli',
        COMMUNITY_LEADER: 'Pemimpin komunitas',
      },
      leagues: {
        BRONZE: 'Perunggu',
        SILVER: 'Perak',
        GOLD: 'Emas',
        DIAMOND: 'Berlian',
      },
    },
  },
  bs: {
    games: {
      page: {
        back: 'Nazad',
        title: 'Igre',
        description: 'Testiraj svoje znanje kroz mini igre i osvoji XP! Imaš {xp} XP.',
        categoriesHeading: 'Kategorije',
        comingSoonHeading: 'Uskoro',
      },
      categories: {
        all: { name: 'Sve' },
        educational: { name: 'Edukativne' },
        memory: { name: 'Memorija' },
        word: { name: 'Riječi' },
        trivia: { name: 'Trivia' },
        timeline: { name: 'Vremenska linija' },
        visual: { name: 'Vizuelno' },
      },
      gamesList: {
        quizzes: {
          title: 'Kvizovi',
          description: 'Odgovaraj na aktuelna pitanja i skupljaj XP iz vijesti, kulture i sporta.',
          estimatedTime: '5-15 min',
        },
        memoryGame: {
          title: 'Memorija vijesti',
          description: 'Upari naslove i ojačaj pamćenje.',
          estimatedTime: '3-8 min',
        },
        wordPuzzle: {
          title: 'Skrivalica riječi',
          description: 'Pronađi riječi inspirisane vijestima i proširi rječnik.',
          estimatedTime: '4-10 min',
        },
        newsTrivia: {
          title: 'Trivia vijesti',
          description: 'Brza pitanja o najnovijim pričama.',
          estimatedTime: '2-5 min',
        },
        timelineGame: {
          title: 'Hronološki izazov',
          description: 'Posloži događaje redom i provjeri znanje historije.',
          estimatedTime: '8-15 min',
        },
        spotTheDifference: {
          title: 'Pronađi razliku',
          description: 'Uporedi novinske fotografije i izoštri fokus.',
          estimatedTime: '5-12 min',
        },
        wordle: {
          title: 'Wordle',
          description: 'Pogodi riječ od pet slova u šest pokušaja — novi izazov svaki dan.',
          estimatedTime: '3-8 min',
        },
      },
      card: {
        difficulty: {
          easy: 'Lako',
          medium: 'Srednje',
          hard: 'Teško',
        },
        labels: {
          xpReward: 'XP nagrada',
          progress: 'Napredak',
          comingSoon: 'Uskoro',
          playAgain: 'Igraj ponovo',
          start: 'Pokreni igru',
        },
      },
    },
    quizzes: {
      page: {
        back: 'Nazad',
        title: 'Kvizovi',
        description: 'Provjeri se i osvoji XP. Imaš {xp} XP.',
        categoriesHeading: 'Kategorije',
        categoryTitle: 'Kviz: {category}',
        allTitle: 'Svi kvizovi',
        showAll: 'Prikaži sve',
      },
      categories: {
        news: {
          name: 'Vijesti',
          description: 'Pitanja o najvažnijim naslovima i događajima.',
        },
        general: {
          name: 'Opće znanje',
          description: 'Historija, geografija, nauka i kultura.',
        },
        sports: {
          name: 'Sport',
          description: 'Fudbal, košarka i drugi sportovi.',
        },
        technology: {
          name: 'Tehnologija',
          description: 'AI, programiranje i digitalni trendovi.',
        },
        economy: {
          name: 'Ekonomija',
          description: 'Finansije, tržišta i biznis.',
        },
        science: {
          name: 'Nauka',
          description: 'Fizika, hemija, biologija i matematika.',
        },
      },
      categoryCard: {
        labels: {
          quizCount: 'Broj kvizova',
          completed: 'Završeno',
          progress: 'Napredak',
        },
      },
      list: {
        difficulty: {
          easy: 'Lako',
          medium: 'Srednje',
          hard: 'Teško',
        },
        empty: {
          title: 'U ovoj kategoriji nema kvizova',
          description: 'Odaberi drugu kategoriju i nastavi istraživati.',
        },
        labels: {
          time: '{minutes} min',
          questions: '{count} pitanja',
        },
        actions: {
          retry: 'Igraj ponovo',
          start: 'Pokreni kviz',
        },
      },
      modal: {
        dataMissing: {
          title: 'Nedostaju podaci',
          description: 'Ovaj kviz nema dovoljno pitanja. Izaberi drugi.',
        },
        actions: {
          close: 'Zatvori',
          previous: 'Prethodno',
          submit: 'Završi',
          next: 'Sljedeće',
          retry: 'Ponovi',
        },
        labels: {
          questionProgress: 'Pitanje {current} od {total}',
        },
        results: {
          title: 'Kviz završen!',
          subtitle: 'Bravo, uspješno si završio kviz.',
          correctAnswers: 'Tačni odgovori',
          xpEarned: 'Osvojeni XP',
        },
      },
    },
    leaderboard: {
      title: 'Tabela lidera',
      filters: {
        onlyLeague: 'Samo moja liga',
        periods: {
          'weekly': 'Sedmično',
          'monthly': 'Mjesečno',
          'all-time': 'Sve vrijeme',
        },
      },
      table: {
        currentUser: '(Ti)',
        xpLabel: 'XP',
        topBadge: 'TOP',
      },
      page: {
        back: 'Nazad',
      },
    },
    gamification: {
      ranks: {
        NEW_MEMBER: 'Novi član',
        ACTIVE_READER: 'Aktivni čitaoc',
        KNOWLEDGE_SHARER: 'Dijeli znanje',
        EXPERT_COMMENTER: 'Iskusni komentator',
        COMMUNITY_LEADER: 'Vođa zajednice',
      },
      leagues: {
        BRONZE: 'Bronza',
        SILVER: 'Srebro',
        GOLD: 'Zlato',
        DIAMOND: 'Dijamant',
      },
    },
  },
  sq: {
    games: {
      page: {
        back: 'Kthehu',
        title: 'Lojërat',
        description: 'Testo njohuritë me mini lojëra dhe fito XP! Ke {xp} XP.',
        categoriesHeading: 'Kategoritë',
        comingSoonHeading: 'Së shpejti',
      },
      categories: {
        all: { name: 'Të gjitha' },
        educational: { name: 'Edukative' },
        memory: { name: 'Memorie' },
        word: { name: 'Fjalë' },
        trivia: { name: 'Trivia' },
        timeline: { name: 'Kronologji' },
        visual: { name: 'Vizuale' },
      },
      gamesList: {
        quizzes: {
          title: 'Kuizet',
          description: 'Përgjigju pyetjeve aktuale dhe mblidh XP nga lajmet, kultura dhe sporti.',
          estimatedTime: '5-15 min',
        },
        memoryGame: {
          title: 'Memoria e lajmeve',
          description: 'Përshtat titujt dhe forco kujtesën.',
          estimatedTime: '3-8 min',
        },
        wordPuzzle: {
          title: 'Puzzle fjalësh',
          description: 'Gjej fjalë të frymëzuara nga lajmet dhe zgjero fjalorin.',
          estimatedTime: '4-10 min',
        },
        newsTrivia: {
          title: 'Trivia lajmesh',
          description: 'Pyetje të shpejta për ngjarjet më të fundit.',
          estimatedTime: '2-5 min',
        },
        timelineGame: {
          title: 'Sfida kronologjike',
          description: 'Vër ngjarjet në rend për të provuar historinë.',
          estimatedTime: '8-15 min',
        },
        spotTheDifference: {
          title: 'Gjej ndryshimin',
          description: 'Krahaso fotografi lajmesh dhe mpreh vëmendjen.',
          estimatedTime: '5-12 min',
        },
        wordle: {
          title: 'Wordle',
          description: 'Gjeje fjalën me pesë shkronja në gjashtë prova — sfidë e re çdo ditë.',
          estimatedTime: '3-8 min',
        },
      },
      card: {
        difficulty: {
          easy: 'E lehtë',
          medium: 'Mesatare',
          hard: 'E vështirë',
        },
        labels: {
          xpReward: 'Shpërblim XP',
          progress: 'Progresi',
          comingSoon: 'Së shpejti',
          playAgain: 'Luaj sërish',
          start: 'Fillo lojën',
        },
      },
    },
    quizzes: {
      page: {
        back: 'Kthehu',
        title: 'Kuizet',
        description: 'Provo veten dhe fito XP. Ke {xp} XP.',
        categoriesHeading: 'Kategoritë',
        categoryTitle: 'Kuizet {category}',
        allTitle: 'Të gjitha kuizet',
        showAll: 'Shfaq të gjitha',
      },
      categories: {
        news: {
          name: 'Lajme',
          description: 'Pyetje mbi titujt dhe ngjarjet kryesore.',
        },
        general: {
          name: 'Njohuri të përgjithshme',
          description: 'Histori, gjeografi, shkencë dhe kulturë.',
        },
        sports: {
          name: 'Sport',
          description: 'Futboll, basketboll dhe më shumë.',
        },
        technology: {
          name: 'Teknologji',
          description: 'AI, programim dhe trende digjitale.',
        },
        economy: {
          name: 'Ekonomi',
          description: 'Financa, tregje dhe biznes.',
        },
        science: {
          name: 'Shkencë',
          description: 'Fizikë, kimi, biologji dhe matematikë.',
        },
      },
      categoryCard: {
        labels: {
          quizCount: 'Numri i kuizeve',
          completed: 'Të përfunduara',
          progress: 'Progresi',
        },
      },
      list: {
        difficulty: {
          easy: 'E lehtë',
          medium: 'Mesatare',
          hard: 'E vështirë',
        },
        empty: {
          title: 'Në këtë kategori nuk ka kuize',
          description: 'Zgjidh një kategori tjetër për të vazhduar.',
        },
        labels: {
          time: '{minutes} min',
          questions: '{count} pyetje',
        },
        actions: {
          retry: 'Luaj sërish',
          start: 'Fillo kuizin',
        },
      },
      modal: {
        dataMissing: {
          title: 'Mungojnë të dhënat e kuizit',
          description: 'Ky kuiz ende nuk ka mjaft pyetje. Zgjidh një tjetër.',
        },
        actions: {
          close: 'Mbyll',
          previous: 'Prapa',
          submit: 'Përfundo',
          next: 'Tjetër',
          retry: 'Luaj sërish',
        },
        labels: {
          questionProgress: 'Pyetja {current} nga {total}',
        },
        results: {
          title: 'Kuizi përfundoi!',
          subtitle: 'Bravo, e përfundove me sukses kuizin.',
          correctAnswers: 'Përgjigjet e sakta',
          xpEarned: 'XP e fituar',
        },
      },
    },
    leaderboard: {
      title: 'Tabela e renditjes',
      filters: {
        onlyLeague: 'Vetëm liga ime',
        periods: {
          'weekly': 'Javore',
          'monthly': 'Mujore',
          'all-time': 'Gjithmonë',
        },
      },
      table: {
        currentUser: '(Ti)',
        xpLabel: 'XP',
        topBadge: 'TOP',
      },
      page: {
        back: 'Kthehu',
      },
    },
    gamification: {
      ranks: {
        NEW_MEMBER: 'Anëtar i ri',
        ACTIVE_READER: 'Lexues aktiv',
        KNOWLEDGE_SHARER: 'Ndaj njohuri',
        EXPERT_COMMENTER: 'Komentues ekspert',
        COMMUNITY_LEADER: 'Lider komuniteti',
      },
      leagues: {
        BRONZE: 'Bronz',
        SILVER: 'Argjend',
        GOLD: 'Ar',
        DIAMOND: 'Diamant',
      },
    },
  },
  mk: {
    games: {
      page: {
        back: 'Назад',
        title: 'Игри',
        description: 'Тестирај го знаењето со мини игри и заработи XP! Имаш {xp} XP.',
        categoriesHeading: 'Категории',
        comingSoonHeading: 'Наскоро',
      },
      categories: {
        all: { name: 'Сите' },
        educational: { name: 'Едукативни' },
        memory: { name: 'Меморија' },
        word: { name: 'Зборови' },
        trivia: { name: 'Тривија' },
        timeline: { name: 'Временска линија' },
        visual: { name: 'Визуелно' },
      },
      gamesList: {
        quizzes: {
          title: 'Квизови',
          description: 'Одговарај на актуелни прашања и собирај XP од вести, култура и спорт.',
          estimatedTime: '5-15 мин',
        },
        memoryGame: {
          title: 'Меморија вести',
          description: 'Спои наслови и зајакни ја меморијата.',
          estimatedTime: '3-8 мин',
        },
        wordPuzzle: {
          title: 'Зборовна сложувалка',
          description: 'Најди зборови инспирирани од вестите и прошири го речникот.',
          estimatedTime: '4-10 мин',
        },
        newsTrivia: {
          title: 'Тривија вести',
          description: 'Брзи прашања за најновите случувања.',
          estimatedTime: '2-5 мин',
        },
        timelineGame: {
          title: 'Хронолошки предизвик',
          description: 'Подреди ги настаните и провери ја историјата.',
          estimatedTime: '8-15 мин',
        },
        spotTheDifference: {
          title: 'Пронајди разлика',
          description: 'Спореди новинарски фотографии и изостри го фокусот.',
          estimatedTime: '5-12 мин',
        },
        wordle: {
          title: 'Wordle',
          description: 'Погоди збор од пет букви во шест обиди — нов предизвик секој ден.',
          estimatedTime: '3-8 мин',
        },
      },
      card: {
        difficulty: {
          easy: 'Лесно',
          medium: 'Средно',
          hard: 'Тешко',
        },
        labels: {
          xpReward: 'XP награда',
          progress: 'Напредок',
          comingSoon: 'Наскоро',
          playAgain: 'Играј повторно',
          start: 'Започни игра',
        },
      },
    },
    quizzes: {
      page: {
        back: 'Назад',
        title: 'Квизови',
        description: 'Провери се и заработи XP. Имаш {xp} XP.',
        categoriesHeading: 'Категории',
        categoryTitle: 'Квизови: {category}',
        allTitle: 'Сите квизови',
        showAll: 'Прикажи ги сите',
      },
      categories: {
        news: {
          name: 'Вести',
          description: 'Прашања за најважните наслови и настани.',
        },
        general: {
          name: 'Општо знаење',
          description: 'Историја, географија, наука и култура.',
        },
        sports: {
          name: 'Спорт',
          description: 'Фудбал, кошарка и други спортови.',
        },
        technology: {
          name: 'Технологија',
          description: 'AI, програмирање и дигитални трендови.',
        },
        economy: {
          name: 'Економија',
          description: 'Финансии, пазари и бизнис.',
        },
        science: {
          name: 'Наука',
          description: 'Физика, хемија, биологија и математика.',
        },
      },
      categoryCard: {
        labels: {
          quizCount: 'Број на квизови',
          completed: 'Завршено',
          progress: 'Напредок',
        },
      },
      list: {
        difficulty: {
          easy: 'Лесно',
          medium: 'Средно',
          hard: 'Тешко',
        },
        empty: {
          title: 'Во оваа категорија нема квизови',
          description: 'Избери друга категорија за да продолжиш.',
        },
        labels: {
          time: '{minutes} мин',
          questions: '{count} прашања',
        },
        actions: {
          retry: 'Играј повторно',
          start: 'Започни квиз',
        },
      },
      modal: {
        dataMissing: {
          title: 'Недостасуваат податоци за квизот',
          description: 'Овој квиз нема доволно прашања. Избери друг.',
        },
        actions: {
          close: 'Затвори',
          previous: 'Претходно',
          submit: 'Заврши',
          next: 'Следно',
          retry: 'Повтори',
        },
        labels: {
          questionProgress: 'Прашање {current} од {total}',
        },
        results: {
          title: 'Квизот е завршен!',
          subtitle: 'Браво, успешно го заврши квизот.',
          correctAnswers: 'Точни одговори',
          xpEarned: 'Заработено XP',
        },
      },
    },
    leaderboard: {
      title: 'Табела на лидери',
      filters: {
        onlyLeague: 'Само мојата лига',
        periods: {
          'weekly': 'Неделно',
          'monthly': 'Месечно',
          'all-time': 'Цел период',
        },
      },
      table: {
        currentUser: '(Ти)',
        xpLabel: 'XP',
        topBadge: 'ТОП',
      },
      page: {
        back: 'Назад',
      },
    },
    gamification: {
      ranks: {
        NEW_MEMBER: 'Нов член',
        ACTIVE_READER: 'Активен читател',
        KNOWLEDGE_SHARER: 'Споделувач на знаење',
        EXPERT_COMMENTER: 'Експерт коментатор',
        COMMUNITY_LEADER: 'Водач на заедницата',
      },
      leagues: {
        BRONZE: 'Бронза',
        SILVER: 'Сребро',
        GOLD: 'Злато',
        DIAMOND: 'Дијамант',
      },
    },
  },
};

for (const [locale, content] of Object.entries(translations)) {
  const filePath = path.join(basePath, `${locale}.json`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  if (content.games) {
    data.games = content.games;
  }
  if (content.quizzes) {
    data.quizzes = content.quizzes;
  }
  if (content.leaderboard) {
    data.leaderboard = content.leaderboard;
  }
  if (content.gamification) {
    data.gamification = content.gamification;
  }
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}
