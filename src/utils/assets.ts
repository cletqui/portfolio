declare const __ASSET_VERSIONS__: Record<string, string> | undefined;

export const asset = (path: string) => {
  const version =
    typeof __ASSET_VERSIONS__ === "undefined" ? "" : __ASSET_VERSIONS__[path];
  return version ? `${path}?v=${version}` : path;
};
