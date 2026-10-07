import { requireAdmin } from "@/lib/auth";
import AdminNav from "../../AdminNav";
import IngredientForm from "../IngredientForm";
export default async function NewIngredient() { await requireAdmin(); return (<><AdminNav title="성분 추가" /><IngredientForm /></>); }
