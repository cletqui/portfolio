import { raw } from "hono/html";
import heartSvg from "lucide-static/icons/heart.svg?raw";
import coffeeSvg from "lucide-static/icons/coffee.svg?raw";
import mailSvg from "lucide-static/icons/mail.svg?raw";
import earthSvg from "lucide-static/icons/earth.svg?raw";
import mapPinSvg from "lucide-static/icons/map-pin.svg?raw";
import mapPinnedSvg from "lucide-static/icons/map-pinned.svg?raw";
import mapPinHouseSvg from "lucide-static/icons/map-pin-house.svg?raw";
import fileKeySvg from "lucide-static/icons/file-key.svg?raw";
import keySvg from "lucide-static/icons/key.svg?raw";
import languagesSvg from "lucide-static/icons/languages.svg?raw";
import paletteSvg from "lucide-static/icons/palette.svg?raw";
import homeSvg from "lucide-static/icons/home.svg?raw";
import userRoundSvg from "lucide-static/icons/user-round.svg?raw";
import userRoundSearchSvg from "lucide-static/icons/user-round-search.svg?raw";
import bookUserSvg from "lucide-static/icons/book-user.svg?raw";
import codeXmlSvg from "lucide-static/icons/code-xml.svg?raw";
import wavesSvg from "lucide-static/icons/waves.svg?raw";
import beerSvg from "lucide-static/icons/beer.svg?raw";
import clockSvg from "lucide-static/icons/clock.svg?raw";
import eyeSvg from "lucide-static/icons/eye.svg?raw";
import externalLinkSvg from "lucide-static/icons/external-link.svg?raw";
import bookASvg from "lucide-static/icons/book-a.svg?raw";
import arrowUp10Svg from "lucide-static/icons/arrow-up-1-0.svg?raw";
import banSvg from "lucide-static/icons/ban.svg?raw";
import trafficConeSvg from "lucide-static/icons/traffic-cone.svg?raw";
import chevronLeftSvg from "lucide-static/icons/chevron-left.svg?raw";
import chevronRightSvg from "lucide-static/icons/chevron-right.svg?raw";
import ethernetPortSvg from "lucide-static/icons/ethernet-port.svg?raw";
import building2Svg from "lucide-static/icons/building-2.svg?raw";
import databaseSvg from "lucide-static/icons/database.svg?raw";
import tabletSmartphoneSvg from "lucide-static/icons/tablet-smartphone.svg?raw";
import routerSvg from "lucide-static/icons/router.svg?raw";
import serverSvg from "lucide-static/icons/server.svg?raw";
import globeSvg from "lucide-static/icons/globe.svg?raw";
import cogSvg from "lucide-static/icons/cog.svg?raw";
import monitorCogSvg from "lucide-static/icons/monitor-cog.svg?raw";
import memoryStickSvg from "lucide-static/icons/memory-stick.svg?raw";
// Brand icon substitutes (lucide-static omits brand logos)
import gitBranchSvg from "lucide-static/icons/git-branch.svg?raw";
import gitForkSvg from "lucide-static/icons/git-fork.svg?raw";
import atSignSvg from "lucide-static/icons/at-sign.svg?raw";
import briefcaseSvg from "lucide-static/icons/briefcase.svg?raw";
import linkSvg from "lucide-static/icons/link.svg?raw";

const svgMap: Record<string, string> = {
  heart: heartSvg,
  coffee: coffeeSvg,
  mail: mailSvg,
  earth: earthSvg,
  "map-pin": mapPinSvg,
  "map-pinned": mapPinnedSvg,
  "map-pin-house": mapPinHouseSvg,
  "file-key": fileKeySvg,
  key: keySvg,
  languages: languagesSvg,
  palette: paletteSvg,
  home: homeSvg,
  "user-round": userRoundSvg,
  "user-round-search": userRoundSearchSvg,
  "book-user": bookUserSvg,
  "code-xml": codeXmlSvg,
  waves: wavesSvg,
  beer: beerSvg,
  clock: clockSvg,
  eye: eyeSvg,
  "external-link": externalLinkSvg,
  "book-a": bookASvg,
  "arrow-up-1-0": arrowUp10Svg,
  ban: banSvg,
  "traffic-cone": trafficConeSvg,
  "chevron-left": chevronLeftSvg,
  "chevron-right": chevronRightSvg,
  "ethernet-port": ethernetPortSvg,
  building2: building2Svg,
  "building-2": building2Svg,
  database: databaseSvg,
  "tablet-smartphone": tabletSmartphoneSvg,
  router: routerSvg,
  server: serverSvg,
  globe: globeSvg,
  cog: cogSvg,
  "monitor-cog": monitorCogSvg,
  "memory-stick": memoryStickSvg,
  // Brand icons mapped to contextual substitutes
  github: gitBranchSvg,
  gitlab: gitForkSvg,
  twitter: atSignSvg,
  linkedin: briefcaseSvg,
  "git-branch": gitBranchSvg,
  "git-fork": gitForkSvg,
  "at-sign": atSignSvg,
  briefcase: briefcaseSvg,
  link: linkSvg,
};

export const Icon = ({
  name,
  size = 16,
  class: className = "",
}: {
  name: string;
  size?: number;
  class?: string;
}) => {
  const svg = svgMap[name] ?? svgMap["link"] ?? "";
  const finalClass = `inline-block shrink-0${className ? ` ${className}` : ""}`;
  // Modify the lucide-static SVG string: override class, width, height
  const output = svg
    .replace(/class="[^"]*"/, `class="${finalClass}"`)
    .replace(/width="\d+"/, `width="${size}"`)
    .replace(/height="\d+"/, `height="${size}"`);
  return raw(output);
};
