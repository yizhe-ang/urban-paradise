import { group } from "d3-array";
import data from "dictionary-of-colour-combinations";

export const colors = data;

const map = colors.reduce((map, color, i) => {
  color.combinations.forEach((id) => {
    if (map.has(id)) map.get(id).push(i);
    else map.set(id, [i]);
  });
  return map;
}, new Map());

export const palettes = [...map.entries()]
  .sort((a, b) => a[0] - b[0])
  .map((e) => e[1]);

export const palettesGrouped = group(palettes, (d) => d.length);
