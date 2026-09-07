import type {
  BadgeId,
  PetStageId,
} from '../../modules/engagement/gamificationPolicy';

export const PET_STAGE_LABELS: Record<PetStageId, string> = {
  seed: 'Hạt mầm',
  sprout: 'Mầm non',
  sapling: 'Cây con',
  tree: 'Cây trưởng thành',
  bloom: 'Cây nở hoa',
};

export const BADGE_LABELS: Record<BadgeId, string> = {
  first_review: 'Cú hích đầu tiên',
  streak_3: 'Chuỗi 3 ngày',
  streak_7: 'Chuỗi 7 ngày',
  streak_30: 'Chuỗi 30 ngày',
  xp_100: 'Trăm điểm',
  xp_500: 'Năm trăm điểm',
  water_10: 'Tưới 10 lần',
  water_50: 'Tưới 50 lần',
};

export const BADGE_DESCRIPTIONS: Record<BadgeId, string> = {
  first_review: 'Hoàn thành phiên ôn tập đầu tiên',
  streak_3: 'Ôn tập 3 ngày liên tiếp',
  streak_7: 'Ôn tập 7 ngày liên tiếp',
  streak_30: 'Ôn tập 30 ngày liên tiếp',
  xp_100: 'Tích lũy 100 XP',
  xp_500: 'Tích lũy 500 XP',
  water_10: '10 lượt ôn đúng hạn',
  water_50: '50 lượt ôn đúng hạn',
};
