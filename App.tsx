import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { categories, questions, CategoryId, Question } from './data/questions';

type Screen = 'splash' | 'home' | 'levels' | 'quiz' | 'result' | 'leaderboard' | 'profile';
type BestScores = Record<CategoryId, number>;
type LevelUnlocks = Record<CategoryId, number>;

const initialBestScores: BestScores = {
  nigeria: 0,
  africa: 0,
  food: 0,
  landmarks: 0,
};

const initialUnlocks: LevelUnlocks = {
  nigeria: 1,
  africa: 1,
  food: 1,
  landmarks: 1,
};

const MAX_LEVELS = 3;

const palette = {
  green: '#0B3D2E',
  dark: '#11241D',
  mint: '#E7F5EC',
  gold: '#F4B942',
  cream: '#FFFDF8',
  ink: '#17211B',
  muted: '#66736B',
  red: '#C84B4B',
  white: '#FFFFFF',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('nigeria');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [bestScores, setBestScores] = useState<BestScores>(initialBestScores);
  const [unlocks, setUnlocks] = useState<LevelUnlocks>(initialUnlocks);
  const [playerName] = useState('Aisha');

  useEffect(() => {
    const timer = setTimeout(() => setScreen('home'), 1200);
    return () => clearTimeout(timer);
  }, []);

  const levelQuestions = useMemo(() => {
    const items = questions.filter((item) => item.category === selectedCategory);
    const start = (selectedLevel - 1) * 3;
    return items.slice(start, start + 3);
  }, [selectedCategory, selectedLevel]);

  const currentQuestion = levelQuestions[index];
  const categoryMeta = categories.find((item) => item.id === selectedCategory) ?? categories[0];

  const startLevel = (category: CategoryId, level: number) => {
    setSelectedCategory(category);
    setSelectedLevel(level);
    setIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setScreen('quiz');
  };

  const chooseAnswer = (answer: string) => {
    if (selectedAnswer || !currentQuestion) return;

    setSelectedAnswer(answer);

    if (answer === currentQuestion.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleFinish = () => {
    const nextUnlocked = Math.max(unlocks[selectedCategory], selectedLevel + 1);

    setUnlocks((prev) => ({
      ...prev,
      [selectedCategory]: Math.min(MAX_LEVELS, nextUnlocked),
    }));

    setBestScores((prev) => ({
      ...prev,
      [selectedCategory]: Math.max(prev[selectedCategory], score),
    }));

    setScreen('result');
  };

  const goToNext = () => {
    if (!currentQuestion) return;

    if (index >= levelQuestions.length - 1) {
      handleFinish();
      return;
    }

    setIndex((prev) => prev + 1);
    setSelectedAnswer(null);
  };

  if (screen === 'splash') {
    return <SplashScreen />;
  }

  if (screen === 'home') {
    return (
      <HomeScreen
        playerName={playerName}
        onOpenLevels={() => setScreen('levels')}
        onOpenLeaderboard={() => setScreen('leaderboard')}
        onOpenProfile={() => setScreen('profile')}
      />
    );
  }

  if (screen === 'levels') {
    return (
      <LevelsScreen
        categoryMeta={categoryMeta}
        unlocks={unlocks}
        onSelectCategory={(category) => {
          setSelectedCategory(category);
          setScreen('levels');
        }}
        onSelectLevel={(category, level) => {
          if (level <= unlocks[category]) startLevel(category, level);
        }}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'leaderboard') {
    return (
      <LeaderboardScreen
        bestScores={bestScores}
        onHome={() => setScreen('home')}
        onPlay={() => startLevel(selectedCategory, selectedLevel)}
      />
    );
  }

  if (screen === 'profile') {
    return (
      <ProfileScreen
        playerName={playerName}
        onHome={() => setScreen('home')}
        onPlay={() => startLevel(selectedCategory, selectedLevel)}
      />
    );
  }

  if (screen === 'result') {
    const percentage = levelQuestions.length === 0 ? 0 : Math.round((score / levelQuestions.length) * 100);

    return (
      <ResultScreen
        score={score}
        total={levelQuestions.length}
        percentage={percentage}
        canContinue={selectedLevel < MAX_LEVELS}
        onHome={() => setScreen('home')}
        onRetry={() => startLevel(selectedCategory, selectedLevel)}
        onNext={() => {
          const nextLevel = Math.min(MAX_LEVELS, selectedLevel + 1);
          if (selectedLevel < MAX_LEVELS) startLevel(selectedCategory, nextLevel);
        }}
      />
    );
  }

  if (!currentQuestion) return null;

  return (
    <SafeAreaView style={styles.safeDark}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.quizHeader}>
          <Text style={styles.brand}>MABSON BLAST</Text>
          <Text style={styles.progressText}>Q {index + 1}/{levelQuestions.length}</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((index + 1) / levelQuestions.length) * 100}%` },
            ]}
          />
        </View>

        <Text style={styles.categoryTag}>
          {categoryMeta.title.toUpperCase()} • LEVEL {selectedLevel}
        </Text>
        <Text style={styles.scorePill}>Score: {score}</Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionList}>
          {currentQuestion.options.map((option) => {
            const isCorrect = selectedAnswer !== null && option === currentQuestion.answer;
            const isWrong = selectedAnswer === option && option !== currentQuestion.answer;

            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  isCorrect && styles.correctOption,
                  isWrong && styles.wrongOption,
                ]}
                onPress={() => chooseAnswer(option)}
                disabled={selectedAnswer !== null}
              >
                <Text
                  style={[
                    styles.optionText,
                    (isCorrect || isWrong) && styles.optionTextActive,
                  ]}
                >
                  {option}
                </Text>
                <Text style={styles.optionMark}>{isCorrect ? '✓' : isWrong ? '×' : ''}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedAnswer && (
          <View style={styles.factBox}>
            <Text style={styles.factTitle}>
              {selectedAnswer === currentQuestion.answer ? 'Correct! 🎉' : `Correct answer: ${currentQuestion.answer}`}
            </Text>
            <Text style={styles.factText}>{currentQuestion.fact}</Text>
          </View>
        )}

        {selectedAnswer && (
          <TouchableOpacity style={styles.primaryButton} onPress={goToNext}>
            <Text style={styles.primaryButtonText}>
              {index >= levelQuestions.length - 1 ? 'See Results' : 'Next Question'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SplashScreen() {
  return (
    <SafeAreaView style={styles.splashScreen}>
      <StatusBar style="light" />
      <Text style={styles.splashLogo}>MABSON</Text>
      <Text style={styles.splashLogoSmall}>BLAST</Text>
      <Text style={styles.splashTag}>Culture. Challenge. Pride.</Text>
    </SafeAreaView>
  );
}

function HomeScreen({
  playerName,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenProfile,
}: {
  playerName: string;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeLight}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.homeContent}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.eyebrow}>HELLO</Text>
            <Text style={styles.playerName}>{playerName}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={onOpenProfile}>
            <Text style={styles.profileButtonText}>Profile</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.logo}>MABSON{`\n`}BLAST</Text>
        <Text style={styles.tagline}>Learn Africa. Play smart. Grow proud.</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🌍</Text>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Your cultural journey begins here</Text>
            <Text style={styles.heroText}>
              Discover African countries, traditions, food, and landmarks one level at a time.
            </Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Explore the map</Text>
          <TouchableOpacity onPress={onOpenLeaderboard}>
            <Text style={styles.linkText}>Leaderboard</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.mapCard} onPress={onOpenLevels}>
          <Text style={styles.mapText}>🌍 View Level Map</Text>
          <Text style={styles.mapSubtext}>Choose your challenge and unlock new levels</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function LevelsScreen({
  categoryMeta,
  unlocks,
  onSelectCategory,
  onSelectLevel,
  onBack,
}: {
  categoryMeta: { id: CategoryId; title: string; icon: string; color: string };
  unlocks: LevelUnlocks;
  onSelectCategory: (category: CategoryId) => void;
  onSelectLevel: (category: CategoryId, level: number) => void;
  onBack: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeLight}>
      <StatusBar style="dark" />
      <View style={styles.levelsWrap}>
        <Text style={styles.resultTitle}>Game map</Text>

        <View style={styles.categoryTabs}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.tabButton,
                selectedStyles(item.id === categoryMeta.id),
                { backgroundColor: item.color },
              ]}
              onPress={() => onSelectCategory(item.id)}
            >
              <Text>{item.icon} {item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.levelGrid}>
          {Array.from({ length: MAX_LEVELS }, (_, index) => {
            const level = index + 1;
            const locked = level > unlocks[categoryMeta.id];

            return (
              <TouchableOpacity
                key={level}
                style={[styles.levelButton, locked && styles.lockedLevel]}
                onPress={() => onSelectLevel(categoryMeta.id, level)}
                disabled={locked}
              >
                <Text style={styles.levelNumber}>Level {level}</Text>
                <Text style={styles.levelStatus}>{locked ? 'Locked' : 'Play'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Back home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ResultScreen({
  score,
  total,
  percentage,
  canContinue,
  onHome,
  onRetry,
  onNext,
}: {
  score: number;
  total: number;
  percentage: number;
  canContinue: boolean;
  onHome: () => void;
  onRetry: () => void;
  onNext: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeLight}>
      <StatusBar style="dark" />
      <View style={styles.resultScreen}>
        <Text style={styles.resultEmoji}>{percentage >= 70 ? '🏆' : '🌟'}</Text>
        <Text style={styles.resultTitle}>Challenge complete!</Text>
        <Text style={styles.resultScore}>{score} / {total}</Text>
        <Text style={styles.resultMessage}>
          {percentage >= 70
            ? 'Excellent work! Your Africa knowledge is growing fast.'
            : 'Great start! Keep playing and discovering more.'}
        </Text>

        {canContinue && (
          <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
            <Text style={styles.primaryButtonText}>Next level</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
          <Text style={styles.primaryButtonText}>Play again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onHome}>
          <Text style={styles.secondaryButtonText}>Back to home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function LeaderboardScreen({
  bestScores,
  onHome,
  onPlay,
}: {
  bestScores: BestScores;
  onHome: () => void;
  onPlay: () => void;
}) {
  const ordered = Object.entries(bestScores).sort((a, b) => b[1] - a[1]);

  return (
    <SafeAreaView style={styles.safeLight}>
      <StatusBar style="dark" />
      <View style={styles.leaderboardWrap}>
        <Text style={styles.resultTitle}>Leaderboard</Text>

        {ordered.map(([key, value], index) => (
          <View key={key} style={styles.leaderRow}>
            <Text style={styles.leaderRank}>#{index + 1}</Text>
            <Text style={styles.leaderCategory}>
              {categories.find((item) => item.id === key)?.title}
            </Text>
            <Text style={styles.leaderScore}>{value} pts</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.primaryButton} onPress={onPlay}>
          <Text style={styles.primaryButtonText}>Keep playing</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onHome}>
          <Text style={styles.secondaryButtonText}>Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ProfileScreen({
  playerName,
  onHome,
  onPlay,
}: {
  playerName: string;
  onHome: () => void;
  onPlay: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeLight}>
      <StatusBar style="dark" />
      <View style={styles.profileWrap}>
        <Text style={styles.resultTitle}>Player profile</Text>

        <View style={styles.profileCard}>
          <Text style={styles.avatar}>👤</Text>
          <Text style={styles.playerName}>{playerName}</Text>
          <Text style={styles.profileStats}>Level 3 • 12 badges</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Quizzes</Text>
            <Text style={styles.statValue}>18</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>4 days</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>XP</Text>
            <Text style={styles.statValue}>1200</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={onPlay}>
          <Text style={styles.primaryButtonText}>Continue playing</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onHome}>
          <Text style={styles.secondaryButtonText}>Back home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const selectedStyles = (selected: boolean) => ({
  borderWidth: selected ? 2 : 1,
  borderColor: selected ? palette.green : '#E4E7E6',
});

const styles = StyleSheet.create({
  safeDark: { flex: 1, backgroundColor: palette.green },
  safeLight: { flex: 1, backgroundColor: palette.cream },
  splashScreen: {
    flex: 1,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    color: '#EAFBF1',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 2,
  },
  splashLogoSmall: {
    color: palette.gold,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 5,
  },
  splashTag: {
    marginTop: 16,
    color: '#DDEEE3',
    fontWeight: '600',
    fontSize: 15,
  },
  content: { padding: 24, paddingBottom: 40 },
  homeContent: { padding: 24, paddingBottom: 40 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  eyebrow: {
    color: palette.green,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontSize: 12,
  },
  playerName: {
    color: palette.green,
    fontWeight: '900',
    fontSize: 28,
  },
  profileButton: {
    backgroundColor: '#E4F4EA',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  profileButtonText: {
    color: palette.green,
    fontWeight: '700',
  },
  logo: {
    color: palette.green,
    fontWeight: '900',
    fontSize: 46,
    lineHeight: 42,
    letterSpacing: 1,
    marginTop: 18,
  },
  tagline: {
    color: palette.muted,
    fontSize: 16,
    marginTop: 12,
  },
  heroCard: {
    marginTop: 28,
    backgroundColor: palette.mint,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroEmoji: {
    fontSize: 48,
  },
  heroTextWrap: { flex: 1 },
  heroTitle: {
    color: palette.green,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroText: {
    color: palette.muted,
    lineHeight: 20,
  },
  titleRow: {
    marginTop: 28,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  linkText: { color: palette.green, fontWeight: '700' },
  mapCard: {
    marginTop: 8,
    backgroundColor: '#EEF7F0',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#CFE4D5',
  },
  mapText: {
    color: palette.green,
    fontSize: 20,
    fontWeight: '800',
  },
  mapSubtext: {
    color: palette.muted,
    marginTop: 8,
  },
  primaryButton: {
    marginTop: 22,
    backgroundColor: palette.gold,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  brand: {
    color: '#CFEBD7',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
  },
  progressText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#224E42',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 26,
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.gold,
    borderRadius: 999,
  },
  categoryTag: {
    color: palette.gold,
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 12,
  },
  scorePill: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#123D31',
    color: '#FFFFFF',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontWeight: '700',
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 24,
  },
  optionList: { gap: 12 },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  correctOption: { backgroundColor: '#D9F5E1', borderColor: '#4CB77A' },
  wrongOption: { backgroundColor: '#F8D8D8', borderColor: '#E36767' },
  optionText: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  optionTextActive: { fontWeight: '800' },
  optionMark: {
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 8,
    color: palette.ink,
  },
  factBox: {
    marginTop: 22,
    backgroundColor: '#1A4A3D',
    borderRadius: 14,
    padding: 16,
  },
  factTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  factText: {
    color: '#D5EBDD',
    fontSize: 15,
    lineHeight: 22,
  },
  resultScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  resultEmoji: { fontSize: 72, marginBottom: 20 },
  resultTitle: {
    color: palette.green,
    fontSize: 28,
    fontWeight: '900',
  },
  resultScore: {
    marginTop: 18,
    fontSize: 52,
    fontWeight: '900',
    color: palette.gold,
  },
  resultMessage: {
    color: palette.muted,
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 18,
  },
  secondaryButton: {
    marginTop: 12,
    padding: 12,
  },
  secondaryButtonText: {
    color: palette.green,
    fontWeight: '800',
    fontSize: 15,
  },
  levelsWrap: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
  },
  categoryTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
    marginBottom: 18,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  levelButton: {
    width: '30%',
    minHeight: 110,
    backgroundColor: '#F1F8F3',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedLevel: {
    backgroundColor: '#E9ECEA',
    opacity: 0.6,
  },
  levelNumber: {
    color: palette.green,
    fontWeight: '800',
    fontSize: 16,
  },
  levelStatus: {
    color: palette.muted,
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  leaderboardWrap: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
  },
  leaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F7F5',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  leaderRank: { color: palette.green, fontWeight: '900', width: 40 },
  leaderCategory: { flex: 1, fontWeight: '700', color: palette.ink },
  leaderScore: { color: palette.green, fontWeight: '800' },
  profileWrap: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
  },
  profileCard: {
    marginTop: 16,
    backgroundColor: '#F1F8F3',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  avatar: { fontSize: 54, marginBottom: 10 },
  profileStats: {
    color: palette.muted,
    fontSize: 14,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F5F7F5',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statLabel: { color: palette.muted, fontSize: 12 },
  statValue: { color: palette.green, fontSize: 22, fontWeight: '900', marginTop: 6 },
});
