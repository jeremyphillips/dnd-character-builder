import type { Character } from "@/shared/types";
import { equipment as equipmentData } from "@/data";

export function calculateArmorClass(character: Character, edition: string) {
  if (edition !== "5e") {
    return { value: character.armorClass?.base ?? 10, breakdown: "Unsupported edition" };
  }

  const base = 10;
  const dexScore = character.stats?.dexterity ?? 10;
  const dexMod = Math.floor((dexScore - 10) / 2);

  const equippedIds = character.equipment?.armor ?? [];

  let bestArmorBase = 0;
  let bestArmorName = "";
  let bestArmorCategory = "";
  let bestShieldBonus = 0;
  let bestShieldName = "";

  for (const id of equippedIds) {
    const item = equipmentData.armor.find((a) => a.id === id);
    const ed = item?.editionData?.find((e) => e.edition === "5e");
    if (!item || !ed) continue;

    if (ed.category === "shields") {
      const bonus = ed.acBonus ?? 0;
      if (bonus > bestShieldBonus) {
        bestShieldBonus = bonus;
        bestShieldName = item.name;
      }
    } else {
      const ac = ed.baseAC ?? 0;
      if (ac > bestArmorBase) {
        bestArmorBase = ac;
        bestArmorName = item.name;
        bestArmorCategory = ed.category ?? "";
      }
    }
  }

  // Heavy armor: no DEX modifier (positive or negative)
  // Medium armor: DEX capped at +2
  // Light / no armor: full DEX
  let dexContribution: number;
  if (bestArmorCategory === "heavy") {
    dexContribution = 0;
  } else if (bestArmorCategory === "medium") {
    dexContribution = Math.min(dexMod, 2);
  } else {
    dexContribution = dexMod;
  }

  const armorAC = bestArmorBase > 0 ? bestArmorBase : base;
  const total = armorAC + dexContribution + bestShieldBonus;

  const parts: string[] = [];
  parts.push(
    bestArmorBase > 0
      ? `${bestArmorBase} (${bestArmorName})`
      : `${base} (base)`
  );
  if (bestArmorCategory !== "heavy") {
    parts.push(`${dexContribution >= 0 ? "+" : ""}${dexContribution} DEX`);
  }
  if (bestShieldBonus > 0) {
    parts.push(`+${bestShieldBonus} (${bestShieldName})`);
  }

  return {
    value: total,
    breakdown: parts.join(" "),
  };
}
