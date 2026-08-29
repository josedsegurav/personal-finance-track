import { permanentRedirect } from "next/navigation";

export default function ExpensesRedirect() {
  permanentRedirect("/home/transactions?tab=expenses");
}