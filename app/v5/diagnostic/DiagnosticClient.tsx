"use client";

import { useSearchParams } from "next/navigation";
import DiagnosticForm from "../components/forms/DiagnosticForm";

export default function DiagnosticClient() {
  const params = useSearchParams();
  const raw = params.get("profil");
  const profile = raw === "homme" || raw === "femme" || raw === "afro" ? raw : undefined;
  return <DiagnosticForm initialProfile={profile} />;
}
