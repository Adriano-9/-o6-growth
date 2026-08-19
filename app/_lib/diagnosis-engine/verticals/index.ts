import { GENERIC_VERTICAL } from "./generic";
import { SOLO_SERVICE_VERTICAL } from "./solo-service";
import { LOCAL_RETAIL_VERTICAL } from "./local-retail";
import { PROGRAM_MEMBERSHIP_VERTICAL } from "./program-membership";
import { UNCLASSIFIED_JHUN_VERTICAL } from "./unclassified";
import type { VerticalConfig } from "../types";

export const VERTICALS: VerticalConfig[] = [
  GENERIC_VERTICAL,
  SOLO_SERVICE_VERTICAL,
  LOCAL_RETAIL_VERTICAL,
  PROGRAM_MEMBERSHIP_VERTICAL,
  UNCLASSIFIED_JHUN_VERTICAL,
];

export function getVertical(id: string): VerticalConfig {
  return VERTICALS.find((v) => v.id === id) ?? GENERIC_VERTICAL;
}

export function listVerticals(): VerticalConfig[] {
  return VERTICALS;
}

export {
  GENERIC_VERTICAL,
  SOLO_SERVICE_VERTICAL,
  LOCAL_RETAIL_VERTICAL,
  PROGRAM_MEMBERSHIP_VERTICAL,
  UNCLASSIFIED_JHUN_VERTICAL,
};
