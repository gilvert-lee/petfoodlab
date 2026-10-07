import { requireAdmin } from "@/lib/auth";
import { listBrands } from "@/lib/queries";
import AdminNav from "../../AdminNav";
import ProductForm from "../ProductForm";

export default async function NewProduct() {
  await requireAdmin();
  return (<><AdminNav title="제품 추가" /><ProductForm brands={listBrands()} /></>);
}
