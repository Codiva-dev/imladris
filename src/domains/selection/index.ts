/** Dominio 2 - Banco / Selección */
export {
  DEFAULT_RULES,
  filterTopicCandidates,
  pickApproaches,
  pickCandidates,
} from "./rules-engine";
export type {
  ApproachOption,
  TopicCandidate,
  SelectionRules,
} from "./rules-engine";
export {
  buildMeetingCandidates,
  lastSelectedCategory,
  loadSelectionRules,
} from "./candidates";
export { persistMeetingSelection } from "./persist";
export { ensureDefaultApproaches } from "./approaches";
