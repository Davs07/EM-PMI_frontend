import Image from "next/image";
import Link from "next/link";

export default function Logo() {
    return (
        <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
                <Image
                    src={"/logo.svg"}
                    alt="Logo"
                    height={"150"}
                    width={"150"}
                />
            </Link>
        </div>
    )
}