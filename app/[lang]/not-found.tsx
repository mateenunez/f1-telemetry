import Link from "next/link";
import { Button } from "@/components/ui/button";
import { headers } from "next/headers";

const messages = {
  en: ["Page", "not", "found"],
  es: ["Página", "no", "encontrada"],
};

export default async function NotFound() {
  const headersList = headers();
  const domain = (await headersList).get("referer") || "";
  const isEs = domain.includes("/es/");
  const lang = isEs ? "es" : "en";
  const messageParts = messages[lang];

  return (
    <div className="min-h-screen bg-warmBlack flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8 max-w-2xl w-full">
        <div className="relative w-full flex flex-row items-center gap-4 justify-center">
          <h1 className="text-9xl font-bold text-f1Yellow tracking-wide font-geist">
            404
          </h1>
          <div className="flex flex-col">
            {messageParts.map((part: string, index: number) => (
              <h1
                key={index}
                className="text-2xl font-bold text-f1Yellow opacity-70 tracking-wide font-geist"
              >
                {part}
              </h1>
            ))}
          </div>
        </div>
        <Link href={`/`}>
          <Button
            size="lg"
            className="bg-transparent font-geist text-lg border-2 border-f1Yellow rounded-lg hover:bg-f1Yellow/90 text-gray-200 hover:text-warmBlack hover:border-warmBlack"
          >
            Box!
          </Button>
        </Link>
      </div>
    </div>
  );
}
