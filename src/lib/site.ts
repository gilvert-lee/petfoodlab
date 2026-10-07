export const SITE = {
  name: "펫푸드랩",
  nameEn: "PetFoodLab",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://linkoo.co.kr",
  description:
    "국내 유통 반려동물 사료·간식의 성분표를 한 포맷으로 정리하고, 성분별 해설과 보호자 리뷰를 함께 제공하는 반려동물 식품 정보 사이트.",
  email: process.env.CONTACT_EMAIL ?? "contact@linkoo.co.kr",
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "", // ca-pub-xxxx (승인 후 입력)
};

export const SPECIES_LABEL: Record<string, string> = { dog: "강아지", cat: "고양이" };
export const CATEGORY_LABEL: Record<string, string> = {
  dry: "건식 사료",
  wet: "습식 사료",
  treat: "간식",
  supplement: "영양제",
  raw: "생식·화식",
};
export const GROUP_LABEL: Record<string, string> = {
  protein: "단백질원",
  carb: "탄수화물원",
  fat: "지방원",
  fiber: "섬유질",
  vitamin: "비타민",
  mineral: "미네랄",
  additive: "첨가물",
  preservative: "보존제",
  other: "기타",
};
export const CONCERN_LABEL: Record<string, { label: string; className: string }> = {
  none: { label: "일반", className: "bg-stone-100 text-stone-700" },
  caution: { label: "주의", className: "bg-amber-100 text-amber-800" },
  controversial: { label: "논란", className: "bg-rose-100 text-rose-800" },
};
export const GUIDE_CATEGORY_LABEL: Record<string, string> = {
  basics: "기초",
  dog: "강아지",
  cat: "고양이",
  health: "건강·질환",
  compare: "비교·추천",
};

/** 애드센스 승인 기준: 이 글자 수 미만 해설은 noindex */
export const MIN_INDEXABLE_CHARS = 600;
