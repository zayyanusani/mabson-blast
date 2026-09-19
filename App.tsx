import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { categories, questions, CategoryId, Question } from './data/questions';

type Screen = 'home' | 'quiz' | 'result';

const palette = { green: '#0B3D2E', mint: '#E7F5EC', gold: '#F4B942', cream: '#FFFDF8', ink: '#17211B', muted: '#66736B', red: '#C84B4B' };

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [category, setCategory] = useState<CategoryId>('nigeria');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const quizQuestions = useMemo(() => questions.filter((item) => item.category === category), [category]);
  const current: Question | undefined = quizQuestions[index];
  const categoryName = categories.find((item) => item.id === category)?.title ?? 'Nigeria';

  const startGame = (nextCategory: CategoryId = category) => {
    setCategory(nextCategory); setIndex(0); setScore(0); setSelected(null); setScreen('quiz');
  };
  const chooseAnswer = (answer: string) => {
    if (selected || !current) return;
    setSelected(answer);
    if (answer === current.answer) setScore((value) => value + 1);
  };
  const nextQuestion = () => {
    if (!current) return;
    if (index === quizQuestions.length - 1) setScreen('result');
    else { setIndex((value) => value + 1); setSelected(null); }
  };

  if (screen === 'home') return <Home onStart={startGame} />;
  if (screen === 'result') return <Result score={score} total={quizQuestions.length} onHome={() => setScreen('home')} onAgain={() => startGame(category)} />;
  if (!current) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.quizTop}><Text style={styles.brandLight}>MABSON BLAST</Text><Text style={styles.progress}>{index + 1}/{quizQuestions.length}</Text></View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((index + 1) / quizQuestions.length) * 100}%` }]} /></View>
        <Text style={styles.categoryLabel}>{categoryName.toUpperCase()} • LEVEL {index + 1}</Text>
        <Text style={styles.question}>{current.question}</Text>
        <View style={styles.options}>{current.options.map((option) => {
          const correct = selected !== null && option === current.answer;
          const wrong = selected === option && option !== current.answer;
          return <TouchableOpacity key={option} style={[styles.option, correct && styles.correct, wrong && styles.wrong]} onPress={() => chooseAnswer(option)} disabled={selected !== null}>
            <Text style={[styles.optionText, (correct || wrong) && styles.optionTextActive]}>{option}</Text><Text style={styles.optionMark}>{correct ? '✓' : wrong ? '×' : ''}</Text>
          </TouchableOpacity>;
        })}</View>
        {selected && <View style={styles.fact}><Text style={styles.factTitle}>{selected === current.answer ? 'Correct! +10 points' : `The answer is ${current.answer}`}</Text><Text style={styles.factText}>{current.fact}</Text></View>}
        {selected && <TouchableOpacity style={styles.button} onPress={nextQuestion}><Text style={styles.buttonText}>{index === quizQuestions.length - 1 ? 'See results' : 'Next question'}</Text></TouchableOpacity>}
      </ScrollView>
    </SafeAreaView>
  );
}

function Home({ onStart }: { onStart: (category?: CategoryId) => void }) {
  return <SafeAreaView style={styles.safeLight}><StatusBar style="dark" /><ScrollView contentContainerStyle={styles.homeContent}>
    <Text style={styles.eyebrow}>WELCOME TO</Text><Text style={styles.logo}>MABSON{ '\n' }BLAST</Text><Text style={styles.tagline}>Learn Africa. Play smart. Grow proud.</Text>
    <View style={styles.hero}><Text style={styles.heroEmoji}>🌍</Text><View style={{ flex: 1 }}><Text style={styles.heroTitle}>Your culture adventure starts here</Text><Text style={styles.heroText}>Explore stories, places, food, and people from across Africa.</Text></View></View>
    <Text style={styles.sectionTitle}>Choose a challenge</Text>
    <View style={styles.grid}>{categories.map((item) => <TouchableOpacity key={item.id} style={[styles.categoryCard, { backgroundColor: item.color }]} onPress={() => onStart(item.id)}><Text style={styles.cardIcon}>{item.icon}</Text><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.cardCaption}>Play quiz →</Text></TouchableOpacity>)}</View>
    <TouchableOpacity style={styles.button} onPress={() => onStart('nigeria')}><Text style={styles.buttonText}>Start Nigeria challenge</Text></TouchableOpacity>
  </ScrollView></SafeAreaView>;
}

function Result({ score, total, onHome, onAgain }: { score: number; total: number; onHome: () => void; onAgain: () => void }) {
  const percentage = Math.round((score / total) * 100);
  return <SafeAreaView style={styles.safeLight}><StatusBar style="dark" /><View style={styles.result}><Text style={styles.resultEmoji}>{percentage >= 70 ? '🏆' : '🌟'}</Text><Text style={styles.resultTitle}>Challenge complete!</Text><Text style={styles.resultScore}>{score} / {total}</Text><Text style={styles.resultMessage}>{percentage >= 70 ? 'Excellent work! Your Africa knowledge is growing.' : 'Great start! Keep playing and discovering more.'}</Text><TouchableOpacity style={styles.button} onPress={onAgain}><Text style={styles.buttonText}>Play again</Text></TouchableOpacity><TouchableOpacity style={styles.secondaryButton} onPress={onHome}><Text style={styles.secondaryText}>Back to home</Text></TouchableOpacity></View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.green }, safeLight: { flex: 1, backgroundColor: palette.cream }, content: { padding: 24, paddingBottom: 40 }, homeContent: { padding: 24, paddingBottom: 40 }, quizTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }, brandLight: { color: '#CBE8D5', fontWeight: '800', letterSpacing: 2 }, progress: { color: '#FFF', fontWeight: '700' }, progressTrack: { height: 7, backgroundColor: '#2D604E', borderRadius: 5, marginBottom: 34 }, progressFill: { height: 7, backgroundColor: palette.gold, borderRadius: 5 }, categoryLabel: { color: palette.gold, fontWeight: '800', letterSpacing: 1.2, fontSize: 12, marginBottom: 12 }, question: { color: '#FFF', fontSize: 28, lineHeight: 36, fontWeight: '800', marginBottom: 28 }, options: { gap: 12 }, option: { backgroundColor: '#FFF', borderRadius: 14, padding: 17, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, correct: { backgroundColor: '#C9EED4' }, wrong: { backgroundColor: '#F8D2D2' }, optionText: { color: palette.ink, fontSize: 16, fontWeight: '600', flex: 1 }, optionTextActive: { fontWeight: '800' }, optionMark: { fontSize: 22, fontWeight: '800' }, fact: { marginTop: 20, padding: 16, backgroundColor: '#1D5944', borderRadius: 14 }, factTitle: { color: '#FFF', fontWeight: '800', marginBottom: 6 }, factText: { color: '#D5EBDD', lineHeight: 21 }, button: { backgroundColor: palette.gold, paddingVertical: 17, borderRadius: 14, alignItems: 'center', marginTop: 22 }, buttonText: { color: palette.ink, fontSize: 16, fontWeight: '800' }, eyebrow: { color: palette.green, fontWeight: '800', letterSpacing: 2, fontSize: 13, marginTop: 20 }, logo: { color: palette.green, fontWeight: '900', fontSize: 48, lineHeight: 43, letterSpacing: 1, marginTop: 8 }, tagline: { color: palette.muted, fontSize: 16, marginTop: 14 }, hero: { backgroundColor: palette.mint, borderRadius: 20, padding: 20, marginTop: 30, flexDirection: 'row', gap: 16, alignItems: 'center' }, heroEmoji: { fontSize: 48 }, heroTitle: { color: palette.green, fontSize: 18, fontWeight: '800', marginBottom: 6 }, heroText: { color: palette.muted, lineHeight: 20 }, sectionTitle: { color: palette.ink, fontSize: 22, fontWeight: '800', marginTop: 30, marginBottom: 14 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, categoryCard: { width: '47%', minHeight: 140, borderRadius: 18, padding: 16 }, cardIcon: { fontSize: 30, marginBottom: 14 }, cardTitle: { color: palette.ink, fontWeight: '800', fontSize: 17 }, cardCaption: { color: palette.muted, marginTop: 8, fontSize: 13 }, result: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }, resultEmoji: { fontSize: 72, marginBottom: 20 }, resultTitle: { color: palette.green, fontSize: 28, fontWeight: '900' }, resultScore: { color: palette.gold, fontSize: 54, fontWeight: '900', marginTop: 20 }, resultMessage: { color: palette.muted, textAlign: 'center', fontSize: 16, lineHeight: 24, marginTop: 10, marginBottom: 10 }, secondaryButton: { padding: 16, marginTop: 8 }, secondaryText: { color: palette.green, fontWeight: '800' }
});
