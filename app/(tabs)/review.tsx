import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";

const C = { bg: "#0D0D10", surface: "#15151A", line: "#292932", text: "#F5F5F7", muted: "#8D8D9A", violet: "#7C3AED", violetLight: "#B49BFF", teal: "#66E5CF", amber: "#F7C873", red: "#F27D8A" };

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ owner?: string; repo?: string; branch?: string; path?: string }>();
  const owner = params.owner ?? "velclaw";
  const repo = params.repo ?? "starter-vite-tsx";
  const branch = params.branch ?? "main";
  const path = params.path ?? "src/workspace.ts";
  const [showCode, setShowCode] = useState(false);
  const file = trpc.github.file.useQuery({ owner, repo, branch, path }, { staleTime: 30_000 });
  const review = trpc.ai.review.useMutation();

  const runReview = () => {
    if (!file.data) return;
    review.mutate({ filePath: file.data.path, code: file.data.content, language: file.data.language });
  };
  const result = review.data;
  const riskColor = result?.risk === "high" ? C.red : result?.risk === "medium" ? C.amber : C.teal;

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <View style={styles.header}><View><Text style={styles.kicker}>AI CODE REVIEW</Text><Text style={styles.title}>{path.split("/").pop()}</Text><Text style={styles.subtitle}>{owner}/{repo} · {branch}</Text></View><Pressable onPress={() => router.back()} style={styles.close}><IconSymbol name="xmark" size={18} color={C.muted} /></Pressable></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.fileCard}><View style={styles.fileIdentity}><View style={styles.fileIcon}><IconSymbol name="doc.text.fill" size={17} color={C.violetLight} /></View><View><Text style={styles.fileName}>{path}</Text><Text style={styles.fileMeta}>{file.data?.language ?? "loading"} · {file.data?.content.length ?? 0} chars</Text></View></View><Pressable onPress={() => setShowCode((value) => !value)} style={styles.codeToggle}><Text style={styles.codeToggleText}>{showCode ? "Hide" : "View"}</Text></Pressable></View>
        {showCode && <View style={styles.codeBlock}><Text style={styles.codeText}>{file.data?.content ?? "Loading file..."}</Text></View>}
        <View style={styles.reviewHero}><View style={styles.sparkle}><IconSymbol name="sparkles" size={20} color={C.violetLight} /></View><View style={styles.heroCopy}><Text style={styles.heroTitle}>Review with Velclaw AI</Text><Text style={styles.heroText}>Kiểm tra correctness, security, performance và TypeScript trước khi mở pull request.</Text></View></View>
        <Pressable disabled={!file.data || review.isPending} onPress={runReview} style={({ pressed }) => [styles.runButton, pressed && styles.pressed, (!file.data || review.isPending) && styles.disabled]}><IconSymbol name={review.isPending ? "hourglass" : "checkmark.seal.fill"} size={17} color={C.bg} /><Text style={styles.runText}>{review.isPending ? "Reviewing..." : "Run AI review"}</Text></Pressable>
        {review.isPending && <View style={styles.loading}><ActivityIndicator color={C.violetLight} /><Text style={styles.loadingText}>Agent đang đọc {path}...</Text></View>}
        {result && <View style={styles.resultCard}><View style={styles.resultHeader}><View><Text style={styles.resultKicker}>REVIEW RESULT</Text><Text style={styles.resultTitle}>{result.findings.length === 0 ? "Looks clean" : `${result.findings.length} findings`}</Text></View><View style={[styles.riskBadge, { borderColor: riskColor }]}><View style={[styles.riskDot, { backgroundColor: riskColor }]} /><Text style={[styles.riskText, { color: riskColor }]}>{result.risk} risk</Text></View></View><Text style={styles.summary}>{result.summary}</Text>{result.findings.map((finding) => <View key={`${finding.line}-${finding.title}`} style={styles.finding}><View style={styles.findingTop}><Text style={styles.lineNumber}>L{finding.line}</Text><Text style={[styles.severity, { color: finding.severity === "error" ? C.red : finding.severity === "warning" ? C.amber : C.violetLight }]}>{finding.severity}</Text></View><Text style={styles.findingTitle}>{finding.title}</Text><Text style={styles.findingDetail}>{finding.detail}</Text><View style={styles.fixBox}><Text style={styles.fixLabel}>SUGGESTED FIX</Text><Text style={styles.fixText}>{finding.fix}</Text></View></View>)}</View>}
        <View style={styles.privacy}><IconSymbol name="lock.fill" size={15} color={C.teal} /><Text style={styles.privacyText}>Review chạy server-side. GitHub access token không bao giờ được gửi vào prompt hoặc lưu trong client logs.</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  kicker: { color: C.violetLight, fontSize: 10, letterSpacing: 1.4, fontWeight: "700" },
  title: { color: C.text, fontSize: 27, fontWeight: "600", letterSpacing: -0.6, marginTop: 5 },
  subtitle: { color: C.muted, fontSize: 10, fontFamily: "monospace", marginTop: 5 },
  close: { width: 36, height: 36, borderWidth: 1, borderColor: C.line, justifyContent: "center", alignItems: "center" },
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  fileCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, padding: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  fileIdentity: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  fileIcon: { width: 32, height: 32, borderWidth: 1, borderColor: "#4B2B8B", backgroundColor: "#211642", alignItems: "center", justifyContent: "center" },
  fileName: { color: C.text, fontSize: 12, fontWeight: "600" },
  fileMeta: { color: C.muted, fontSize: 10, marginTop: 3 },
  codeToggle: { borderWidth: 1, borderColor: C.line, paddingVertical: 7, paddingHorizontal: 10 },
  codeToggleText: { color: C.violetLight, fontSize: 10, fontWeight: "600" },
  codeBlock: { backgroundColor: "#0A0A0D", borderWidth: 1, borderColor: C.line, padding: 14, marginBottom: 18 },
  codeText: { color: "#B7B7C3", fontSize: 10, lineHeight: 17, fontFamily: "monospace" },
  reviewHero: { backgroundColor: "#211642", borderWidth: 1, borderColor: "#4B2B8B", padding: 14, flexDirection: "row", gap: 11, alignItems: "flex-start", marginTop: 8 },
  sparkle: { width: 32, height: 32, borderWidth: 1, borderColor: "#6B43B6", alignItems: "center", justifyContent: "center" },
  heroCopy: { flex: 1 },
  heroTitle: { color: C.text, fontSize: 13, fontWeight: "600" },
  heroText: { color: "#C7BCE4", fontSize: 10, lineHeight: 16, marginTop: 4 },
  runButton: { height: 46, backgroundColor: C.text, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 },
  runText: { color: C.bg, fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
  loading: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingVertical: 18 },
  loadingText: { color: C.muted, fontSize: 11 },
  resultCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, padding: 15, marginTop: 18 },
  resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  resultKicker: { color: C.muted, fontSize: 9, letterSpacing: 1.3, fontWeight: "700" },
  resultTitle: { color: C.text, fontSize: 21, fontWeight: "600", marginTop: 5 },
  riskBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5 },
  riskDot: { width: 5, height: 5, borderRadius: 3 },
  riskText: { fontSize: 10, fontWeight: "600" },
  summary: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: C.line },
  finding: { borderTopWidth: 1, borderColor: C.line, marginTop: 14, paddingTop: 13 },
  findingTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 7 },
  lineNumber: { color: C.violetLight, fontSize: 10, fontFamily: "monospace" },
  severity: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  findingTitle: { color: C.text, fontSize: 13, fontWeight: "600" },
  findingDetail: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 4 },
  fixBox: { backgroundColor: "#0A0A0D", padding: 10, marginTop: 9 },
  fixLabel: { color: C.muted, fontSize: 8, letterSpacing: 1.1, fontWeight: "700" },
  fixText: { color: "#C9C9D2", fontSize: 10, lineHeight: 15, marginTop: 4 },
  privacy: { flexDirection: "row", gap: 8, marginTop: 20, alignItems: "flex-start" },
  privacyText: { color: C.muted, fontSize: 10, lineHeight: 15, flex: 1 },
});
