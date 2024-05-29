import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="mt-auto border-t border-black/5 py-5">
      <small className="opacity-50">
        &copy; 2024 PetSoft. All rights reserved. Created by{" "}
        <Link href="https://github.com/rncrmn" target="_blank">
          Aaron Carmen
        </Link>
        .
      </small>
    </footer>
  );
}
