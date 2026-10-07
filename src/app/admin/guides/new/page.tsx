import { requireAdmin } from "@/lib/auth";
import AdminNav from "../../AdminNav";
import GuideForm from "../GuideForm";
export default async function NewGuide() { await requireAdmin(); return (<><AdminNav title="가이드 작성" /><GuideForm /></>); }
