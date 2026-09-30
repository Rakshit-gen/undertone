import Link from "next/link";
import { Sky } from "@/components/Sky";
import { Studio } from "@/components/Studio";
import { ThemeToggle } from "@/components/ThemeToggle";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Sky />
      <div className={styles.page}>
        <header className={styles.header}>
          <Link href="/" className={styles.mark}>Undertone</Link>
          <ThemeToggle />
        </header>

        <main>
          <div className={styles.intro}>
            <h1>Read it the way they will.</h1>
            <p>Write your message. Undertone checks every sentence for tone as you type and tells you how it&apos;s likely to land.</p>
          </div>
          <Studio />
        </main>

        <footer className={styles.footer}>
          <p>Each read asks Jev, TypeSafe AI&apos;s judgement model, a few hundred small questions at once. Messages aren&apos;t stored.</p>
        </footer>
      </div>
    </>
  );
}
