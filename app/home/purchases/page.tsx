import { permanentRedirect } from "next/navigation";

export default function PurchasesRedirect() {
  permanentRedirect("/home/transactions?tab=purchases");
}