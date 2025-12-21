export function getPersonIdFromToken(): number | null {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return null;

  try {
    // JWT: header.payload.signature
    const payload = token.split(".")[1];
    const json = JSON.parse(decodeURIComponent(escape(atob(payload))));

    // 下面几个字段名你项目可能不一样，做兜底
    const pid =
      json.personId ??
      json.userId ??
      json.id ??
      json.sub ?? // 有些项目把 userId 放 sub
      null;

    const n = Number(pid);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
