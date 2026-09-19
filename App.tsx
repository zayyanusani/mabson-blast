import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { categories, questions, Question, CategoryId } from './data/questions';

type Screen = 'home' | 'quiz' | 'result' | 'leaderboard';

type BestScores = Record<CategoryId, number>;

const initialBestScores: BestScores = {
  nigeria: 0,
  africa: 0,
  food: 0,
  landmarks: 0,
};

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
  const [screen, setScreen] = useState<Screen>('home');
  const [category, setCategory] = useState<CategoryId>('nigeria');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [bestScores, setBestScores] = useState<BestScores>(initialBestScores);

  const quizQuestions = useMemo(
    () => questions.filter((item) => item.category === category),
    [category]
  );

  const current = quizQuestions[index];
  const categoryMeta = categories.find((item) => item.id === category) ?? categories[0];

  const resetRound = (nextCategory: CategoryId) => {
    setCategory(nextCategory);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setScreen('quiz');
  };

  const chooseAnswer = (answer: string) => {
    if (selected || !current) return;

    setSelected(answer);

    if (answer === current.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const goToNext = () => {
    if (!current) return;

    if (index === quizQuestions.length - 1) {
      const finalScore = score;
      setBestScores((prev) => ({
        ...prev,
        [category]: Math.max(prev[category], finalScore),
      }));
      setScreen('result');
      return;
    }

    setIndex((prev) => prev + 1);
    setSelected(null);
  };

  if (screen === 'home') {
    return <Home onSelect={resetRound} onOpenLeaderboard={() => setScreen('leaderboard')} />;
  }

  if (screen === 'leaderboard') {
    return (
      <Leaderboard
        bestScores={bestScores}
        onHome={() => setScreen('home')}
        onPlay={() => resetRound(category)}
      />
    );
  }

  if (screen === 'result') {
    return (
      <Result
        score={score}
        total={quizQuestions.length}
        onHome={() => setScreen('home')}
        onRetry={() => resetRound(category)}
      />
    );
  }

  if (!current) return null;

  return (
    <SafeAreaView style={styles.safeDark}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.quizHeader}>
          <Text style={styles.brand}>MABSON BLAST</Text>
          <Text style={styles.progressText}>Q {index + 1}/{quizQuestions.length}</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((index + 1) / quizQuestions.length) * 100}%` },
            ]}
          />
        </View>

        <Text style={styles.categoryTag}>
          {categoryMeta.title.toUpperCase()} • LEVEL {index + 1}
        </Text>
        <Text style={styles.scorePill}>Score: {score}</Text>
        <Text style={styles.questionText}>{current.question}</Text>

        <View style={styles.optionList}>
          {current.options.map((option) => {
            const isCorrect = selected !== null && option === current.answer;
            const isWrong = selected === option && option !== current.answer;

            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  isCorrect && styles.correctOption,
                  isWrong && styles.wrongOption,
                ]}
                onPress={() => chooseAnswer(option)}
                disabled={selected !== null}
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

        {selected && (
          <View style={styles.factBox}>
            <Text style={styles.factTitle}>
              {selected === current.answer ? 'Correct! 🎉' : `Correct answer: ${current.answer}`}
            </Text>
            <Text style={styles.factText}>{current.fact}</Text>
          </View>
        )}

        {selected && (
          <TouchableOpacity style={styles.primaryButton} onPress={goToNext}>
            <Text style={styles.primaryButtonText}>
              {index === quizQuestions.length - 1 ? 'See Results' : 'Next Question'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Home({
  onSelect,
  onOpenLeaderboard,
}: {
  onSelect: (category: CategoryId) => void;
  onOpenLeaderboard: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeLight}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.homeContent}>
        <Text style={styles.eyebrow}>WELCOME TO</Text>
        <Text style={styles.logo}>MABSON{`
`}BLAST</Text>
        <Text style={styles.tagline}>Learn Africa. Play smart. Grow proud.</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🌍</Text>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Your culture adventure starts here</Text>
            <Text style={styles.heroText}>
              Explore African stories, places, food, and people through fun challenges.
            </Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Choose a challenge</Text>
          <TouchableOpacity onPress={onOpenLeaderboard}>
            <Text style={styles.linkText}>Leaderboard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryGrid}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.categoryCard, { backgroundColor: item.color }]}
              onPress={() => onSelect(item.id)}
            >
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardCaption}>Play quiz →</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => onSelect('nigeria')}>
          <Text style={styles.primaryButtonText}>Start Nigeria Challenge</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Result({
  score,
  total,
  onHome,
  onRetry,
}: {
  score: number;
  total: number;
  onHome: () => void;
  onRetry: () => void;
}) {
  const percentage = total === 0 ? 0 : Math.round((score / total) * 100);

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

function Leaderboard({
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
            <Text style={styles.leaderCategory}>{categories.find((item) => item.id === key)?.title}</Text>
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

const styles = StyleSheet.create({
  safeDark: {
    flex: 1,
    backgroundColor: palette.green,
  },
  safeLight: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  homeContent: {
    padding: 24,
    paddingBottom: 40,
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
  optionList: {
    gap: 12,
  },
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
  correctOption: {
    backgroundColor: '#D9F5E1',
    borderColor: '#4CB77A',
  },
  wrongOption: {
    backgroundColor: '#F8D8D8',
    borderColor: '#E36767',
  },
  optionText: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  optionTextActive: {
    fontWeight: '800',
  },
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
  eyebrow: {
    color: palette.green,
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 13,
    marginTop: 16,
  },
  logo: {
    color: palette.green,
    fontWeight: '900',
    fontSize: 46,
    lineHeight: 42,
    letterSpacing: 1,
    marginTop: 8,
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
  heroTextWrap: {
    flex: 1,
  },
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
  linkText: {
    color: palette.green,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    minHeight: 150,
    borderRadius: 18,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardIcon: {
    fontSize: 32,
  },
  cardTitle: {
    color: palette.ink,
    fontWeight: '800',
    fontSize: 18,
  },
  cardCaption: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 6,
  },
  resultScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  resultEmoji: {
    fontSize: 72,
    marginBottom: 20,
  },
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
  leaderRank: {
    color: palette.green,
    fontWeight: '900',
    width: 40,
  },
  leaderCategory: {
    flex: 1,
    fontWeight: '700',
    color: palette.ink,
  },
  leaderScore: {
    color: palette.green,
    fontWeight: '800',
  },
});
