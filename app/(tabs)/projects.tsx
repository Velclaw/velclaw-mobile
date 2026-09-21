import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";

const C = { bg: "#0D0D10", surface: "#15151A", line: "#292932", text: "#F5F5F7", muted: "#8D8D9A", violet: "#7C3AED", violetLight: "#B49BFF", teal: "#66E5CF", amber: "#F7C873" };

type Flow = { verificationUri: string; userCode: string; deviceCode: string };

export default function ProjectsScreen() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<{ owner: string; repo: string } | null>({ owner: "velclaw", repo: "starter-vite-tsx" });
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [message, setMessage] = useState("Demo repositories · connect GitHub để đồng bộ thật");

  useEffect(() => {
    SecureStore.getItemAsync("velclaw.github.token").then((token) => token && setAccessToken(token));
  }, []);

  const startFlow = trpc.github.startDeviceFlow.useMutation({
    onSuccess: async (data) => {
      setFlow({ verificationUri: data.verificationUri, userCode: data.userCode, deviceCode: data.deviceCode });
      setMessage("Mở GitHub, nhập mã xác thực rồi quay lại đây");
      await WebBrowser.openBrowserAsync(data.verificationUri);
    },
    onError: () => setMessage("Không thể khởi tạo GitHub login, hãy thử lại."),
  });
  const pollFlow = trpc.github.pollDeviceFlow.useMutation({
    onSuccess: async (data) => {
      if (data.status === "complete") {
        await SecureStore.setItemAsync("velclaw.github.token", data.accessToken);
        setAccessToken(data.accessToken);
        setFlow(null);
        setMessage(`Đã kết nối GitHub · @${data.user.login}`);
      } else if (data.status === "pending") setMessage("GitHub chưa xác nhận, hãy hoàn tất trên trình duyệt rồi thử lại.");
      else setMessage(data.message ?? "GitHub authorization failed");
    },
    onError: () => setMessage("Không thể kiểm tra GitHub authorization."),
  });

  const repositories = trpc.github.repositories.useQuery({ accessToken }, { staleTime: 30_000 });
  const branches = trpc.github.branches.useQuery(
    { owner: selectedRepo?.owner ?? "velclaw", repo: selectedRepo?.repo ?? "starter-vite-tsx", accessToken },
    { enabled: Boolean(selectedRepo), staleTime: 30_000 },
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>SOURCE CONTROL</Text>
          <Text style={styles.title}>Projects</Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.close}><IconSymbol name="xmark" size={18} color={C.muted} /></Pressable>
      </View>
      <FlatList
        data={repositories.data ?? []}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.githubCard}>
              <View style={styles.githubIcon}><IconSymbol name="chevron.left.forwardslash.chevron.right" size={19} color={C.text} /></View>
              <View style={styles.githubCopy}><Text style={styles.cardTitle}>{accessToken ? "GitHub connected" : "Connect GitHub"}</Text><Text style={styles.cardCaption}>{message}</Text></View>
              {!accessToken && <Pressable onPress={() => startFlow.mutate()} style={styles.connectButton}><Text style={styles.connectText}>{startFlow.isPending ? "..." : "Login"}</Text></Pressable>}
            </View>
            {flow && <View style={styles.codeCard}><Text style={styles.codeLabel}>DEVICE CODE</Text><Text style={styles.deviceCode}>{flow.userCode}</Text><Text style={styles.codeHint}>Nếu trình duyệt chưa mở, truy cập github.com/login/device</Text><Pressable onPress={() => pollFlow.mutate({ deviceCode: flow.deviceCode })} style={styles.authorizeButton}><Text style={styles.authorizeText}>{pollFlow.isPending ? "Checking..." : "I've authorized"}</Text></Pressable></View>}
            <View style={styles.sectionRow}><View><Text style={styles.sectionTitle}>Repositories</Text><Text style={styles.sectionCaption}>{repositories.data?.length ?? 0} projects available</Text></View><IconSymbol name="arrow.triangle.2.circlepath" size={17} color={C.muted} /></View>
          </>
        }
        renderItem={({ item }) => {
          const [owner, repo] = item.fullName.split("/");
          const selected = selectedRepo?.repo === repo;
          return <Pressable onPress={() => { setSelectedRepo({ owner, repo }); setSelectedBranch("main"); }} style={[styles.repoRow, selected && styles.repoSelected]}><View style={[styles.repoIcon, selected && styles.repoIconSelected]}><IconSymbol name={item.private ? "lock.fill" : "globe"} size={16} color={selected ? C.violetLight : C.muted} /></View><View style={styles.repoCopy}><Text style={styles.repoName}>{item.name}</Text><Text style={styles.repoMeta}>{item.language} · {item.updatedAt}</Text></View><Text style={styles.repoStars}>★ {item.stars}</Text></Pressable>;
        }}
        ListFooterComponent={
          <>
            <View style={styles.sectionRow}><View><Text style={styles.sectionTitle}>Branch</Text><Text style={styles.sectionCaption}>Chọn branch để mở workspace</Text></View><IconSymbol name="arrow.triangle.branch" size={17} color={C.muted} /></View>
            <View style={styles.branchList}>{(branches.data ?? ["main"]).map((branch) => <Pressable key={branch} onPress={() => setSelectedBranch(branch)} style={[styles.branchChip, selectedBranch === branch && styles.branchChipSelected]}><IconSymbol name="arrow.triangle.branch" size={14} color={selectedBranch === branch ? C.violetLight : C.muted} /><Text style={[styles.branchText, selectedBranch === branch && styles.branchTextSelected]}>{branch}</Text>{selectedBranch === branch && <IconSymbol name="checkmark" size={14} color={C.teal} />}</Pressable>)}</View>
            <Pressable onPress={() => router.push({ pathname: "/files", params: { owner: selectedRepo?.owner ?? "velclaw", repo: selectedRepo?.repo ?? "starter-vite-tsx", branch: selectedBranch } })} style={styles.openButton}><IconSymbol name="folder.fill" size={17} color={C.bg} /><Text style={styles.openButtonText}>Open workspace</Text><IconSymbol name="arrow.right" size={17} color={C.bg} /></Pressable>
          </>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  kicker: { color: C.violetLight, fontSize: 10, letterSpacing: 1.5, fontWeight: "700" },
  title: { color: C.text, fontSize: 30, lineHeight: 36, fontWeight: "600", letterSpacing: -0.8, marginTop: 5 },
  close: { width: 36, height: 36, borderWidth: 1, borderColor: C.line, justifyContent: "center", alignItems: "center" },
  githubCard: { borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, padding: 14, flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 10 },
  githubIcon: { width: 34, height: 34, backgroundColor: C.violet, justifyContent: "center", alignItems: "center" },
  githubCopy: { flex: 1 },
  cardTitle: { color: C.text, fontWeight: "600", fontSize: 13 },
  cardCaption: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  connectButton: { backgroundColor: C.text, paddingHorizontal: 13, paddingVertical: 9 },
  connectText: { color: C.bg, fontWeight: "700", fontSize: 11 },
  codeCard: { backgroundColor: "#0A0A0D", borderWidth: 1, borderColor: "#4B2B8B", padding: 15, marginBottom: 24 },
  codeLabel: { color: C.violetLight, fontSize: 9, letterSpacing: 1.3, fontWeight: "700" },
  deviceCode: { color: C.text, fontSize: 26, fontWeight: "700", letterSpacing: 3, fontFamily: "monospace", marginVertical: 8 },
  codeHint: { color: C.muted, fontSize: 10, lineHeight: 15 },
  authorizeButton: { marginTop: 13, borderWidth: 1, borderColor: C.violet, alignItems: "center", paddingVertical: 10 },
  authorizeText: { color: C.violetLight, fontSize: 12, fontWeight: "600" },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 17, marginBottom: 11 },
  sectionTitle: { color: C.text, fontSize: 17, fontWeight: "600" },
  sectionCaption: { color: C.muted, fontSize: 10, marginTop: 3 },
  repoRow: { borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 8 },
  repoSelected: { borderColor: C.violet, backgroundColor: "#1E1434" },
  repoIcon: { width: 31, height: 31, borderWidth: 1, borderColor: C.line, justifyContent: "center", alignItems: "center", marginRight: 10 },
  repoIconSelected: { borderColor: C.violet },
  repoCopy: { flex: 1 },
  repoName: { color: C.text, fontSize: 13, fontWeight: "600" },
  repoMeta: { color: C.muted, fontSize: 10, marginTop: 3 },
  repoStars: { color: C.muted, fontSize: 10, fontFamily: "monospace" },
  branchList: { gap: 8 },
  branchChip: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 11, flexDirection: "row", alignItems: "center", gap: 8 },
  branchChipSelected: { borderColor: C.violet, backgroundColor: "#1E1434" },
  branchText: { color: C.muted, fontSize: 12, flex: 1 },
  branchTextSelected: { color: C.violetLight, fontWeight: "600" },
  openButton: { marginTop: 20, height: 46, backgroundColor: C.text, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  openButtonText: { color: C.bg, fontSize: 13, fontWeight: "700" },
});
