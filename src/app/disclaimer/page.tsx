import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "면책 고지", robots: { index: false, follow: true } };

const md = `
## 의료 정보에 관하여
${SITE.name}의 모든 내용은 일반적인 정보 제공을 목적으로 하며, 수의사의 진단·치료·처방을 대신할 수 없습니다. 반려동물에게 질환, 알러지, 체중 문제, 임신·수유 등 특별한 상태가 있다면 식이 변경 전 반드시 수의사와 상담하세요. 사이트의 "주의", "논란" 표시는 일반적인 참고 정보이며 개별 반려동물에 대한 판단이 아닙니다.

## 제품 정보에 관하여
원료 목록과 보장성분은 입력 시점의 라벨 또는 제조사 공개 자료를 기준으로 하며, 제조사가 배합이나 표기를 변경할 수 있습니다. 탄수화물 추정치, 건물 기준(DMB) 환산값은 라벨 수치로 계산한 참고값이며, 수분·회분이 표기되지 않은 경우 일반적인 가정값을 사용하고 그 사실을 표에 표시합니다.

## 이용자 리뷰에 관하여
리뷰는 개별 보호자의 경험이며 사이트의 견해가 아닙니다. 같은 제품이라도 반려동물마다 반응이 다를 수 있습니다.

## 광고·제휴에 관하여
사이트는 Google AdSense 광고와 제휴 링크를 통해 수익을 얻을 수 있습니다. 광고 수익은 운영 비용에 사용되며 제품 평가에 영향을 주지 않습니다.
`;

export default function Page() { return <StaticPage title="면책 고지" md={md} />; }
