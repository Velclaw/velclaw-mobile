import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";

const C = { bg: "#0D0D10", surface: "#15151A", line: "#292932", text: "#F5F5F7", muted: "#8D8D9A", violet: "#7C3AED", violetLight: "#B49BFF", teal: "#66E5CF" };

export default function FilesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ owner?: string; repo?: string; branch?: string }>();
  const owner = params.owner ?? "velclaw";
  const repo = params.repo ?? "starter-vite-tsx";
  const branch = params.branch ?? "main";
  const [path, setPath] = useState("");
  const [message, setMessage] = useState("Select a file to inspect");
  const tree = trpc.github.tree.useQuery({ owner, repo, branch, path }, { staleTime: 30_000 });
  const entries = useMemo(() => [...(tree.data ?? [])].sort((a, b) => Number(b.type === "dir") - Number(a.type === "dir") || a.name.localeCompare(b.name)), [tree.data]);

  const openEntry = (entry: { name: string; path: string; type: string }) => {
    if (entry.type === "dir") {
      setPath(entry.path);
      setMessage(`Browsing ${entry.path}`);
      return;
    }
    setMessage(`Selected ${entry.name}`);
    router.push({ pathname: "/review", params: { owner, repo, branch, path: entry.path } });
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <View style={styles.header}><View><Text style={styles.kicker}>WORKSPACE / FILES</Text><Text style={styles.title}>{repo}</Text><View style={styles.branchRow}><IconSymbol name="arrow.triangle.branch" size={13} color={C.violetLight} /><Text style={styles.branchText}>{branch}</Text><Text style={styles.dot}>·</Text><Text style={styles.pathText}>{path || "root"}</Text></View></View><Pressable onPress={() => router.back()} style={styles.close}><IconSymbol name="xmark" size={18} color={C.muted} /></Pressable></View>
      <View style={styles.toolbar}><View style={styles.toolbarItem}><IconSymbol name="folder.fill" size={16} color={C.violetLight} /><Text style={styles.toolbarText}>{tree.data?.length ?? 0} entries</Text></View><View style={styles.toolbarItem}><View style={styles.liveDot} /><Text style={styles.toolbarText}>{message}</Text></View></View>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.path}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<View style={styles.listHeader}><Text style={styles.listTitle}>{path ? "CONTENTS" : "PROJECT ROOT"}</Text><Text style={styles.listMeta}>{tree.isLoading ? "syncing..." : "read-only preview"}</Text></View>}
        renderItem={({ item }) => <Pressable onPress={() => openEntry(item)} style={({ pressed }) => [styles.fileRow, pressed && styles.pressed]}><View style={[styles.fileIcon, item.type === "dir" && styles.folderIcon]}><IconSymbol name={item.type === "dir" ? "folder.fill" : item.name.endsWith(".json") ? "curlybraces" : "doc.text.fill"} size={17} color={item.type === "dir" ? C.violetLight : C.muted} /></View><View style={styles.fileCopy}><Text style={styles.fileName}>{item.name}</Text><Text style={styles.fileMeta}>{item.type === "dir" ? "directory" : `${item.size} bytes`}</Text></View><IconSymbol name={item.type === "dir" ? "chevron.right" : "sparkles"} size={16} color={item.type === "dir" ? C.muted : C.violetLight} /></Pressable>}
        ListEmptyComponent={<View style={styles.empty}><IconSymbol name="folder.badge.questionmark" size={24} color={C.muted} /><Text style={styles.emptyText}>No files found for this path.</Text></View>}
        ListFooterComponent={path ? <Pressable onPress={() => setPath(path.split("/").slice(0, -1).join("/"))} style={styles.upButton}><IconSymbol name="arrow.up" size={15} color={C.violetLight} /><Text style={styles.upText}>Back to parent directory</Text></Pressable> : <View style={styles.tip}><IconSymbol name="sparkles" size={17} color={C.violetLight} /><Text style={styles.tipText}>Tap a file to open AI Code Review. Review runs server-side and never exposes your GitHub token.</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  kicker: { color: C.violetLight, fontSize: 10, letterSpacing: 1.4, fontWeight: "700" },
  title: { color: C.text, fontSize: 27, fontWeight: "600", letterSpacing: -0.6, marginTop: 5 },
  close: { width: 36, height: 36, borderWidth: 1, borderColor: C.line, justifyContent: "center", alignItems: "center" },
  branchRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 7 },
  branchText: { color: C.violetLight, fontSize: 11, fontFamily: "monospace" },
  dot: { color: C.line, fontSize: 13 },
  pathText: { color: C.muted, fontSize: 11, fontFamily: "monospace" },
  toolbar: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line, paddingHorizontal: 20, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", gap: 8 },
  toolbarItem: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  toolbarText: { color: C.muted, fontSize: 10, flexShrink: 1 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.teal },
  content: { paddingHorizontal: 20, paddingBottom: 34 },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 22, marginBottom: 10 },
  listTitle: { color: C.text, fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  listMeta: { color: C.muted, fontSize: 10 },
  fileRow: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 7 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  fileIcon: { width: 32, height: 32, borderWidth: 1, borderColor: C.line, justifyContent: "center", alignItems: "center", marginRight: 10 },
  folderIcon: { borderColor: "#4B2B8B", backgroundColor: "#211642" },
  fileCopy: { flex: 1 },
  fileName: { color: C.text, fontSize: 13, fontWeight: "600" },
  fileMeta: { color: C.muted, fontSize: 10, marginTop: 3 },
  empty: { alignItems: "center", paddingVertical: 50, gap: 10 },
  emptyText: { color: C.muted, fontSize: 12 },
  upButton: { borderWidth: 1, borderColor: C.line, paddingVertical: 12, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 8, marginTop: 9 },
  upText: { color: C.violetLight, fontSize: 11 },
  tip: { marginTop: 20, borderWidth: 1, borderColor: "#4B2B8B", backgroundColor: "#211642", padding: 13, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  tipText: { color: "#C7BCE4", fontSize: 10, lineHeight: 16, flex: 1 },
});
