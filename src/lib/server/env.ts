export const env = {
  ...Object.fromEntries(
    (process.env.BUILD_SECRET ?? "")
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#"))
      .map(line => {
        const [key, ...rest] = line.split("=");
        return [key.trim(), rest.join("=").trim().replace(/^"|"$/g, "")];
      })
  ),
  ...process.env // This ensures actual process.env variables take priority
};