import "@/app/globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    template: "%s | Block Builder",
    default: "Block Builder",
  },
  description: "View a published Block Builder board",
};

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-[#F3FFE1]/20`}>
      {children}
    </div>
  );
}
