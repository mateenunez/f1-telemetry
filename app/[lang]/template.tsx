import PageEntrance from "@/components/PageEntrance";

export default function LangTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageEntrance>{children}</PageEntrance>;
}
