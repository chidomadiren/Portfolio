import { redirect } from "next/navigation";

export default function CheckInIndex() {
  redirect("/checkin/scan");
}
