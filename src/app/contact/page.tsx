import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "문의", description: "정보 수정 요청, 제품 등록 요청, 제휴 문의" };

const md = `
아래 이메일로 보내주시면 영업일 기준 3일 안에 답변드립니다.

**${SITE.email}**

## 이런 문의를 받습니다
- **정보 수정 요청**: 라벨 변경, 수치 오류, 오탈자. 제품명과 수정할 내용, 가능하면 라벨 사진을 함께 보내주세요.
- **제품 등록 요청**: 아직 없는 제품을 등록해 달라는 요청. 제품명과 브랜드를 알려주세요.
- **리뷰 삭제 요청**: 본인이 작성한 리뷰의 닉네임과 제품명을 알려주세요.
- **제휴·광고 문의**: 제휴 여부가 제품 평가에 영향을 주지 않는다는 원칙에 동의하시는 경우에 한해 진행합니다.
`;

export default function Page() { return <StaticPage title="문의" md={md} />; }
