import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";

const COLORS = {
  background: "#0D0D10",
  surface: "#15151A",
  surfaceRaised: "#1B1B22",
  line: "#292932",
  lineStrong: "#3A3A48",
  text: "#F5F5F7",
  muted: "#8D8D9A",
  violet: "#7C3AED",
  violetLight: "#B49BFF",
  violetSoft: "#211642",
  teal: "#66E5CF",
  amber: "#F7C873",
  red: "#F27D8A",
};

const terminalLines = [
  { prefix: "$", text: "velclaw build", tone: "command" },
  { prefix: "✓", text: "workspace ready · 42 files", tone: "success" },
  { prefix: "→", text: "tsc --noEmit", tone: "violet" },
  { prefix: "✓", text: "typecheck passed in 0.8s", tone: "success" },
  { prefix: "→", text: "vite build --mode preview", tone: "violet" },
  { prefix: "✓", text: "dist generated · 3.4s", tone: "success" },
];

function triggerHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

export default function HomeScreen() {
  const [building, setBuilding] = useState(false);
  const [buildState, setBuildState] = useState<"ready" | "success">("ready");
  const [activePanel, setActivePanel] = useState<"overview" | "runtime">("overview");
  const [toast, setToast] = useState("Workspace đã sẵn sàng");
  const pulse = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const runBuild = () => {
    if (building) return;
    triggerHaptic();
    setBuilding(true);
    setBuildState("ready");
    setToast("Đang chạy typecheck và build preview...");
    setTimeout(() => {
      setBuilding(false);
      setBuildState("success");
      setToast("Build thành công · preview đã sẵn sàng");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }, 1400);
  };

  const deployPreview = () => {
    triggerHaptic();
    setToast("Preview branch đang chờ duyệt");
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>V</Text>
            </View>
            <View>
              <Text style={styles.wordmark}>VELCLAW</Text>
              <Text style={styles.eyebrow}>MOBILE WORKSPACE</Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Open notifications"
            onPress={() => {
              triggerHaptic();
              setToast("Không có notification mới");
            }}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <IconSymbol name="bell.fill" size={19} color={COLORS.text} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <View style={styles.greetingBlock}>
          <Text style={styles.overline}>THỨ HAI · 21 THÁNG 9, 2026</Text>
          <Text style={styles.title}>Ship ideas, not setup.</Text>
          <Text style={styles.subtitle}>
            Agent, code, build và deploy trong cùng một workspace gọn như Vite.
          </Text>
        </View>

        <View style={styles.statusStrip}>
          <View style={styles.statusLeft}>
            <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
            <Text style={styles.statusText}>{toast}</Text>
          </View>
          <Text style={styles.statusMeta}>main</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopLine}>
            <View>
              <Text style={styles.cardKicker}>ACTIVE PROJECT</Text>
              <Text style={styles.projectTitle}>starter-vite-tsx</Text>
            </View>
            <View style={styles.healthBadge}>
              <View style={styles.healthDot} />
              <Text style={styles.healthText}>healthy</Text>
            </View>
          </View>
          <Text style={styles.projectDescription}>
            React + TypeScript starter · preview branch connected
          </Text>
          <View style={styles.metricRow}>
            <Metric value="42" label="FILES" />
            <Metric value="3.4s" label="LAST BUILD" />
            <Metric value="99.9%" label="UPTIME" />
          </View>
          <View style={styles.actionRow}>
            <Pressable
              onPress={runBuild}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <IconSymbol name={building ? "hourglass" : "play.fill"} size={16} color={COLORS.background} />
              <Text style={styles.primaryButtonText}>{building ? "Building..." : "Run build"}</Text>
            </Pressable>
            <Pressable
              onPress={deployPreview}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <IconSymbol name="arrow.up.right" size={16} color={COLORS.violetLight} />
              <Text style={styles.secondaryButtonText}>Preview</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Workspace pulse</Text>
            <Text style={styles.sectionCaption}>Một góc nhìn, mọi trạng thái quan trọng.</Text>
          </View>
          <Pressable
            onPress={() => {
              triggerHaptic();
              setToast("Đã đồng bộ trạng thái workspace");
            }}
            style={({ pressed }) => [styles.syncButton, pressed && styles.pressed]}
          >
            <IconSymbol name="arrow.triangle.2.circlepath" size={17} color={COLORS.muted} />
          </Pressable>
        </View>

        <View style={styles.segmentedControl}>
          <Pressable
            onPress={() => setActivePanel("overview")}
            style={[styles.segment, activePanel === "overview" && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, activePanel === "overview" && styles.segmentTextActive]}>Overview</Text>
          </Pressable>
          <Pressable
            onPress={() => setActivePanel("runtime")}
            style={[styles.segment, activePanel === "runtime" && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, activePanel === "runtime" && styles.segmentTextActive]}>Runtime</Text>
          </Pressable>
        </View>

        {activePanel === "overview" ? (
          <View style={styles.panelGrid}>
            <InfoCard icon="chevron.left.forwardslash.chevron.right" label="CODE" value="clean" detail="0 errors · 2 warnings" accent={COLORS.teal} />
            <InfoCard icon="checkmark.seal.fill" label="AI REVIEW" value="passed" detail="last review 8m ago" accent={COLORS.violetLight} />
            <InfoCard icon="arrow.up.right" label="DEPLOY" value="preview" detail="waiting approval" accent={COLORS.amber} />
            <InfoCard icon="externaldrive.fill" label="STORAGE" value="12.4 MB" detail="of 1 GB used" accent={COLORS.violetLight} />
          </View>
        ) : (
          <View style={styles.runtimeCard}>
            <View style={styles.runtimeHeader}>
              <View style={styles.runtimeTitleRow}>
                <View style={styles.terminalDots}><View style={[styles.terminalDot, { backgroundColor: COLORS.red }]} /><View style={[styles.terminalDot, { backgroundColor: COLORS.amber }]} /><View style={[styles.terminalDot, { backgroundColor: COLORS.teal }]} /></View>
                <Text style={styles.runtimeTitle}>terminal / preview</Text>
              </View>
              <Text style={styles.runtimeTime}>LIVE</Text>
            </View>
            <View style={styles.terminalBody}>
              {terminalLines.map((line) => (
                <View key={`${line.prefix}-${line.text}`} style={styles.terminalLine}>
                  <Text style={[styles.terminalPrefix, line.tone === "success" && styles.successText, line.tone === "violet" && styles.violetText]}>{line.prefix}</Text>
                  <Text style={[styles.terminalText, line.tone === "command" && styles.commandText]}>{line.text}</Text>
                </View>
              ))}
              <View style={styles.cursorRow}><Text style={styles.terminalPrefix}>$</Text><View style={styles.cursor} /></View>
            </View>
          </View>
        )}

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Ship flow</Text>
            <Text style={styles.sectionCaption}>Từ issue đến deploy, không rời workspace.</Text>
          </View>
          <Text style={styles.flowProgress}>{buildState === "success" ? "5/5" : "3/5"}</Text>
        </View>

        <View style={styles.flowCard}>
          <FlowStep number="01" label="Issue" done />
          <FlowStep number="02" label="Workspace" done />
          <FlowStep number="03" label="Build" done={buildState === "success"} active={building || buildState === "ready"} />
          <FlowStep number="04" label="Review" done={buildState === "success"} />
          <FlowStep number="05" label="Deploy" done={buildState === "success"} last />
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}><IconSymbol name="sparkles" size={18} color={COLORS.violetLight} /></View>
          <View style={styles.tipCopy}>
            <Text style={styles.tipTitle}>Agent context is ready</Text>
            <Text style={styles.tipText}>42 files, branch state và build logs đã được gói trong một context.</Text>
          </View>
          <IconSymbol name="chevron.right" size={18} color={COLORS.muted} />
        </View>

        <Text style={styles.footerNote}>VELCLAW / 0.1.0 · BUILT FOR FOCUS</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function InfoCard({ icon, label, value, detail, accent }: { icon: any; label: string; value: string; detail: string; accent: string }) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoCardTop}><IconSymbol name={icon} size={17} color={accent} /><Text style={styles.infoLabel}>{label}</Text></View>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoDetail}>{detail}</Text>
    </View>
  );
}

function FlowStep({ number, label, done, active, last }: { number: string; label: string; done?: boolean; active?: boolean; last?: boolean }) {
  return (
    <View style={styles.flowStep}>
      <View style={styles.flowRail}>
        <View style={[styles.flowNode, done && styles.flowNodeDone, active && styles.flowNodeActive]}>{done ? <IconSymbol name="checkmark" size={12} color={COLORS.background} /> : <Text style={styles.flowNumber}>{number}</Text>}</View>
        {!last && <View style={[styles.flowLine, done && styles.flowLineDone]} />}
      </View>
      <View style={styles.flowCopy}><Text style={[styles.flowLabel, active && styles.flowLabelActive]}>{label}</Text><Text style={styles.flowNumberText}>{number}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 36 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 34 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  logoMark: { width: 30, height: 30, backgroundColor: COLORS.violet, alignItems: "center", justifyContent: "center", shadowColor: COLORS.violet, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 5 },
  logoMarkText: { color: "#FFF", fontWeight: "800", fontSize: 17 },
  wordmark: { color: COLORS.text, fontSize: 13, fontWeight: "700", letterSpacing: 2.2 },
  eyebrow: { color: COLORS.muted, fontSize: 8, fontWeight: "600", letterSpacing: 1.4, marginTop: 2 },
  iconButton: { width: 38, height: 38, borderWidth: 1, borderColor: COLORS.line, alignItems: "center", justifyContent: "center", position: "relative" },
  notificationDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.violetLight, position: "absolute", top: 8, right: 8 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
  greetingBlock: { marginBottom: 20 },
  overline: { color: COLORS.violetLight, fontSize: 10, fontWeight: "700", letterSpacing: 1.3, marginBottom: 10 },
  title: { color: COLORS.text, fontSize: 32, lineHeight: 36, fontWeight: "600", letterSpacing: -1.2, maxWidth: 320 },
  subtitle: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginTop: 10, maxWidth: 340 },
  statusStrip: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.line, paddingVertical: 11, marginBottom: 18 },
  statusLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 8 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.teal },
  statusText: { color: COLORS.muted, fontSize: 11, flexShrink: 1 },
  statusMeta: { color: COLORS.violetLight, fontSize: 10, fontWeight: "600", fontFamily: "monospace" },
  heroCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 17, marginBottom: 30 },
  heroTopLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardKicker: { color: COLORS.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1.4, marginBottom: 7 },
  projectTitle: { color: COLORS.text, fontSize: 20, fontWeight: "600", letterSpacing: -0.4 },
  healthBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: "#2C5A50", paddingHorizontal: 8, paddingVertical: 5 },
  healthDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.teal },
  healthText: { color: COLORS.teal, fontSize: 10, fontWeight: "600" },
  projectDescription: { color: COLORS.muted, fontSize: 12, marginTop: 7, marginBottom: 18 },
  metricRow: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.line, paddingVertical: 13, marginBottom: 15 },
  metric: { flex: 1, borderRightWidth: 1, borderColor: COLORS.line, paddingLeft: 2 },
  metricValue: { color: COLORS.text, fontSize: 18, fontWeight: "600" },
  metricLabel: { color: COLORS.muted, fontSize: 8, fontWeight: "600", letterSpacing: 1, marginTop: 3 },
  actionRow: { flexDirection: "row", gap: 9 },
  primaryButton: { flex: 1, height: 44, backgroundColor: COLORS.text, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  primaryButtonText: { color: COLORS.background, fontSize: 13, fontWeight: "700" },
  secondaryButton: { height: 44, paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.lineStrong, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  secondaryButtonText: { color: COLORS.violetLight, fontSize: 13, fontWeight: "600" },
  sectionHeading: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 13 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: "600", letterSpacing: -0.3 },
  sectionCaption: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  syncButton: { width: 31, height: 31, borderWidth: 1, borderColor: COLORS.line, alignItems: "center", justifyContent: "center" },
  segmentedControl: { flexDirection: "row", backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 3, marginBottom: 10 },
  segment: { flex: 1, alignItems: "center", paddingVertical: 8 },
  segmentActive: { backgroundColor: COLORS.violetSoft },
  segmentText: { color: COLORS.muted, fontSize: 11, fontWeight: "600" },
  segmentTextActive: { color: COLORS.violetLight },
  panelGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginBottom: 30 },
  infoCard: { width: "48.5%", minHeight: 108, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 13 },
  infoCardTop: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 13 },
  infoLabel: { color: COLORS.muted, fontSize: 9, letterSpacing: 1.2, fontWeight: "700" },
  infoValue: { color: COLORS.text, fontSize: 16, fontWeight: "600" },
  infoDetail: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  runtimeCard: { backgroundColor: "#0A0A0D", borderWidth: 1, borderColor: COLORS.line, marginBottom: 30 },
  runtimeHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderColor: COLORS.line, paddingHorizontal: 13, paddingVertical: 11 },
  runtimeTitleRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  terminalDots: { flexDirection: "row", gap: 4 },
  terminalDot: { width: 6, height: 6, borderRadius: 3 },
  runtimeTitle: { color: COLORS.muted, fontSize: 10, fontFamily: "monospace" },
  runtimeTime: { color: COLORS.teal, fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  terminalBody: { padding: 15 },
  terminalLine: { flexDirection: "row", marginBottom: 8 },
  terminalPrefix: { color: COLORS.muted, width: 20, fontSize: 11, fontFamily: "monospace" },
  terminalText: { color: "#A7A7B5", fontSize: 11, fontFamily: "monospace", flex: 1 },
  commandText: { color: COLORS.text },
  successText: { color: COLORS.teal },
  violetText: { color: COLORS.violetLight },
  cursorRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  cursor: { width: 7, height: 14, backgroundColor: COLORS.violetLight },
  flowProgress: { color: COLORS.violetLight, fontSize: 11, fontWeight: "700", fontFamily: "monospace" },
  flowCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 15, marginBottom: 18 },
  flowStep: { flexDirection: "row", minHeight: 43 },
  flowRail: { width: 29, alignItems: "center" },
  flowNode: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: COLORS.lineStrong, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.surface },
  flowNodeDone: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  flowNodeActive: { borderColor: COLORS.violetLight, shadowColor: COLORS.violet, shadowOpacity: 0.8, shadowRadius: 7, shadowOffset: { width: 0, height: 0 } },
  flowNumber: { color: COLORS.muted, fontSize: 8, fontFamily: "monospace" },
  flowLine: { width: 1, flex: 1, backgroundColor: COLORS.lineStrong, marginVertical: 3 },
  flowLineDone: { backgroundColor: COLORS.teal },
  flowCopy: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: 10, paddingBottom: 15 },
  flowLabel: { color: COLORS.muted, fontSize: 12 },
  flowLabelActive: { color: COLORS.text, fontWeight: "600" },
  flowNumberText: { color: COLORS.lineStrong, fontSize: 10, fontFamily: "monospace" },
  tipCard: { backgroundColor: COLORS.violetSoft, borderWidth: 1, borderColor: "#4B2B8B", padding: 14, flexDirection: "row", alignItems: "center", gap: 11 },
  tipIcon: { width: 31, height: 31, borderWidth: 1, borderColor: "#6B43B6", alignItems: "center", justifyContent: "center" },
  tipCopy: { flex: 1 },
  tipTitle: { color: COLORS.text, fontSize: 12, fontWeight: "600", marginBottom: 3 },
  tipText: { color: "#BEB2DE", fontSize: 10, lineHeight: 15 },
  footerNote: { color: COLORS.lineStrong, fontSize: 9, fontWeight: "700", letterSpacing: 1.5, textAlign: "center", marginTop: 30 },
});
